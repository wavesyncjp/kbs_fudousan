import { Component, OnInit,ViewChild } from '@angular/core';
import { PayContractDetailComponent } from '../PayContract-detail/PayContract-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code } from '../models/bukken';
import { Paycontractinfo } from '../models/paycontractinfo';
import { Router,ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';


@Component({
  selector: 'app-paycontract-list',
  templateUrl: './paycontract-list.component.html',
  styleUrls: ['./paycontract-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class PayContractListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['bukkenNo','bukkenName','supplierName','contractDay','contractFixDay', 'delete', 'detail'];
  dataSource = new MatTableDataSource<Paycontractinfo>();
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
    this.service.changeTitle('支払管理一覧');
    this.dataSource.paginator = this.paginator;
    this.cond = {};

    const funcs = [];
    /*funcs.push(this.service.getCodes(['014']));*/

    // Promise.all(funcs).then(values => {

    //   // コード
    //   const codes = values[0] as Code[];
    //   if (codes !== null && codes.length > 0) {
    //     const uniqeCodes = [...new Set(codes.map(code => code.code))];
    //     uniqeCodes.forEach(code => {
    //       const lst = codes.filter(c => c.code === code);
    //       lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
    //       this.sysCodes[code] = lst;
    //     });
    //   }
    // });
  }

  /**
   * 検索
   */
  searchPayContract() {
    this.spinner.show();
    this.service.searchPayContract(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  createNew(raw : PayContractDetailComponent) {
    this.router.navigate(['/paydetail']);
  }

  deleteRow(row: Paycontractinfo) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deletePayContracte(row.pid).then(res => {
          this.searchPayContract();
        });
      }
    });
  }

  showDetail(row: Paycontractinfo) {
    // const dialogRef = this.dialog.open(PayContractListComponent, {
    //   width: '840px',
    //   height: '420px',
    //   data: row
    // });

    // // 再検索
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.searchPayContract();
    //   }
    // });
    this.router.navigate(['/paydetail'], {queryParams: {pid: row.pid}});
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}