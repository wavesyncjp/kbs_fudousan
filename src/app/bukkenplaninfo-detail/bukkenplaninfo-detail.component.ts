import { Component, OnInit, Inject } from '@angular/core';
import { Locationinfo } from '../models/locationinfo';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Bukkensalesinfo } from '../models/bukkensalesinfo';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { Code } from '../models/bukken';
import { isNullOrUndefined } from 'util';




@Component({
  selector: 'app-bukkenplaninfo-detail',
  templateUrl: './bukkenplaninfo-detail.component.html',
  styleUrls: ['./bukkenplaninfo-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class BukkenplaninfoDetailComponent extends BaseComponent {

  pid: number;
  // 20201221 S_Add
  public cond: any;
  public locAdresses =[];
  // 20201221 E_Add

  // 20201225 S_Add
  selectAddresses = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'codeDetail',
    textField: 'name',
    searchPlaceholderText: '検索',
    // 20210106 S_Update
//    itemsShowLimit: 3,
    itemsShowLimit: 1,
    // 20210106 E_Update
    allowSearchFilter: true,
    enableCheckAll: false
  };
  // 20201225 E_Add


  constructor(public router: Router,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public dialogRef: MatDialogRef<Locationinfo>,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              @Inject(MAT_DIALOG_DATA) public data: Bukkensalesinfo) {
      super(router, service,dialog);
  }

  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('物件情報詳細');
    this.data = new Bukkensalesinfo(this.data);
    this.data.convert();

    const funcs = [];
    funcs.push(this.service.getCodes(null));
    // 20201221 S_Add
    // 売買対象（所在地）を取得
    this.cond = {
      tempLandInfoPid: this.data.tempLandInfoPid,
      // 20210106 S_Update
      //clctLocationType: ['01', '02']
      clctLocationType: ['01', '02', '04']
      // 20210106 E_Update
    };
    funcs.push(this.service.searchLocation(this.cond));
    // 20201221 E_Add

    Promise.all(funcs).then(values => {

      // コード
      const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }

      this.locAdresses = values[1];// 住所 20201221 Add

      //20201225 S_Add
      // 20210106 S_Update
      /*this.selectAddresses = this.locAdresses.map(locAdress => new Code({codeDetail: locAdress.pid, name: locAdress.address + (locAdress.blockNumber != null ? locAdress.blockNumber : '')}));*/
      this.selectAddresses = this.locAdresses.map(locAdress => new Code({codeDetail: locAdress.pid, name: (locAdress.address != null ? locAdress.address : '') + (locAdress.blockNumber != null ? locAdress.blockNumber : '') + (locAdress.address != null || locAdress.blockNumber != null ? '　' : '') + (locAdress.buildingNumber != null ? locAdress.buildingNumber : '')}));
      // 20210106 E_Update
      this.data.salesLocationMap = this.selectAddresses.filter(me => this.data.salesLocation.split(',').indexOf(me.codeDetail) >= 0).map(me => {return {codeDetail: me.codeDetail, name: me.name}});
      //20201225 E_Add
      
    });
  }

  save() {
    if (!this.validate()) {
      return;
    }    

    const dlg = new Dialog({title: '確認', message: '売り契約を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.data.convertForSave(this.service.loginUser.userId, this.datepipe, false);
        // 削除された所在地も送る

        this.service.saveBukkenSale(this.data).then(ret => {
          const finishDlg = new Dialog({title: '完了', message: '売り契約を登録しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(res => {
            this.data = new Bukkensalesinfo(ret);
            this.spinner.hide();
            this.dialogRef.close({data: this.data, isSave: true});
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
    return true;
  }
  //数値にカンマを付ける作業
  // 20200709 S_Add
  changeValue(val) {
    val = this.numberFormat(val);
    return val;
  }

  calTsubo(val) {
    if (!isNullOrUndefined(val)) {
      return Math.floor(this.getNumber(this.removeComma(val)) * 0.3025 * 100) / 100;
    } else {
      return '';
    }
  }

  // 20201221 S_Add
  /**
   * 売買対象（所在地）取得
   */
  /*
  getLocAdress() {
    if (this.locAdresses) {
      return this.locAdresses.map(locAdress => new Code({codeDetail: locAdress.pid, name: locAdress.address + (locAdress.blockNumber != null ? locAdress.blockNumber : '')}));
    } else {
      return [];
    }
  }
  */
  // 20201221 E_Add

  /**
   * 売り契約削除
   */
  delete() {
    const dlg = new Dialog({title: '確認', message: '売り契約を削除しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.data.convertForSave(this.service.loginUser.userId, this.datepipe, true);
        // 削除された所在地も送る

        this.service.saveBukkenSale(this.data).then(ret => {
          const finishDlg = new Dialog({title: '完了', message: '売り契約を削除しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(res => {
            this.data = new Bukkensalesinfo(ret);
            this.spinner.hide();
            this.dialogRef.close({data: this.data, isDelete: true});
          });
        });
      }
    });
  }

  cancel() {
    this.spinner.hide();
    this.dialogRef.close(false);
  }
}
