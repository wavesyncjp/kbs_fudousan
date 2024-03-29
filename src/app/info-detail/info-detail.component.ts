// 20230515 S_Update
// import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Component, OnInit, Inject, ViewChild, ViewChildren, QueryList } from '@angular/core';
// 20230515 E_Update
import { MatDialogRef, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MatDialog, MatCheckbox, MatRadioChange } from '@angular/material';
import { Information } from '../models/information';
import { BackendService } from '../backend.service';
import { Code } from '../models/bukken';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { Checklib } from '../utils/checklib';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FileComponentComponent } from '../uicomponent/file-component/file-component.component';

@Component({
  selector: 'app-info-detail',
  templateUrl: './info-detail.component.html',
  styleUrls: ['./info-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class InfoDetailComponent extends BaseComponent {

  // 20230515 S_Update
  // @ViewChild('fUpload', {static: true})
  // fUpload: FileComponentComponent;
  @ViewChildren(FileComponentComponent) fFiles: QueryList<FileComponentComponent>;
  // 20230515 E_Update

  @ViewChild('cbxFinishFlg', {static: true})
  cbxFinishFlg: MatCheckbox;

  // 20230317 S_Add
  authority = '';
  disableUser: boolean = false;
  // 20230317 E_Add

  constructor(
              public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<InfoDetailComponent>,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              @Inject(MAT_DIALOG_DATA) public data: Information) {
    super(router, service,dialog);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    //20230317 S_Add
    this.authority = this.service.loginUser.authority;
    this.disableUser = (this.authority === '03');
    //20230317 E_Add

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

  changeFlg(event: MatRadioChange) {
    if (event.value === '0') {
      this.data.infoDetail = '';
    }
  }

  /**11/25 追記
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    // 日付
    this.checkBlank(this.data.infoDateMap, 'infoDate', '日付は必須です。');

    // 件名
    this.checkBlank(this.data.infoSubject, 'infoSubject', '件名は必須です。');

    // 明細
    if (this.data.detailFlg === '1') {
      this.checkBlank(this.data.infoDetail, 'infoDetail', '詳細は必須です。');
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
        this.data.convertForSave(this.service.loginUser.userId, this.datepipe);
        if (this.cbxFinishFlg.checked) {
          this.data.finishFlg = '1';
        } else {
          this.data.finishFlg = '0';
        }
        this.service.saveInfo(this.data).then(res => {
          // 20230515 S_Update
          // if (this.fUpload != null && !this.fUpload.hasFile()) {
          //   this.dialogRef.close(true);
          // } else {
          //   this.fUpload.uploadInfoFile(res.pid);
          // }
          if(this.fFiles !=null && this.fFiles.length > 0 && this.fFiles.first != null && this.fFiles.first.file != null){
            this.fFiles.first.uploadInfoFile(res.pid);
          }
          else{
            this.dialogRef.close(true);
          }
          // 20230515 E_Update
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

