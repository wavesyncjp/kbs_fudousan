import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MatDialog } from '@angular/material';
import { Code } from '../models/bukken';
import { BackendService } from '../backend.service';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { JPDateAdapter } from '../adapters/adapters';
import { Sorting } from '../models/sorting';
import { Templandinfo } from '../models/templandinfo';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-sorting-detail',
  templateUrl: './sorting-detail.component.html',
  styleUrls: ['./sorting-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class SortingDetailComponent extends BaseComponent {
  public templandInfo: Templandinfo;
  
  constructor(
              public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<SortingDetailComponent>,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              @Inject(MAT_DIALOG_DATA) public data: Sorting) {
    super(router, service,dialog);
  }

  kanjyoCodes: Code[];
  paymentTypes: Code[];
  
  ngOnInit() {
    const funcs = [];
    funcs.push(this.service.getCodes(['029','030','031']));
    funcs.push(this.service.getKanjyos(null));
    funcs.push(this.service.searchPaymentType({payContractEntryFlg: '1'}));

    if (this.data == null || this.data.pid == null || this.data.pid <= 0) {
      this.data = new Sorting();
    } else {
      this.data = new Sorting(this.data);
      this.data.convert();
      funcs.push(this.service.getLand(this.data.tempLandInfoPid));
    }

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
      this.kanjyoCodes = this.getKanjyos();
      this.paymentTypes = this.getPaymentTypes();

      if(values.length > 3) {
        this.templandInfo = new Templandinfo(values[3] as Templandinfo);
      }
    });
  }

  //数値にカンマを付ける作業
  changeValue(val) {
    val = this.numberFormat(val);
    return val;
  }

  /**
   * 閉じる
   */
  cancel() {
    this.dialogRef.close();
  }
}
