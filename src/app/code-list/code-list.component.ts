import { Component, OnInit,ViewChild } from '@angular/core';
import { CodeDetailComponent } from '../code-detail/code-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code } from '../models/bukken';
import { Router } from '@angular/router';
//import { Code } from '../models/bukken';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';

@Component({
  selector: 'app-code-list',
  templateUrl: './code-list.component.html',
  styleUrls: ['./code-list.component.css'],
  providers: [
    {provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})

export class CodeListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;
  /**/
  displayedColumns: string[] = ['code','nameHeader','codeDetail','name','displayOrder', 'createDate', 'updateDate', 'delete', 'detail'];
  dataSource = new MatTableDataSource<Code>();
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  constructor(public router: Router,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
    super(router, service,dialog);
  }

  codes: Code[];// 20210211 Add

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('コードマスタ');
    this.dataSource.paginator = this.paginator;
    this.cond = {
      infoDateMap: new Date(),
      // 20191202 condにdepartmentセット(this)
      //code: []
    };

    const funcs = [];
    /*funcs.push(this.service.getCodes(['005']));*/


    // 20191202 funcsにgetdeps全件データを取得(null)//
//    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getCodeNameMsts(null));

    Promise.all(funcs).then(values => {
      
      // コード
     /* const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }*/

      // 20191202 valuesに取得値をセット
      this.sysCodeNameMsts = values[0];
      this.codes = this.getCodeNameMst();// 20210211 Add

      this.cond.infoDateMap = null;

    });
  }

  /**
   * 検索
   */
  searchCode() {
    this.spinner.show();
    /*this.cond.infoDate = this.cond.infoDateMap != null ? this.cond.infoDateMap.toLocaleDateString() : null;
    （toLocaleDateString=国、地域の時間をあった言語にて表示する）*/
    this.service.searchCode(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);

    });

  }

  createNew() {
    const row = new Code();
    const dialogRef = this.dialog.open(CodeDetailComponent, {
      width: '750px',
      height: '400px',
      data: row
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchCode();
      }
    });
  }

  deleteRow(row: Code) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteCode(row.code, row.codeDetail).then(res => {
          this.searchCode();
        });
      }
    });

  }

  showDetail(row: Code) {
    const dialogRef = this.dialog.open(CodeDetailComponent, {
      width: '750px',
      height: '350px',
      data: row
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchCode();
      }
    });

  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}
