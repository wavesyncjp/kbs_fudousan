import { Component, ViewChild } from '@angular/core';
import { DepDetailComponent } from '../dep-detail/dep-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Department } from '../models/bukken';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';

@Component({
  selector: 'app-dep-list',
  templateUrl: './dep-list.component.html',
  styleUrls: ['./dep-list.component.css'],
  providers: [
    {provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class DepListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;

  displayedColumns: string[] = ['depCode', 'depName', 'displayOrder', 'createDate', 'updateDate', 'delete', 'detail'];
  dataSource = new MatTableDataSource<Department>();
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  constructor(public router: Router,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
    super(router, service,dialog);
  }

  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('部署マスタ');
    this.dataSource.paginator = this.paginator;
    this.cond = {};

    const funcs = [];

    funcs.push(this.service.getDeps(null));

    Promise.all(funcs).then(values => {
      this.deps = values[0];
    });
  }

  /**
   * 検索
   */
  searchDep() {
    this.spinner.show();
    this.service.searchDep(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;

      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  /**
   * 新規
   */
  createNew() {
    const row = new Department();
    const dialogRef = this.dialog.open(DepDetailComponent, {
      width: '750px',
      height: '350px',
      data: row
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchDep();
      }
    });
  }

  /**
   * 削除
   */
  deleteRow(row: Department) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteDep(row.depCode).then(res => {
          this.searchDep();
        });
      }
    });

  }

  /**
   * 詳細
   */
  showDetail(row: Department) {
    const dialogRef = this.dialog.open(DepDetailComponent, {
      width: '750px',
      height: '350px',
      data: row
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchDep();
      }
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}
