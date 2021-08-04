import { Component, ViewChild } from '@angular/core';
import { KanjyoFixDetailComponent } from '../kanjyoFix-detail/kanjyoFix-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code } from '../models/bukken';
import { Router } from '@angular/router';
import { KanjyoFix } from '../models/bukken';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';

@Component({
  selector: 'app-kanjyoFix-list',
  templateUrl: './kanjyoFix-list.component.html',
  styleUrls: ['./kanjyoFix-list.component.css'],
  providers: [
    {provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class KanjyoFixListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['paymentCode', 'debtorKanjyoCode','debtorKanjyoDetailName','creditorKanjyoCode','creditorKanjyoDetailName','transFlg','createDate', 'updateDate', 'delete', 'detail'];
  dataSource = new MatTableDataSource<KanjyoFix>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  constructor(public router: Router,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
    super(router, service,dialog);
  }

  Codes: Code[];
  kanjyoCodes: Code[];
  paymentCodes : Code[];

  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('貸方借方決定マスタ');
    this.dataSource.paginator = this.paginator;
    this.cond = {
      infoDateMap: new Date(),
    };

    const funcs = [];
    funcs.push(this.service.getCodes(['029']));
    funcs.push(this.service.getKanjyos(null));
    funcs.push(this.service.searchPaymentType({payContractEntryFlg: '1'}));

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
      this.paymenttypes = this.getPaymentTypes();
    });
  }

  /**
   * 検索
   */
  searchKanjyoFix() {
    this.spinner.show();
    this.service.searchKanjyoFix(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  /**
   * 新規登録
   */
  createNew() {
    const row = new KanjyoFix();
    const dialogRef = this.dialog.open(KanjyoFixDetailComponent, {
      width: '1100px',
      height: '380px',
      data: row
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchKanjyoFix();
      }
    });
  }

  /**
   * 削除
   */
  deleteRow(row: KanjyoFix) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteKanjyoFix(row.pid).then(res => {
          this.searchKanjyoFix();
        });
      }
    });
  }

  /**
   * 詳細
   */
  showDetail(row: KanjyoFix) {
    const dialogRef = this.dialog.open(KanjyoFixDetailComponent, {
      width: '1100px',
      height: '380px',
      data: row
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchKanjyoFix();
      }
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}
