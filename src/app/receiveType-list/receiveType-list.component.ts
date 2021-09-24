import { Component, OnInit,ViewChild } from '@angular/core';
import { ReceiveTypeDetailComponent } from '../receiveType-detail/receiveType-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code, ReceiveType } from '../models/bukken';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';

@Component({
  selector: 'app-receiveType-list',
  templateUrl: './receiveType-list.component.html',
  styleUrls: ['./receiveType-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class ReceiveTypeListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['receiveCode', 'receiveName', 'categoryFlg', 'displayOrder', 'createDate', 'updateDate', 'delete', 'detail'];
  dataSource = new MatTableDataSource<ReceiveType>();
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
    this.service.changeTitle('入金種別マスタ');
    this.dataSource.paginator = this.paginator;
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
  searchReceiveType() {
    this.spinner.show();
    this.service.searchReceiveType(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  createNew() {
    const row = new ReceiveType();
    const dialogRef = this.dialog.open(ReceiveTypeDetailComponent, {
      width: '840px',
      height: '320px',
      data: row
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchReceiveType();
      }
    });
  }

  deleteRow(row: ReceiveType) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteReceiveType(row.receiveCode).then(res => {
          this.searchReceiveType();
        });
      }
    });
  }

  showDetail(row: ReceiveType) {
    const dialogRef = this.dialog.open(ReceiveTypeDetailComponent, {
      width: '840px',
      height: '320px',
      data: row
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchReceiveType();
      }
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}
