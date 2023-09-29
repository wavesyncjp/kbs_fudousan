import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { RentalInfo } from '../models/rentalinfo';
import { Code } from '../models/bukken';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Dialog } from '../models/dialog';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { Util } from '../utils/util';
import { RentalContractDetailComponent } from '../rentalContract-detail/rentalContract-detail.component';
import { RentalContract } from '../models/rentalcontract';
import { RentalReceive } from '../models/rentalreceive';

@Component({
  selector: 'app-rental-detail',
  templateUrl: './rental-detail.component.html',
  styleUrls: ['./rental-detail.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})
export class RentalInfoDetailComponent extends BaseComponent {

  @ViewChild('topElement', { static: true }) topElement: ElementRef;

  public locationInfos = [];// 地番　家屋番号
  public contractSellerInfos = [];// 所有者名

  public rental: RentalInfo;
  public pid: number;
  public contractInfoPid: number;// 仕入契約情報PID
  public tempLandInfoPid: number;// 土地情報PID
  public receiveAllFlg: string;

  public rentalContracts = [];//賃貸契約
  public rentalReceives = [];//賃貸入金
  public rentalReceivesBk = [];//賃貸入金（変更前）

  bankPids: Code[];
  locationInfoPids: Code[];
  contractSellerInfoPids: Code[];
  locationNumbers: Code[];
  locationInfoPidDB: number;// DBの所在地情報PID

  constructor(public router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public service: BackendService,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe) {
    super(router, service, dialog);
    this.route.queryParams.subscribe(params => {
      this.pid = params.pid;
      this.contractInfoPid = params.contractInfoPid;
      this.tempLandInfoPid = params.tempLandInfoPid;
    });

    this.rental = new RentalInfo();
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('賃貸情報詳細');

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();

    const funcs = [];

    funcs.push(this.service.getCodes(['005', '043', '046']));
    funcs.push(this.service.getBanks('1'));

    //地番　家屋番号を取得
    let cond = {
      searchFor: 'searchLocationNumber'
      , contractInfoPid: this.contractInfoPid
    };
    funcs.push(this.service.commonSearch(cond));

    //所有者名を取得
    cond.searchFor = 'searchSellerName';
    funcs.push(this.service.commonSearch(cond));

    if (this.pid > 0) {
      funcs.push(this.service.rentalGet(this.pid));
    }

    Promise.all(funcs).then(values => {
      // コード
      this.processCodes(values[0] as Code[]);

      this.banks = values[1];
      this.bankPids = this.getBanks();

      this.locationInfos = values[2];
      this.locationInfoPids = this.locationInfos.filter(loc => (loc.blockNumber != null && loc.blockNumber != '') || (loc.buildingNumber != null && loc.buildingNumber != '')).map(loc => new Code({ codeDetail: loc.locationInfoPid, name: loc.blockNumber ?? '' + ' ' + loc.buildingNumber ?? '' }));

      this.contractSellerInfos = values[3];
      this.contractSellerInfoPids = this.contractSellerInfos.map(loc => new Code({ codeDetail: loc.pid, name: loc.contractorName }));

      // 賃貸あり場合
      if (this.pid > 0) {
        this.rental = new RentalInfo(values[4] as RentalInfo);
        this.locationInfoPidDB = this.rental.locationInfoPid;

        this.rentalContracts = values[4].rentalContracts;
        this.rentalReceives = values[4].rentalReceives;

        this.backupRentalReceive();

        this.rental.convert();
      } else {
        this.rental = new RentalInfo();
      }
      this.spinner.hide();
    });
  }

  /**
   * 賃貸入金の変更前データ
   */
  backupRentalReceive() {
    this.rentalReceivesBk = [];
    this.rentalReceives.forEach(r => {
      r.details.forEach(d => {
        this.rentalReceivesBk.push(<RentalReceive>Util.deepCopy(d, 'RentalReceive'));
      });
    });
  }

  //数値にカンマを付ける作業
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
    const dlg = new Dialog({ title: '確認', message: '賃貸情報を登録しますが、よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();

        let isNeedReload = false;
        if (!this.rental.pid || this.rental.pid < 1) {
          this.rental.contractInfoPid = this.contractInfoPid;
          this.rental.tempLandInfoPid = this.tempLandInfoPid;
        }
        else if (this.locationInfoPidDB != this.rental.locationInfoPid) {
          isNeedReload = true;
        }
        this.rental.convertForSave(this.service.loginUser.userId, this.datepipe);

        if (this.rental.pid > 0) {
          this.rental.rentalReceivesChanged = this.getReceivesChanged();
        }

        this.service.rentalSave(this.rental).then(res => {
          const finishDlg = new Dialog({ title: '完了', message: '賃貸情報を登録しました。' });

          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });

          dlgVal.afterClosed().subscribe(val => {
            this.spinner.hide();
            this.rental = new RentalInfo(res);
            this.locationInfoPidDB = this.rental.locationInfoPid;
            this.rental.convert();
            if (isNeedReload) {
              this.searchRentalContract_Receive();
            }
            else {
              this.backupRentalReceive();
            }
            this.router.navigate(['/rendetail'], { queryParams: { pid: this.rental.pid, contractInfoPid: this.rental.contractInfoPid } });
          });
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

    this.checkBlank(this.rental.locationInfoPid, 'locationInfoPid', '地番 家屋番号は必須です。');
    this.checkBlank(this.rental.apartmentName, 'apartmentName', '建物名は必須です。');

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * 一覧へ戻る
   */
  backToList() {
    this.router.navigate(['/rentals'], { queryParams: { search: '1' } });
  }

  /**
   * 契約情報遷移
   */
  toContract() {
    this.router.navigate(['/ctdetail'], { queryParams: { pid: this.contractInfoPid } });
  }

  /**
   * 賃貸契約追加
   */
  addRentalContract(): void {
    const data = new RentalContract();
    data.rentalInfoPid = this.rental.pid;
    data.contractInfoPid = this.rental.contractInfoPid;
    data.tempLandInfoPid = this.rental.tempLandInfoPid;
    data.locationInfoPid = this.locationInfoPidDB;

    const dialogRef = this.dialog.open(RentalContractDetailComponent, {
      width: '98%',
      height: '650px',
      data: data
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isSave) {
        this.rentalContracts.push(result.data);
        this.searchRentalReceive();
      }
    });
  }

  /**
   * 賃貸契約詳細
   * @param obj : 賃貸契約
   */
  showRentalContract(obj: RentalContract, pos: number) {
    obj.locationInfoPidForSearch = this.locationInfoPidDB;
    const dialogRef = this.dialog.open(RentalContractDetailComponent, {
      width: '98%',
      height: '650px',
      data: <RentalContract>Util.deepCopy(obj, 'RentalContract')
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result.isSave || result.isDelete) {
          if (result.isSave) {
            this.rentalContracts[pos] = new RentalContract(result.data);
          } else if (result.isDelete) {
            this.rentalContracts.splice(pos, 1);
          }
        }
        this.searchRentalReceive();
      }
    });
  }

  /**
   * 賃貸契約コピー
   * @param obj 賃貸契約
   */
  copyRentalContract(obj: RentalContract) {
    const data = new RentalContract(obj);
    data.pid = null;

    const dialogRef = this.dialog.open(RentalContractDetailComponent, {
      width: '98%',
      height: '550px',
      data: data
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {

      if (result && result.isSave) {
        this.rentalContracts.push(result.data);
        this.searchRentalReceive();
      }
    });
  }
  /**
   * 賃貸契約削除
   * @param obj 賃貸契約
   * @param pos 
  */
  deleteRentalContract(obj: RentalContract, pos: number) {
    const dlg = new Dialog({ title: '確認', message: '削除してよろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteRentalContract(obj).then(res => {
          this.rentalContracts.splice(pos, 1);
          this.searchRentalReceive();
        });
      }
    });
  }

  /**
   * 賃貸入金を取得
   */
  searchRentalReceive() {
    const funcs = [];

    let cond = {
      searchFor: 'searchRentalReceive'
      , rentalInfoPid: this.rental.pid
    };
    funcs.push(this.service.commonSearch(cond));

    Promise.all(funcs).then(values => {
      this.rentalReceives = values[0];

      this.backupRentalReceive();
    });
  }

  /**
   * 賃貸契約・入金を取得
   */
  searchRentalContract_Receive() {
    const funcs = [];

    let cond = {
      searchFor: 'searchRentalContract_Receive'
      , rentalInfoPid: this.rental.pid
    };
    funcs.push(this.service.commonSearch(cond));

    Promise.all(funcs).then(values => {
      this.rentalContracts = values[0].rentalContracts;
      this.rentalReceives = values[0].rentalReceives;

      this.backupRentalReceive();
    });
  }

  /**
   * 変更された賃貸入金を取得
   * @returns 
   */
  getReceivesChanged() {
    let listChangeds = [];

    this.rentalReceives.forEach(r => {
      r.details.forEach(d => {
        let objBk = this.rentalReceivesBk.filter(b => b.pid == d.pid)[0];

        if (objBk.receiveFlg != d.receiveFlg) {
          listChangeds.push(d);
        }
      });
    });
    return listChangeds;
  }

  /**
   * 一括入金フラグを変更
   * @param event 
   */
  changeReceiveAllFlg(event) {
    this.receiveAllFlg = (event.checked ? '1' : '0');

    this.rentalReceives.forEach(r => {
      this.changeReceiveFlgGroup(event, r);
    });
  }

  /**
  * グループの入金フラグを変更
  * @param event 
  * @param flg 
  */
  changeReceiveFlgGroup(event, flg: any) {
    flg.receiveFlgGroup = (event.checked ? '1' : '0');

    let listDetails = this.rentalReceives.filter(a => a.receiveMonth == flg.receiveMonth);

    if (listDetails.length > 0) {
      for (var i = 0; i < listDetails.length; i++) {
        let details = listDetails[i].details;

        for (var d = 0; d < details.length; d++) {
          let item = details[d];
          let con = this.rentalContracts.filter(c => c.pid == item.rentalContractPid)[0];

          //賃料免除開始日以外
          if (!(this.isDisableByRenContract(item.receiveMonth, con.roomRentExemptionStartDate))) {
            item.receiveFlg = flg.receiveFlgGroup;
          }
        }
      }
    }
  }

  /**
  * 入金フラグを変更
  * @param event 
  * @param details 
  * @param renConPid 
  */
  changeReceiveFlg(event, details, renConPid) {
    let receiveFlg = (event.checked ? '1' : '0');
    let detail = details.filter(a => a.rentalContractPid == renConPid)[0];
    detail.receiveFlg = receiveFlg;

    this.rentalReceives.forEach(d => {
      var obj = d.details.filter(a => a.pid == detail.pid);
      if (obj != null) {
        obj.receiveFlg = receiveFlg;
        return false;
      }
    });
  }

  /**
   * 賃貸契約存在チェック
   * @param details 
   * @param renConPid 
   * @returns 
   */
  isExistRenContract(details, renConPid) {
    return details.filter(a => a.rentalContractPid == renConPid).length > 0;
  }

  /**
   * 賃料免除開始日の該当月以降は無効
   * @param receiveMonth 
   * @param roomRentExemptionStartDate 
   * @returns 
   */
  isDisableByRenContract(receiveMonth, roomRentExemptionStartDate) {
    return roomRentExemptionStartDate && roomRentExemptionStartDate.substring(0, 6) <= receiveMonth;
  }

  /**
  * 賃貸入金.入金日取得
  * @param details 賃貸入金
  * @param conPid 契約情報PID
  * @returns 
  */
  getReceiveDay(details, conPid) {
    return details.filter(a => a.rentalContractPid == conPid)[0].receiveDay;
  }

  /**
   * 入金フラグを取得
   * @param details 
   * @param conPid 
   * @returns 
   */
  getReceiveFlg(details, conPid) {
    return details.filter(a => a.rentalContractPid == conPid)[0].receiveFlg;
  }
}
