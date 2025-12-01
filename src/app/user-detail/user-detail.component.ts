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
    super(router, service, dialog);
  }

  depCodes: Code[];// 20210211 Add

  ngOnInit() {
    const funcs = [];
    funcs.push(this.service.getCodes(['010']));
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

      if (this.data == null || !(this.data.userId > 0)) {
        this.data = new User();
      } else {
        this.data = new User(this.data);
      }

      // 部署入力欄を最低1つは保証する
      if (this.data.departments.length === 0) {
        this.data.departments.push({ depCode: '' });
      }
      this.depCodes = this.getDeps();// 20210211 Add
    });
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    this.checkBlank(this.data.userName, 'userName', 'ユーザー名は必須です。');
    this.checkMailAddress(this.data.mailAddress, 'mailAddress', 'メールアドレスが不正です。');// 20220213 Add
    this.checkDepCodes(this.data.departments, 'depCode', '同じ部署を2つ以上登録できません。');

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
        this.removeMissingDepartmentCodes();
        this.service.saveUser(this.data);
        this.dialogRef.close(true);
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  /**
   * 部署欄追加
   * ※一旦入力欄を5つまでに制限
   */
  addDepCodeInput() {
    if (this.data.departments.length >= 5) {
      return;
    }
    this.data.departments.push({ depCode: '' });
  }

  /**
   * 部署欄削除
   * @param index
   */
  deleteDepCodeInput(index: number) {
    this.data.departments.splice(index, 1);
  }

  /**
   * 部署マスタに存在しないものを除外する
   */
  removeMissingDepartmentCodes () {
    this.data.departments = this.data.departments.filter($inputDep => {
      return this.depCodes.some(existDep => existDep.codeDetail === $inputDep.depCode);
    });
  }
}
