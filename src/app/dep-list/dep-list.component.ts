import { Component, OnInit } from '@angular/core';
import { DepDetailComponent } from '../dep-detail/dep-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { Code } from '../models/bukken';
import { Router } from '@angular/router';
import { Department } from '../models/bukken';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { JPDateAdapter } from '../adapters/adapters';

@Component({
  selector: 'app-dep-list',
  templateUrl: './dep-list.component.html',
  styleUrls: ['./dep-list.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class DepListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;
  /**/
  displayedColumns: string[] = ['depCode', 'depName', 'createDate', 'updateDate', 'delete', 'detail'];
  dataSource = new MatTableDataSource<Department>();

  constructor(public router: Router,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
    super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('部署マスタ');

    this.cond = {
      infoDateMap: new Date(),
      // 20191202 condにdepartmentセット(this)
      department: []
    };

    const funcs = [];
    /*funcs.push(this.service.getCodes(['005']));*/


    // 20191202 funcsにgetdeps全件データを取得(null)//
    funcs.push(this.service.getDeps(null));

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
      this.deps = values[0];

      this.cond.infoDateMap = null;

    });
  }

  /**
   * 検索
   */
  searchDep() {
    this.spinner.show();
    /*this.cond.infoDate = this.cond.infoDateMap != null ? this.cond.infoDateMap.toLocaleDateString() : null;
    （toLocaleDateString=国、地域の時間をあった言語にて表示する）*/
    this.service.searchDep(this.cond).then(res => {
      this.dataSource.data = res;

      setTimeout(() => {
        this.spinner.hide();
      }, 500);

    });

  }

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
