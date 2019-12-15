import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MatDialog, MatCheckbox } from '@angular/material';
import { User } from '../models/bukken';
import { BackendService } from '../backend.service';
import { Code } from '../models/bukken';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { Checklib } from '../utils/checklib';
import { JPDateAdapter } from '../adapters/adapters';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FileComponentComponent } from '../uicomponent/file-component/file-component.component';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class UserDetailComponent extends BaseComponent {

  @ViewChild('fUpload', {static: true})
  fUpload: FileComponentComponent;

  @ViewChild('cbxFinishFlg', {static: true})
  cbxFinishFlg: MatCheckbox;

  constructor(
              public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<UserDetailComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: User) {
    super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    const funcs = [];
    funcs.push(this.service.getCodes(['006']));
    funcs.push(this.service.getDeps(null));
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
      this.deps = values[1];

    });
    
  }

  /*hasFile() {
    return this.data.attachFileName != null && this.data.attachFileName !== '';
  }*/

  /**11/25 追記
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    // 社員コード
    if (this.data.userId == null) {
      this.errorMsgs.push('ユーザーIDは必須です。');
      const prop = 'userId';
      this.errors[prop] = true;
    }

    // 社員名
    if (Checklib.isBlank(this.data.userName)) {
      this.errorMsgs.push('ユーザー名称は必須です。');
      const prop = 'userName';
      this.errors[prop] = true;
    }

    
    
   /* // 部署名
    if (Checklib.isBlank(this.data.depName)) {
      this.errorMsgs.push('部署名は必須です。');
      const prop = 'depName';
      this.errors[prop] = true;
    }*/

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
        // this.data.convertForSave(this.service.loginUser.userId);
        /*
        if (this.cbxFinishFlg.checked) {
          this.data.finishFlg = '1';
        } else {
          this.data.finishFlg = '0';
        }
        */
        this.service.saveUser(this.data);  //.then(res => {
          /*
          if (this.fUpload != null && !this.fUpload.hasFile()) {
            this.dialogRef.close(true);
          } else {
            this.fUpload.uploadInfoFile(res.pid);
          }
        });
        */
        this.dialogRef.close(true);
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

