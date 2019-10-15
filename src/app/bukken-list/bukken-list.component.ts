import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../backend.service';
import { Bukken } from '../models/bukken';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

import {BukkenDetailComponent} from '../bukken-detail/bukken-detail.component';
import { MatPaginatorIntlJa } from '../adapters/adapters';
import { Router } from '@angular/router';
import { stringify } from '@angular/compiler/src/util';
import { BaseComponent } from '../BaseComponent';

@Component({
  selector: 'app-bukken-list',
  templateUrl: './bukken-list.component.html',
  styleUrls: ['./bukken-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa }
  ]
})
export class BukkenListComponent extends BaseComponent {
  selectedRowIndex = -1;
  displayedColumns: string[] = ['bukkenId', 'bukkenCode', 'bukkenName', 'zipcode', 'detail'];
  dataSource = new MatTableDataSource<Bukken>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(public router: Router,
              public service: BackendService,
              public dialog: MatDialog,
              private spinner: NgxSpinnerService) {
                super(router, service);
  }


  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('土地情報一覧');
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  highlight(row) {
    this.selectedRowIndex = row.bukkenId;
  }

  /**
   * 物件検索
   */
  searchBukken() {
    this.spinner.show();
    this.service.searchBukken().then(res => {
      this.dataSource.data = res;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);

    });
  }

  /**
   * 物件詳細
   * @param row: 物件データ
   */
  showDetail(row: Bukken) {
    this.router.navigate(['/bkdetail'], {queryParams: {bukkenId: row.bukkenId}});
  }

  /**
   * 土地新規登録
   */
  createNew() {
    this.router.navigate(['/bkdetail']);
  }

  export() {
    this.service.export();
  }

}
