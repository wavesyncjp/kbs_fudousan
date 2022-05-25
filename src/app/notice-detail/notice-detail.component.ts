import { Component, Inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MatDialog, MatCheckbox, MatRadioChange } from '@angular/material';
import { Information } from '../models/information';
import { BackendService } from '../backend.service';
import { Code } from '../models/bukken';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FileComponentComponent } from '../uicomponent/file-component/file-component.component';
import { InfoAttach } from '../models/mapattach';// 20220329 Add

@Component({
  selector: 'app-notice-detail',
  templateUrl: './notice-detail.component.html',
  styleUrls: ['./notice-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class NoticeDetailComponent extends BaseComponent {

  // 20211227 S_Update
  /*
  @ViewChild('fUpload', {static: true})
  fUpload: FileComponentComponent;
  @ViewChild('fApprovedUpload', {static: true})
  fApprovedUpload: FileComponentComponent;
  */
  @ViewChildren(FileComponentComponent) fFiles: QueryList<FileComponentComponent>;
  // 20211227 E_Update

  @ViewChild('cbxFinishFlg', {static: true})
  cbxFinishFlg: MatCheckbox;
  // 20220519 S_Add
  @ViewChild('cbxAddedFileSendFlg', {static: true})
  cbxAddedFileSendFlg: MatCheckbox;
  // 20220519 E_Add

  authority = '';
  enableUser: boolean = false;
  isCreate: boolean = false;// 20220517 Add

  constructor(
              public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<NoticeDetailComponent>,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              @Inject(MAT_DIALOG_DATA) public data: Information) {
    super(router, service,dialog);
  }

  ngOnInit() {
    this.authority = this.service.loginUser.authority;
    // 20220118 S_Update
    // this.enableUser = this.authority === '01';
    this.enableUser = (this.authority === '01' || this.authority === '02');
    // 20220118 E_Update

    const funcs = [];
    // コード
    funcs.push(this.service.getCodes(['006', '038', '039']));
    Promise.all(funcs).then(values => {
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
        // 20220517 S_Add
        this.data.infoDateMap = new Date();
        this.data.convert();
        this.isCreate = true;
        // 20220517 E_Add
      } else {
        this.data = new Information(this.data);
        this.data.convert();
      }
    });
  }

  hasFile() {
    return this.data.attachFileName != null && this.data.attachFileName !== '';
  }

  hasApprovedFile() {
    return this.data.approvalAttachFileName != null && this.data.approvalAttachFileName !== '';
  }

  changeFlg(event: MatRadioChange) {
    if (event.value === '0') {
      this.data.infoDetail = '';
    }
  }

  /**
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

    // 20220526 S_Add
    if (this.cbxAddedFileSendFlg.checked && this.cbxFinishFlg.checked) {
      this.errorMsgs.push('追加ファイル送付の際は、掲載終了のチェックを外してください。');
      this.errors['finishFlg'] = true;
    }
    // 20220526 E_Add

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
    const dlg = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlgObj});

    dlg.afterClosed().subscribe(result => {
      if (dlgObj.choose) {
        this.data.convertForSave(this.service.loginUser.userId, this.datepipe);
        if (this.cbxFinishFlg.checked) {
          this.data.finishFlg = '1';
        } else {
          this.data.finishFlg = '0';
        }
        // 20220519 S_Add
        if (this.cbxAddedFileSendFlg.checked) {
          this.data.addedFileSendFlg = '1';
        } else {
          this.data.addedFileSendFlg = '0';
        }
        // 20220519 E_Add
        this.data.infoType = 1;// 掲示板タイプ<-1:お知らせ
        this.service.saveInfo(this.data).then(res => {
          // 20220330 S_Update
          /*
          if (this.fUpload != null && !this.fUpload.hasFile()) {
            this.dialogRef.close(true);
          } else {
            this.fUpload.uploadInfoFile(res.pid);
          }
          */
          /*
          let fUpload = this.fFiles.filter(me => me.id === 'fUpload')[0];
          let fApprovedUpload = this.fFiles.filter(me => me.id === 'fApprovedUpload')[0];

          if ((fUpload == null || !fUpload.hasFile()) && (fApprovedUpload == null || !fApprovedUpload.hasFile())) {
            this.dialogRef.close(true);
          } else {
            if (fUpload != null && fUpload.hasFile()) fUpload.uploadInfoFile(res.pid);
            if (fApprovedUpload != null && fApprovedUpload.hasFile()) fApprovedUpload.uploadApprovedInfoFile(res.pid);
          }
          */
          let fApprovedUpload = this.fFiles.filter(me => me.id === 'fApprovedUpload')[0];

          if (fApprovedUpload == null || !fApprovedUpload.hasFile()) {
            // 20220517 S_Update
            // this.dialogRef.close(true);
            this.dialogRef.close({data: res, isCreate: this.isCreate});
            // 20220517 E_Update
          } else {
            if (fApprovedUpload != null && fApprovedUpload.hasFile()) fApprovedUpload.uploadApprovedInfoFile(res.pid);
          }
          // 20220330 E_Update
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

  // 20220329 E_Delete
  // 20220329 S_Add
  /**
   * ファイルアップロード
   * @param event ：ファイル
   */
   uploadedInfoAttach(event) {
    // 20220517 S_Update
    // if (this.data.attachFiles === null) {
    if (this.data.attachFiles === null || this.data.attachFiles == undefined) {
    // 20220517 E_Update
      this.data.attachFiles = [];
    }
    const attachFile: InfoAttach = JSON.parse(JSON.stringify(event));
    this.data.attachFiles.push(attachFile);
  }

  /**
   * ファイル削除
   * @param map : 削除したいファイル
   */
  deleteInfoAttachFile(map: InfoAttach) {
    const dlg = new Dialog({title: '確認', message: 'ファイルを削除しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteInfoAttachFile(map.pid).then(res => {
          this.data.attachFiles.splice(this.data.attachFiles.indexOf(map), 1);
        });
      }
    });
  }
  // 20220329 E_Add
}
