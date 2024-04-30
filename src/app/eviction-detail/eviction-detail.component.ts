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
import { EvictionInfoAttach } from '../models/evictioninfoattach';
import { Contractinfo } from '../models/contractinfo';
import { EvictionDepositInfo } from '../models/evictiondeposittinfo';

@Component({
  selector: 'app-eviction-detail',
  templateUrl: './eviction-detail.component.html',
  styleUrls: ['./eviction-detail.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})
export class EvictionInfoDetailComponent extends BaseComponent {

  pid: number;

  public residentInfos = [];// 入居者情報
  public contractInfoPid: number;// 仕入契約情報PID
  public tempLandInfoPid: number;// 土地情報PID

  bankPids: Code[];
  locationInfoPids: Code[];
  residentInfoPids: Code[];// 入居者情報
  rentalInfoPids: Code[];// 賃貸Pids
  contractSellerInfoPids: Code[];
  residentInfoPidTemp: number;// 20231027 Add

  // 20240402 S_Add
  residentInfoPidsFilter: any[];// 入居者情報
  // 20240402 E_Add

  constructor(public router: Router,
    public service: BackendService,
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<Contractinfo>,
    public dialog: MatDialog,
    public datepipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: EvictionInfo) {
    super(router, service, dialog);
    this.contractInfoPid = data.contractInfoPid;
    this.tempLandInfoPid = data.tempLandInfoPid;
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('賃貸契約詳細');
    this.spinner.show();

    const funcs = [];
    // 20240402 S_Update
    // funcs.push(this.service.getCodes(['045']));
    funcs.push(this.service.getCodes(['045', '048']));
    // 20240402 E_Update

    // 20231019 S_Delete
    // let cond = {
    //   searchFor: 'searchResident'
    //   , tempLandInfoPid: this.tempLandInfoPid
    // };
    // funcs.push(this.service.commonSearch(cond));
    // 20231019 E_Delete

    let cond2 = {
      searchFor: 'searchRentalApartment'
      , contractInfoPid: this.contractInfoPid
    };
    funcs.push(this.service.commonSearch(cond2));

    if (this.data.pid > 0) {
      funcs.push(this.service.evictionAttachSearch(this.data.pid));
    }

    Promise.all(funcs).then(values => {
      // コード
      this.processCodes(values[0] as Code[]);

      // 20231019 S_Update
      // this.residentInfos = values[1];
      // this.residentInfoPids = this.residentInfos.map(loc => new Code({ codeDetail: loc.pid, name: loc.roomNo }));

      // let rentalApartments = values[2];
      // this.rentalInfoPids = rentalApartments.map(item => new Code({ codeDetail: item.pid, name: item.apartmentName }));

      // if (this.data.pid > 0) {
      //   this.data.evictionFiles = values[3];
      // }
      let rentalApartments = values[1];
      this.rentalInfoPids = rentalApartments.map(item => new Code({ codeDetail: item.pid, name: item.apartmentName, displayOrder: item.locationInfoPid }));
      if (this.data.pid > 0) {
        // 20231027 S_Update
        // this.data.evictionFiles = values[1];
        this.data.evictionFiles = values[2];
        // 20231027 E_Update
        this.getResidentInfos(this.data.locationInfoPid);
      }
      // 20231019 E_Update
      // 20231027 S_Add
      else if (this.data.rentalInfoPid > 0) {
        this.residentInfoPidTemp = this.data.residentInfoPid;
        this.getResidentInfosSub(this.data.rentalInfoPid);
      }
      // 20231027 E_Add

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

    const dlg = new Dialog({ title: '確認', message: '立退き情報を登録しますが、よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        if (!this.data.pid || this.data.pid < 1) {
          this.data.contractInfoPid = this.contractInfoPid;
          this.data.tempLandInfoPid = this.tempLandInfoPid;
        }
        this.data.convertForSave(this.service.loginUser.userId, this.datepipe, true);

        this.service.evictionSave(this.data).then(values => {
          // 20231027 S_Add
          if (values.statusMap === 'NG') {
            this.dialog.open(FinishDialogComponent, {
              width: '500px', height: '250px',
              data: new Dialog({ title: 'エラー', message: values.msgMap })
            });
          }
          else {
            // 20231027 E_Add
            const finishDlg = new Dialog({ title: '完了', message: '立退き情報を登録しました。' });
            const dlgVal = this.dialog.open(FinishDialogComponent, {
              width: '500px',
              height: '250px',
              data: finishDlg
            });
            dlgVal.afterClosed().subscribe(res => {

              this.data = new EvictionInfo(values);
              this.spinner.hide();
              this.dialogRef.close({ data: this.data, isSave: true });
            });
          }// 20231027 Add
        });
      }
    });
  }

  /**
   * 立ち退き削除
   */
  deleteEviction() {
    const dlg = new Dialog({ title: '確認', message: '立退きを削除してよろしいですか？' });
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
          // 20231101 S_Update
          // this.dialogRef.close({ data: this.data, isDelete: true });
          if (res.statusMap === 'NG') {
            this.dialog.open(FinishDialogComponent, {
              width: '500px', height: '250px',
              data: new Dialog({ title: 'エラー', message: res.msgMap })
            });
          }
          else {
            this.dialogRef.close({ data: this.data, isDelete: true });
          }
          // 20231101 E_Update
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
    // 20240402 S_Update
    // this.checkBlank(this.data.residentInfoPid, 'residentInfoPid', '部屋番号は必須です。');
    let roomNoCheck = this.data.roomNo;
    if (this.data.residentInfoPid != null && this.data.residentInfoPid != 0) {
      roomNoCheck += this.data.residentInfoPid.toString();
    }
    this.checkBlank(roomNoCheck, 'residentInfoPid', '部屋番号は必須です。');
    // 20240402 E_Update
    // 20231027 S_Add
    this.checkBlank(this.data.surrenderScheduledDateMap, 'surrenderScheduledDate', '明渡予定日は必須です。');
    // 20231027 E_Add

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
    this.dialogRef.close({ data: this.data });
  }

  /**
   * 部屋番号変更
   */
  // 20240402 S_Delete
  // changeRoomNo(event) {
  //   // 20231027 S_Add
  //   // if (event.target.value !== '') {
  //   //   const item = this.residentInfos.filter(c => c.pid == event.target.value)[0];
  //   //   this.data.borrowerName = item.borrowerName;
  //   //   // this.data.locationInfoPid = item.locationInfoPid;// 20231019 Delete
  //   // } else {
  //   //   this.data.borrowerName = '';
  //   //   // this.data.locationInfoPid = null;// 20231019 Delete
  //   // }
  //   this.changeRoomNoSub(event.target.value);
  //   // 20231027 E_Add
  // }
  // 20240402 E_Delete

  // 20231027 S_Add
  /**
   * 部屋番号変更
   */
  changeRoomNoSub(residentInfoPid) {
    // 20240402 S_Update
    // if (residentInfoPid !== '') {
    //   const item = this.residentInfos.filter(c => c.pid == residentInfoPid)[0];
    //   this.data.borrowerName = item.borrowerName;
    // }
    // else {
    //   this.data.borrowerName = '';
    // }
    if (residentInfoPid != null && residentInfoPid !== '') {
      const item = this.residentInfos.filter(c => c.pid == residentInfoPid)[0];
      this.data.borrowerName = item.borrowerName;
    }
    // 20240402 E_Update
  }
  // 20231027 E_Add


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
    const dlg = new Dialog({ title: '確認', message: 'ファイルを削除します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteEvictionAttach(f.pid).then(res => {
          this.data.evictionFiles.splice(this.data.evictionFiles.indexOf(f), 1);
        });
      }
    });
  }

  // 20231019 S_Add
  /**
   * 賃貸情報変更
   */
  changeByRentalInfoPid(event) {
    // 20231027 S_Add
    // if (event.target.value !== '') {
    //   let locationInfoPid = this.rentalInfoPids.filter(a => a.codeDetail == event.target.value)[0].displayOrder;
    //   this.data.locationInfoPid = locationInfoPid;
    //   this.getResidentInfos(locationInfoPid);

    // } else {
    //   this.residentInfos = [];
    //   this.residentInfoPids = [];
    //   this.data.locationInfoPid = null;
    // }
    // this.data.residentInfoPid = null;
    // this.data.borrowerName = '';
    this.getResidentInfosSub(event.target.value);
    // 20231027 E_Add
  }
  // 20231027 S_Add
  /**
   * 賃貸情報変更
   */
  getResidentInfosSub(rentalInfoPid: any) {
    if (rentalInfoPid !== '') {
      let locationInfoPid = this.rentalInfoPids.filter(a => a.codeDetail == rentalInfoPid)[0].displayOrder;
      this.data.locationInfoPid = locationInfoPid;
      this.getResidentInfos(locationInfoPid);
    } else {
      this.residentInfos = [];
      this.residentInfoPids = [];
      this.residentInfoPidsFilter = this.residentInfoPids;// 20240402 Add
      this.data.locationInfoPid = null;

      // 20240402 S_Add
      this.data.residentInfoPid = null;
      this.data.borrowerName = '';
      this.data.roomNo = '';
      // 20240402 E_Add
    }
    // 20240402 S_Delete
    // // 20231027 S_Add
    // if (this.residentInfoPidTemp > 0) {
    //   this.data.residentInfoPid = this.residentInfoPidTemp;
    //   this.residentInfoPidTemp = 0;
    // }
    // // 20231027 E_Add
    // else {// 20231027 Add
    //   this.data.residentInfoPid = null;
    //   this.data.borrowerName = '';
    // }// 20231027 Add
    // 20240402 E_Delete
  }
  // 20231027 E_Add
  /**
   * 入居者情報を取得
   */
  getResidentInfos(locationInfoPid: number) {
    const funcs = [];

    let cond = {
      searchFor: 'searchResident'
      , tempLandInfoPid: this.tempLandInfoPid
      , locationInfoPid: locationInfoPid
    };
    funcs.push(this.service.commonSearch(cond));

    Promise.all(funcs).then(values => {
      this.residentInfos = values[0];
      this.residentInfoPids = this.residentInfos.map(loc => new Code({ codeDetail: loc.pid, name: loc.roomNo }));
      this.residentInfoPidsFilter = this.residentInfoPids;// 20240402 Add

      // 20231027 S_Add
      if (this.residentInfoPidTemp > 0) {
        this.changeRoomNoSub(this.residentInfoPidTemp);
        // 20240402 S_Add
        this.data.residentInfoPid = this.residentInfoPidTemp;
        this.residentInfoPidTemp = 0;
        this.data.roomNo = this.residentInfoPids.filter(a => a.codeDetail == this.data.residentInfoPid.toString())[0].name;
        // 20240402 E_Add
      }
      // 20231027 E_Add
    });
  }
  // 20231019 E_Add

  // 20240402 S_Add
  /**
   * 部屋番号入力の際、入居者情報を検索する
   */
  residentSearch() {
    this.residentInfoPidsFilter = this.residentInfoPids.filter(item => `${item.name}`.includes(this.data.roomNo));
    if (this.residentInfoPidsFilter.length === 1) {
      this.data.residentInfoPid = Number(this.residentInfoPidsFilter[0].codeDetail);
    }
    else {
      this.data.residentInfoPid = null;
    }
    this.changeRoomNoSub(this.data.residentInfoPid);
  }

  /**
   * チェックボックス変更
   * @param event ：イベント
   * @param flg ：フラグ
   返還敷金(保証金)返還済フラグ*/
  changeReturnDepositFlg(event, flg: any) {
    flg.returnDepositFlg = (event.checked ? 1 : 0);
    this.data.returnDepositFlg = flg.returnDepositFlg;
  }
  addDeposit() {
    if (this.data.depositsMap == null) {
      this.data.depositsMap = [];
    }
    this.data.depositsMap.push(new EvictionDepositInfo());
  }
  deleteDeposit(pos: number) {
    this.data.depositsMap.splice(pos, 1);
  }
  // 20240402 E_Add
}
