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
import { EvictionInfo } from '../models/evictioninfo';
import { EvictionInfoAttach} from '../models/evictioninfoattach';
import { Contractinfo } from '../models/contractinfo';

@Component({
  selector: 'app-eviction-detail',
  templateUrl: './eviction-detail.component.html',
  styleUrls: ['./eviction-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class EvictionInfoDetailComponent extends BaseComponent {

  pid: number;
  
  public residentInfos = [];// 入居者情報
  public contractInfoPid: number;// 仕入契約情報PID
  public tempLandInfoPid: number;// 土地情報PID
  
  bankPids: Code[];
  locationInfoPids:Code[];
  residentInfoPids:Code[];// 入居者情報
  rentalInfoPids:Code[];// 賃貸Pids
  contractSellerInfoPids:Code[];

  constructor(public router: Router,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public dialogRef: MatDialogRef<Contractinfo>,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              @Inject(MAT_DIALOG_DATA) public data: EvictionInfo) {
      super(router, service,dialog);
      this.contractInfoPid = data.contractInfoPid;
      this.tempLandInfoPid = data.tempLandInfoPid;
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('賃貸契約詳細');
    this.spinner.show();

    const funcs = [];
    funcs.push(this.service.getCodes(['045']));

    let cond = {
      searchFor: 'searchResident'
      ,tempLandInfoPid: this.tempLandInfoPid
    };
    funcs.push(this.service.commonSearch(cond));

    let cond2 = {
      searchFor: 'searchRentalApartment'
      ,contractInfoPid: this.contractInfoPid
    };
    funcs.push(this.service.commonSearch(cond2));

    if(this.data.pid > 0){
      funcs.push(this.service.evictionAttachSearch(this.data.pid));
    }

    Promise.all(funcs).then(values => {
      // コード
      this.processCodes(values[0] as Code[]);

      this.residentInfos = values[1];
      this.residentInfoPids = this.residentInfos.map(loc => new Code({codeDetail: loc.pid, name: loc.roomNo}));

      let rentalApartments = values[2];
      this.rentalInfoPids = rentalApartments.map(item => new Code({codeDetail: item.pid, name: item.apartmentName}));

      if (this.data.pid > 0) {
        this.data.evictionFiles = values[3];
      }
      
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

    const dlg = new Dialog({title: '確認', message: '立退き情報を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        if(!this.data.pid || this.data.pid < 1){
          this.data.contractInfoPid = this.contractInfoPid;
          this.data.tempLandInfoPid = this.tempLandInfoPid;
        }
        this.data.convertForSave(this.service.loginUser.userId, this.datepipe, true);

        this.service.evictionSave(this.data).then(values => {
          const finishDlg = new Dialog({title: '完了', message: '立退き情報を登録しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(res => {

            this.data = new EvictionInfo(values);
            this.spinner.hide();
            this.dialogRef.close({data: this.data, isSave: true});
          });
        });
      }
    });
  }

  /**
   * 立ち退き削除
   */
  deleteEviction() {
    const dlg = new Dialog({title: '確認', message: '立退きを削除してよろしいですか？'});
    const dlgRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dlgRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.deleteEviction(this.data).then(res => {

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

    this.checkBlank(this.data.rentalInfoPid, 'rentalInfoPid', '建物名は必須です。');
    this.checkBlank(this.data.residentInfoPid, 'residentInfoPid', '部屋番号は必須です。');

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
      const item = this.residentInfos.filter(c=>c.pid == event.target.value)[0];
      this.data.borrowerName = item.borrowerName;
      this.data.locationInfoPid = item.locationInfoPid;
    } else {
      this.data.borrowerName = '';
      this.data.locationInfoPid = null;
    }
  }

  /**
   * チェックボックス変更
   * @param event ：イベント
   * @param flg ：フラグ
   合意書取得済フラグ*/  
  changeAcquiredAgreementFlg(event, flg: any) {
    flg.acquiredAgreementFlg = (event.checked ? 1 : 0);
    this.data.acquiredAgreementFlg = flg.acquiredAgreementFlg;
  }

  /**
   * ファイルアップロード
   * @param event 
   */
  evictionUploaded(event) {
    if (this.data.evictionFiles === null || !this.data.evictionFiles) {
      this.data.evictionFiles = [];
    }
    const mapFile: EvictionInfoAttach = JSON.parse(JSON.stringify(event));
    this.data.evictionFiles.push(mapFile);
  }

  /**
   * ファイル削除
   * @param map : 削除したいファイル
   */
  deleteEvictionAttach(f: EvictionInfoAttach) {
    const dlg = new Dialog({title: '確認', message: 'ファイルを削除します。よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteEvictionAttach(f.pid).then(res => {
          this.data.evictionFiles.splice(this.data.evictionFiles.indexOf(f), 1);
        });
      }
    });
  }
}
