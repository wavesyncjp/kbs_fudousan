import { Component, Inject, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MatCheckbox } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Code } from '../models/bukken';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { RentalInfo } from '../models/rentalinfo';
import { RentalContract } from '../models/rentalcontract';

@Component({
  selector: 'app-rentalContract-detail',
  templateUrl: './rentalContract-detail.component.html',
  styleUrls: ['./rentalContract-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class RentalContractDetailComponent extends BaseComponent {

  pid: number;
  rentalInfoPid: number;
  
  public contractSellerInfos = [];// 所有者名
  public residentInfos = [];// 入居者情報
  public rental: RentalInfo;
  public contractInfoPid: number;// 仕入契約情報PID
  public locationInfoPid: number;// 所在地情報PID

  residentInfoPids:Code[];// 入居者情報
  bankPids: Code[];
  locationInfoPids:Code[];
  contractSellerInfoPids:Code[];
  receiveTypes: Code[];

  constructor(public router: Router,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public dialogRef: MatDialogRef<RentalInfo>,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              @Inject(MAT_DIALOG_DATA) public data: RentalContract) {
      super(router, service,dialog);
      this.rentalInfoPid = data.rentalInfoPid;
      this.contractInfoPid = data.contractInfoPid;
      this.locationInfoPid = data.locationInfoPid;
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('賃貸契約詳細');
    this.spinner.show();

    const funcs = [];
    funcs.push(this.service.getCodes(['043', '044', '045']));
    funcs.push(this.service.getBanks('1'));
    let cond = {
      searchFor: 'searchSellerName'
      ,contractInfoPid: this.contractInfoPid
    };

    if (this.data.pid > 0 && this.data.locationInfoPid == null) {
      this.locationInfoPid = this.data.locationInfoPidForSearch;
    }
    // 所有者名を取得
    funcs.push(this.service.commonSearch(cond));

    // 入居者を取得
    let cond2 = {
      searchFor: 'searchResident'
      ,locationInfoPid: this.locationInfoPid
    };
    funcs.push(this.service.commonSearch(cond2));
    
    funcs.push(this.service.rentalGet(this.rentalInfoPid, true));

    funcs.push(this.service.searchReceiveType(null));

    Promise.all(funcs).then(values => {
      // コード
      this.processCodes(values[0] as Code[]);

      this.banks = values[1];
      this.bankPids = this.getBanks();

      this.contractSellerInfos = values[2];
      this.contractSellerInfoPids = this.contractSellerInfos.map(loc => new Code({codeDetail: loc.pid, name: loc.contractorName}));

      this.residentInfos = values[3];
      this.residentInfoPids = this.residentInfos.map(loc => new Code({codeDetail: loc.pid, name: loc.roomNo}));

      this.rental = new RentalInfo(values[4] as RentalInfo);

      this.recTypes = values[5];
      this.receiveTypes = this.getReceiveTypes();

      this.data.convert();

      this.spinner.hide();
    });
  }

  /**
   * 数値にカンマを付ける作業
   * @param val 
   * @returns 
   */
  changeValue(val) {
    val = this.numberFormat(val);
    return val;
  }

  /**
   * 登録
   */
  save() {
    if (!this.validate()) {
      return;
    }

    const dlg = new Dialog({title: '確認', message: '賃貸契約を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        if(!this.data.pid || this.data.pid < 1){
          this.data.rentalInfoPid = this.rental.pid;
          this.data.contractInfoPid = this.contractInfoPid;
          this.data.locationInfoPid = this.locationInfoPid;
          this.data.tempLandInfoPid = this.rental.tempLandInfoPid;
        }
        else if (this.data.locationInfoPid == null) {
          this.data.locationInfoPid = this.locationInfoPid;
        }

        this.data.convertForSave(this.service.loginUser.userId, this.datepipe, true);

        this.service.rentalContractSave(this.data).then(values => {
          const finishDlg = new Dialog({title: '完了', message: '賃貸契約を登録しました。'});
          
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });

          dlgVal.afterClosed().subscribe(res => {
            this.data = new RentalContract(values);
            this.spinner.hide();
            this.dialogRef.close({data: this.data, isSave: true});
          });
        });
      }
    });
  }

  /**
   * 賃貸契約削除
   */
  deleteRentalContract() {
    const dlg = new Dialog({title: '確認', message: '賃貸契約を削除してよろしいですか？'});
    const dlgRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dlgRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.deleteRentalContract(this.data).then(res => {

          this.spinner.hide();
          this.dialogRef.close({data: this.data, isDelete: true});
        });
      }
    });
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};
    
    this.checkBlank(this.data.residentInfoPid, 'residentInfoPid', '部屋番号は必須です。');
    if (this.data.loanPeriodStartDateMap && this.data.loanPeriodEndDateMap 
      && this.data.loanPeriodEndDateMap < this.data.loanPeriodStartDateMap) {
      this.errorMsgs.push('契約期間は不正です。' );
      this.errors['loanPeriodEndDate'] = true;
    }

    if (this.data.contractEndNotificationStartDateMap && this.data.contractEndNotificationEndDateMap
      && this.data.contractEndNotificationEndDateMap < this.data.contractEndNotificationStartDateMap) {
      this.errorMsgs.push('契約終了通知をすべき期間は不正です。' );
      this.errors['contractEndNotificationEndDate'] = true;
    }

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * キャンセル
   */
  cancel() {
    this.spinner.hide();
    this.dialogRef.close({data: this.data});
  }

  /**
   * 部屋番号変更
   */
  changeRoomNo(event) {
    if (event.target.value !== '') {
      this.data.borrowerName = this.residentInfos.filter(c=>c.pid == event.target.value).map(c => c.borrowerName)[0];
    } else {
      this.data.borrowerName = '';
    }
  }

  /**
   * チェックボックス変更
   * @param event ：イベント
   * @param flg ：敷金返還済フラグ
   */
  changeDepositConvertedFlg(event, flg: any) {
    flg.depositConvertedFlg = (event.checked ? 1 : 0);
    this.data.depositConvertedFlg = flg.depositConvertedFlg;
  }

  /**
   * チェックボックス変更
   * @param event ：イベント
   * @param flg ：駐車場敷金返還済フラグ
   */
  changeParkingDepositConvertedFlg(event, flg: any) {
    flg.parkingDepositConvertedFlg = (event.checked ? 1 : 0);
    this.data.parkingDepositConvertedFlg = flg.parkingDepositConvertedFlg;
  }

  /**
   * チェックボックス変更
   * @param event ：イベント
   * @param flg ：賃貸保証料返還済フラグ
   */
  changeRoomRentGuaranteeFeeConvertedFlg(event, flg: any) {
    flg.roomRentGuaranteeFeeConvertedFlg = (event.checked ? 1 : 0);
    this.data.roomRentGuaranteeFeeConvertedFlg = flg.roomRentGuaranteeFeeConvertedFlg;
  }
}
