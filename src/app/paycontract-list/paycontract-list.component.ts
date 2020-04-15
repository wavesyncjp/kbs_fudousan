import { Component, OnInit,ViewChild } from '@angular/core';
import { PayContractDetailComponent } from '../PayContract-detail/PayContract-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
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
  displayedColumns: string[] = ['bukkenNo','bukkenName','supplierName','payContractDay','payContractFixDay', 'paymentCode','contractDay','delete', 'detail'];// 'paymentCode',
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

    this.service.getPaymentTypes(null).then(ret => {
      this.payTypes = ret;
    });
  }

  /**
   * 検索
   */
  searchPayContract() {
    this.spinner.show();
    this.service.searchPayContract(this.cond).then(res => {
      //const lst = this.groupData(res);
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  /**
   * グループ化
   * @param res 検索結果データ
   */
  groupData(res) {
    const lst = res.map(data => {return {pid: data.payContractPid, bukkenNo: data.bukkenNo, bukkenName: data.bukkenName,
                                        supplierName: data.supplierName, payContractDay: data.payContractDay, payContractFixDay: data.payContractFixDay};}
                  ).filter((thing, i, arr) => arr.findIndex(t => t.pid === thing.pid) === i);

    lst.sort((a,b) => {
      return a.bukkenNo.localeCompare(b.bukkenNo);
    });
    lst.forEach(data => {
      data['details'] = res.filter(me => me.payContractPid == data.pid)
                           .map(me => {return {paymentCode: me.paymentCode, contractDay: me.contractDay};});
    });    
    return lst;
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
    this.router.navigate(['/paydetail'], {queryParams: {pid: row.pid}});
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}