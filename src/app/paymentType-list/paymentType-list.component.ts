import { Component, OnInit,ViewChild } from '@angular/core';
import { PaymentTypeDetailComponent } from '../paymentType-detail/paymentType-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code, PaymentType } from '../models/bukken';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { JPDateAdapter } from '../adapters/adapters';

@Component({
  selector: 'app-paymentType-list',
  templateUrl: './paymentType-list.component.html',
  styleUrls: ['./paymentType-list.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})

export class PaymentTypeListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['paymentCode', 'paymentName', 'landFlg', 'buildingFlg', 'sellingFlg', 'otherFlg', 'addFlg', 'taxFlg', 'createDate', 'updateDate', 'delete', 'detail'];
  dataSource = new MatTableDataSource<PaymentType>();
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(public router: Router,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
    super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('支払種別マスタ');
    this.cond = {};

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
    });
  }

  /**
   * 検索
   */
  searchPaymentType() {
    this.spinner.show();
    this.service.searchPaymentType(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  createNew() {
    const row = new PaymentType();
    const dialogRef = this.dialog.open(PaymentTypeDetailComponent, {
      width: '840px',
      height: '420px',
      data: row
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchPaymentType();
      }
    });
  }

  deleteRow(row: PaymentType) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deletePaymentType(row.paymentCode).then(res => {
          this.searchPaymentType();
        });
      }
    });
  }

  showDetail(row: PaymentType) {
    const dialogRef = this.dialog.open(PaymentTypeDetailComponent, {
      width: '750px',
      height: '350px',
      data: row
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchPaymentType();
      }
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}
