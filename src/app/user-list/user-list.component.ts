import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code } from '../models/bukken';
import { Router } from '@angular/router';
import { User } from '../models/bukken';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class UserListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;
  /**/
  displayedColumns: string[] = ['userId', 'userName','employeeCode','depName','loginId','authority','createDate', 'updateDate', 'delete', 'detail'];
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
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
    this.service.changeTitle('社員マスタ');
    this.dataSource.paginator = this.paginator;
    this.cond = {};

    const funcs = [];
    funcs.push(this.service.getCodes(['010']));

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
  searchUser() {
    this.spinner.show();
    this.service.searchUser(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  createNew() {
    const row = new User();
    const dialogRef = this.dialog.open(UserDetailComponent, {
      width: '750px',
      height: '400px',
      data: row
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchUser();
      }
    });
  }

  deleteRow(row: User) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteUser(row.userId).then(res => {
          this.searchUser();
        });
      }
    });
  }

  showDetail(row: User) {
    const dialogRef = this.dialog.open(UserDetailComponent, {
      width: '750px',
      height: '350px',
      data: row
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchUser();
      }
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}
