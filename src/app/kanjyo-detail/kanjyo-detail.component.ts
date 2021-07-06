import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MatDialog, MatCheckbox } from '@angular/material';
import { Code, Kanjyo } from '../models/bukken';
import { BackendService } from '../backend.service';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { JPDateAdapter } from '../adapters/adapters';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FileComponentComponent } from '../uicomponent/file-component/file-component.component';

@Component({
  selector: 'app-kanjyo-detail',
  templateUrl: './kanjyo-detail.component.html',
  styleUrls: ['./kanjyo-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class KanjyoDetailComponent extends BaseComponent {
  @ViewChild('fUpload', {static: true})
  fUpload: FileComponentComponent;

  @ViewChild('cbxFinishFlg', {static: true})
  cbxFinishFlg: MatCheckbox;

  constructor(
              public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<KanjyoDetailComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: Kanjyo) {
    super(router, service,dialog);
  }

  codes: Code[];

  ngOnInit() {
    const funcs = [];
    funcs.push(this.service.getCodes(['014']));
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

      if (this.data == null || !(this.data.kanjyoCode.length > 0)) {
        this.data = new Kanjyo();
      } else {
        this.data = new Kanjyo(this.data);
      }
    });
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    this.checkBlank(this.data.kanjyoCode, 'kanjyoCode', '勘定科目コードは必須です。');
    this.checkBlank(this.data.kanjyoName, 'kanjyoName', '勘定科目名称は必須です。');

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * OK
   */
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
        this.service.saveKanjyo(this.data); 
        this.dialogRef.close(true);
      }
    });
  }

  /**
   * 閉じる
   */
  cancel() {
    this.dialogRef.close();
  }
}
