import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MatDialog, MatCheckbox } from '@angular/material';
import { BackendService } from '../backend.service';
import { Code, KanjyoFix } from '../models/bukken';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { JPDateAdapter } from '../adapters/adapters';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FileComponentComponent } from '../uicomponent/file-component/file-component.component';
// 20240930 S_Add
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
// 20240930 E_Add

@Component({
  selector: 'app-kanjyoFix-detail',
  templateUrl: './kanjyoFix-detail.component.html',
  styleUrls: ['./kanjyoFix-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class KanjyoFixDetailComponent extends BaseComponent {

  @ViewChild('fUpload', {static: true})
  fUpload: FileComponentComponent;

  @ViewChild('cbxFinishFlg', {static: true})
  cbxFinishFlg: MatCheckbox;

  constructor(
              public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<KanjyoFixDetailComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: KanjyoFix) {
    super(router, service, dialog);
  }

  kanjyoCodes: Code[];
  paymentCdes: Code[];

  ngOnInit() {
    const funcs = [];
    // 20240802 S_Update
    // funcs.push(this.service.getCodes(['029']));
    funcs.push(this.service.getCodes(['031']));
    // 20240802 E_Update
    funcs.push(this.service.getKanjyos(null));
    funcs.push(this.service.searchPaymentType({payContractEntryFlg: '1'}));
    funcs.push(this.service.searchReceiveType(null));// 20240930 Add

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
      this.kanjyos = values[1];
      this.payTypes = values[2];
      this.recTypes = values[3];// 20240930 Add

      if (this.data == null || !(this.data.pid > 0)) {
        this.data = new KanjyoFix();
      } else {
        this.data = new KanjyoFix(this.data);
      }

      this.kanjyoCodes = this.getKanjyos();
      this.paymenttypes = this.getPaymentTypes();

    });
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    // 20240930 S_Update
    // this.checkBlank(this.data.paymentCode, 'paymentCode', '支払コードは必須です。');
    this.checkBlank(this.data.contractType, 'contractType', '入出金区分は必須です。');
    this.checkBlank(this.data.paymentCode, 'paymentCode', 'コードは必須です。');
    // 20240930 E_Update

    // 20240802 S_Delete
    // if(this.data.transFlg !== '' && this.data.transFlg !== '00'){
    //   this.checkBlank(this.data.transDebtorKanjyoCode, 'transDebtorKanjyoCode', '振替後借方勘定科目コードは必須です。');
    //   this.checkBlank(this.data.transCreditorKanjyoCode, 'transCreditorKanjyoCode', '振替後貸方勘定科目コードは必須です。');
    // }
    // 20240802 E_Delete
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
        // 20240930 S_Update
        // this.service.saveKanjyoFix(this.data);
        // this.dialogRef.close(true);

        this.service.saveKanjyoFix(this.data).then(res => {
          if (res.statusMap === 'NG') {
            this.data.createUserId = null;
            this.dialog.open(FinishDialogComponent, {
              width: '500px', height: '250px',
              data: new Dialog({ title: 'エラー', message: res.msgMap })
            });
          }
          else {
            this.dialogRef.close(true);
          }
        });
        // 20240930 E_Update
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
