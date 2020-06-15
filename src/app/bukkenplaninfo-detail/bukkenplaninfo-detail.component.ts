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

  calTsubo(val) {
    if (!isNullOrUndefined(this.data.salesLandArea)) {
      return Math.floor(val * 0.3025 * 100) / 100;
    } else {
      return '0';
    }
  }



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
