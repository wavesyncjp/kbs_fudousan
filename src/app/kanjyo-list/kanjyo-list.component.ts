import { Component, ViewChild } from '@angular/core';
import { KanjyoDetailComponent } from '../kanjyo-detail/kanjyo-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code } from '../models/bukken';
import { Router } from '@angular/router';
import { Kanjyo } from '../models/bukken';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';

@Component({
  selector: 'app-kanjyo-list',
  templateUrl: './kanjyo-list.component.html',
  styleUrls: ['./kanjyo-list.component.css'],
  providers: [
    {provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})

export class KanjyoListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['kanjyoCode', 'kanjyoName', 'supplierName', 'taxFlg','createDate', 'updateDate', 'delete', 'detail'];
  dataSource = new MatTableDataSource<Kanjyo>();
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
    this.service.changeTitle('勘定マスタ');
    this.dataSource.paginator = this.paginator;
    this.cond = {
      infoDateMap: new Date(),
    };

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
  searchKanjyo() {
    this.spinner.show();
    this.service.searchKanjyo(this.cond).then(res => {
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
    const row = new Kanjyo();
    const dialogRef = this.dialog.open(KanjyoDetailComponent, {
      width: '750px',
      height: '400px',
      data: row
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchKanjyo();
      }
    });
  }

  /**
   * 削除
   */
  deleteRow(row: Kanjyo) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteKanjyo(row.kanjyoCode).then(res => {
          this.searchKanjyo();
        });
      }
    });
  }

  /**
   * 詳細
   */
  showDetail(row: Kanjyo) {
    const dialogRef = this.dialog.open(KanjyoDetailComponent, {
      width: '750px',
      height: '350px',
      data: row
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchKanjyo();
      }
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}
