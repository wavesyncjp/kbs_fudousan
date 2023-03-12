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
import { NgxSpinnerService } from 'ngx-spinner';// 20221116 Add
import { Templandinfo } from '../models/templandinfo';// 20230302 Add

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

  // 20221116 S_Add
  @ViewChild('attachFile', {static: true})
  attachFile: FileComponentComponent;
  // 20221116 E_Add

  @ViewChild('cbxFinishFlg', {static: true})
  cbxFinishFlg: MatCheckbox;
  // 20220519 S_Add
  @ViewChild('cbxAddedFileSendFlg', {static: true})
  cbxAddedFileSendFlg: MatCheckbox;
  // 20220519 E_Add

  authority = '';
  enableUser: boolean = false;
  isCreate: boolean = false;// 20220517 Add
  // 20230301 S_Add
  bukkens = [];
  bukkenMap: { [key: string]: number; } = {};
  public bukkenName : string;
  // 20230301 E_Add

  public isHideSubjectDetail: boolean = false;// 20230306 Add
  constructor(
              public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<NoticeDetailComponent>,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              private spinner: NgxSpinnerService,// 20221116 Add
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
    funcs.push(this.service.getCodes(['006', '038', '039', '040', '041', '042']));
    // 20230301 S_Add
    funcs.push(this.service.getLands(null));// 物件情報一覧の取得
    if (this.data.tempLandInfoPid > 0) {
      funcs.push(this.service.getLand(this.data.tempLandInfoPid));
    }
    // 20230301 E_Add
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
      // 20230301 S_Add
      this.lands = values[1];
      //入力の際に表示される物件名称を取得するための処理
      this.bukkens = this.lands
      //物件名称をキーにpidをmapに保持していく
      this.lands.forEach((land) => {
        this.bukkenMap[land.bukkenNo + ':' + land.bukkenName] = land.pid
      });
      // 20230301 E_Add

      if (this.data == null || !(this.data.pid > 0)) {
        // 20230309 S_Add
        let attachFiles: InfoAttach[];
        if(this.data != null && this.data.attachFiles != null && this.data.attachFiles.length > 0) {
          attachFiles = this.data.attachFiles;
        }
        // 20230309 E_Add

        this.data = new Information();
        this.data.detailFlg = '1';
        // 20220517 S_Add
        this.data.infoDateMap = new Date();
        this.data.convert();
        this.isCreate = true;
        // 20220517 E_Add

        // 20230309 S_Add
        if(this.bukkenName != null &&  this.bukkenName != '') {
          this.bukkenSearch();
        }
        if(attachFiles != null && attachFiles.length > 0) {
          this.data.attachFiles = attachFiles;
        }
        // 20230309 E_Add
      } else {
        this.data = new Information(this.data);
        // 20230302 S_Add
        if (this.data.tempLandInfoPid > 0) {
          const templandinfo = new Templandinfo(values[2] as Templandinfo);
          this.bukkenName = templandinfo.bukkenNo + ':' + templandinfo.bukkenName;
        }
        // 20230302 E_Add
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

    // 20230213 S_Add
    this.checkBlank(this.data.infoType, 'infoType', '支店は必須です。');
    // 20230213 E_Add

    // 日付
    this.checkBlank(this.data.infoDateMap, 'infoDate', '日付は必須です。');

    // 20230302 S_Update
    // 件名
    // this.checkBlank(this.data.infoSubject, 'infoSubject', '件名は必須です。');
    // 件名 種別
    this.checkBlank(this.data.infoSubjectType, 'infoSubjectType', '種別は必須です。');
    // 20230302 E_Update

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
        this.spinner.show();// 20221116 Add
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
        
        // 20230306 S_Update
        // this.convertSubject(this.data);// 20230302 Add
        if(!this.isHideSubjectDetail){
          this.convertSubject(this.data);
        }
        // 20230306 E_Update

        // 20230213 S_Delete
        // this.data.infoType = 1;// 掲示板タイプ<-1:お知らせ
        // 20230213 E_Delete
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
          // 20221116 S_Update
          /*
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
          */
          // 登録の場合、添付ファイルがあれば、アップロード
          if (this.isCreate && this.attachFile && this.attachFile.hasFile()) { 
            this.attachFile.uploadInfoAttachFile(res.pid, () => {
              this.spinner.hide();

              let fApprovedUpload = this.fFiles.filter(me => me.id === 'fApprovedUpload')[0];

              if (fApprovedUpload == null || !fApprovedUpload.hasFile()) {
                // 20220517 S_Update
                // this.dialogRef.close(true);
                this.dialogRef.close({data: res, isCreate: this.isCreate});
                // 20220517 E_Update
              } else {
                if (fApprovedUpload != null && fApprovedUpload.hasFile()) fApprovedUpload.uploadApprovedInfoFile(res.pid);
              }
            });
          }
          else {
            this.spinner.hide();

            let fApprovedUpload = this.fFiles.filter(me => me.id === 'fApprovedUpload')[0];

            if (fApprovedUpload == null || !fApprovedUpload.hasFile()) {
              // 20220517 S_Update
              // this.dialogRef.close(true);
              this.dialogRef.close({data: res, isCreate: this.isCreate});
              // 20220517 E_Update
            } else {
              if (fApprovedUpload != null && fApprovedUpload.hasFile()) fApprovedUpload.uploadApprovedInfoFile(res.pid);
            }
          }
          // 20221116 E_Update
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
  // 20230301 S_Add
  /**
   * 入力の度に物件を検索する
   */
  bukkenSearch() {
    this.bukkens = this.lands.filter(land => `${land.bukkenNo}:${land.bukkenName}`.includes(this.bukkenName));
    const lst = this.lands.filter(land => `${land.bukkenNo}:${land.bukkenName}` === this.bukkenName);
    if(lst.length === 1) {
      this.data.tempLandInfoPid = this.bukkenMap[this.bukkenName];
    }
    else {
      this.data.tempLandInfoPid = 0;
    }
  }

  // 20230308 S_Delete
  /**
   * お知らせ件名詳細変更
   */
  /*
  changeInfoSubjectDetail(event) {
    // お知らせ件名詳細が99:その他の場合
    if (this.data.infoSubjectDetail === '99') {
      // 物件名称初期化
      // this.bukkenName = '';
      // this.bukkenSearch();
      this.data.infoSubjectContractor = ''; // お知らせ件名契約相手
    }
    else {
      this.data.infoSubjectRemark = '';     // お知らせ件名備考
    }
  }
  */
  // 20230308 E_Delete

  /**
   * 件名編集
   */
  convertSubject(info: Information) {
    // 種別に指定がある場合
    if(info.infoSubjectType !== '') {
      var infoSubject = '';
      // infoSubject = this.getCodeTitle('041', info.infoSubjectType);
      // 物件名称に指定がある場合
      if(this.bukkenName !== undefined && this.bukkenName !== '') {
        // 20230306 S_Update
        // infoSubject += this.bukkenName;
        infoSubject += this.bukkenName.split(':')[1];
        // 20230306 E_Update
      }
      // 契約相手に指定がある場合
      if(info.infoSubjectContractor !== '') {
        if(infoSubject !== '') infoSubject += '/';
        infoSubject += info.infoSubjectContractor + '様';
      }
      // 詳細に指定がある場合
      if(info.infoSubjectDetail !== '') {
        // 20230308 S_Update
        /*
        // 詳細が99:その他の場合
        if(info.infoSubjectDetail === '99') {
          // お知らせ件名備考に指定がある場合
          if(info.infoSubjectRemark !== '') {
            if(infoSubject !== '') infoSubject += '/';
            infoSubject += info.infoSubjectRemark;
          }
        } else {
          if(infoSubject !== '') infoSubject += '/';
          infoSubject += this.getCodeTitle('042', info.infoSubjectDetail);
        }
        */
        // 詳細が99:その他ではない場合
        if(info.infoSubjectDetail !== '99') {
          if(infoSubject !== '') infoSubject += '/';
          infoSubject += this.getCodeTitle('042', info.infoSubjectDetail);
        }
        // お知らせ件名備考に指定がある場合
        if(info.infoSubjectRemark !== '') {
          if(infoSubject !== '') infoSubject += '/';
          infoSubject += info.infoSubjectRemark;
        }
        // 20230308 E_Update
      }
      info.infoSubject = this.getCodeTitle('041', info.infoSubjectType) + infoSubject;
    }
  }
  // 20230301 E_Add
}
