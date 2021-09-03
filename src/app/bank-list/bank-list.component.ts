import { Component, ViewChild } from '@angular/core';
import { BankDetailComponent } from '../bank-detail/bank-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code } from '../models/bukken';
import { Router } from '@angular/router';
import { Bank } from '../models/bukken';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';

@Component({
  selector: 'app-bank-list',
  templateUrl: './bank-list.component.html',
  styleUrls: ['./bank-list.component.css'],
  providers: [
    {provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class BankListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['contractType', 'displayOrder', 'displayName', 'bankName', 'branchName', 'depositType', 'accountNumber', 'accountHolder', 'createDate', 'updateDate', 'delete', 'detail'];
  dataSource = new MatTableDataSource<Bank>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  constructor(public router: Router,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
    super(router, service,dialog);
  }

  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('銀行マスタ');
    this.dataSource.paginator = this.paginator;
    this.cond = {
      infoDateMap: new Date(),
    };

    const funcs = [];
    funcs.push(this.service.getCodes(['031', '034']));

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
  searchBank() {
    this.spinner.show();
    this.service.searchBank(this.cond).then(res => {
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
    const row = new Bank();
    const dialogRef = this.dialog.open(BankDetailComponent, {
      width: '1000px',
      height: '450px',
      data: row
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchBank();
      }
    });
  }

  /**
   * 削除
   */
  deleteRow(row: Bank) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteBank(row.pid).then(res => {
          this.searchBank();
        });
      }
    });
  }

  /**
   * 詳細
   */
  showDetail(row: Bank) {
    const dialogRef = this.dialog.open(BankDetailComponent, {
      width: '1100px',
      height: '450px',
      data: row
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchBank();
      }
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}
