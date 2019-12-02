import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MatDialog, MatCheckbox } from '@angular/material';
import { Information } from '../models/information';
import { BackendService } from '../backend.service';
import { Code } from '../models/bukken';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { Checklib } from '../utils/checklib';
import { JPDateAdapter } from '../adapters/adapters';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { FileComponentComponent } from '../uicomponent/file-component/file-component.component';

@Component({
  selector: 'app-dep-detail',
  templateUrl: './dep-detail.component.html',
  styleUrls: ['./dep-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class DepDetailComponent extends BaseComponent {

  @ViewChild('fUpload', {static: true})
  fUpload: FileComponentComponent;

  @ViewChild('cbxFinishFlg', {static: true})
  cbxFinishFlg: MatCheckbox;

  constructor(
              public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<DepDetailComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: Information) {
    super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    const funcs = [];
    funcs.push(this.service.getCodes(['006']));
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

      if (this.data == null || !(this.data.pid > 0)) {
        this.data = new Information();
        this.data.detailFlg = '1';
      } else {
        this.data = new Information(this.data);
        this.data.convert();
      }

    });
  }

  hasFile() {
    return this.data.attachFileName != null && this.data.attachFileName !== '';
  }

  /**11/25 追記
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    // 日付
    if (this.data.infoDateMap == null) {
      this.errorMsgs.push('日付は必須です。');
      const prop = 'infoDate';
      this.errors[prop] = true;
    }

    // 件名
    if (Checklib.isBlank(this.data.infoSubject)) {
      this.errorMsgs.push('件名は必須です。');
      const prop = 'infoSubject';
      this.errors[prop] = true;
    }

    // 明細
    if (this.data.detailFlg === '1' && Checklib.isBlank(this.data.infoDetail)) {
      this.errorMsgs.push('詳細は必須です。');
      const prop = 'infoDetail';
      this.errors[prop] = true;
    }

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  ok() {
    if (!this.validate()) {
      return;
    }

    // 登録
    const dlgObj = new Dialog({title: '確認', message: '登録しますが、よろしいですか？'});
    const dlg = this.dialog.open(ConfirmDialogComponent, {width: '500px',　height: '250px',　data: dlgObj});

    dlg.afterClosed().subscribe(result => {
      if (dlgObj.choose) {
        this.data.convertForSave(this.service.loginUser.userId);
        if (this.cbxFinishFlg.checked) {
          this.data.finishFlg = '1';
        } else {
          this.data.finishFlg = '0';
        }
        this.service.saveInfo(this.data).then(res => {
          if (this.fUpload != null && !this.fUpload.hasFile()) {
            this.dialogRef.close(true);
          } else {
            this.fUpload.uploadInfoFile(res.pid);
          }
        });
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  /**
   * ファイルアップロード
   * @param event ：アップロード完了
   */
  uploaded(event) {
    this.dialogRef.close(true);
  }
}
