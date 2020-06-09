import { Component, OnInit,ViewChild } from '@angular/core';
import { PayContractDetailComponent } from '../PayContract-detail/PayContract-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { Paycontractinfo } from '../models/paycontractinfo';
import { Router,ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';
import { Util } from '../utils/util';
import { CsvTemplateComponent } from '../csv-template/csv-template.component';

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
  public cond = {
    bukkenNo: '',
    bukkenName: '',
    paymentCode: '',
    supplierName: '',
    contractDay_From: '',
    contractDayMap_From: '',
    contractDay_To: '',
    contractDayMap_To: '',
    contractFixDay_From: '',
    contractFixDayMap_From: '',
    contractFixDay_To: '',
    contractFixDayMap_To: '',
    payDay_From: '',
    payDayMap_From: '',
    payDay_To: '',
    payDayMap_To: ''
 };
  search = '0';
  searched = false;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['bukkenNo','bukkenName','supplierName','payContractDay','payContractFixDay', 'paymentCode','contractDay','delete', 'detail', 'csvCheck'];// 'paymentCode',
  dataSource = new MatTableDataSource<Paycontractinfo>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(public router: Router,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              private route: ActivatedRoute,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
    super(router, service,dialog);
    this.route.queryParams.subscribe(params => {
      this.search = params.search;
    });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('支払管理一覧');
    this.dataSource.paginator = this.paginator;
    
    if (this.search === '1') {
      this.cond = this.service.searchCondition;
      if(this.cond == null) {
        this.resetCondition();
      }
    }

    this.service.getPaymentTypes(null).then(ret => {
      this.payTypes = ret;
    });

    if (this.search === '1') {
      this.searchPayContract();
    }
  }

  /**
   * 検索条件リセット
   */
  resetCondition() {
    this.cond = {
      bukkenNo: '',
      bukkenName: '',
      paymentCode: '',
      supplierName: '',
      contractDay_From: '',
      contractDayMap_From: '',
      contractDay_To: '',
      contractDayMap_To: '',
      contractFixDay_From: '',
      contractFixDayMap_From: '',
      contractFixDay_To: '',
      contractFixDayMap_To: '',
      payDay_From: '',
      payDayMap_From: '',
      payDay_To: '',
      payDayMap_To: ''
   };
  }

  /**
   * 検索
   */
  searchPayContract() {
    this.spinner.show();

    this.cond.contractDay_From = this.cond.contractDayMap_From != null ? this.datepipe.transform(this.cond.contractDayMap_From, 'yyyyMMdd') : "";
    this.cond.contractDay_To = this.cond.contractDayMap_To != null ? this.datepipe.transform(this.cond.contractDayMap_To, 'yyyyMMdd') : "";
    this.cond.contractFixDay_From = this.cond.contractFixDayMap_From != null ? this.datepipe.transform(this.cond.contractFixDayMap_From, 'yyyyMMdd') : "";
    this.cond.contractFixDay_To = this.cond.contractFixDayMap_To != null ? this.datepipe.transform(this.cond.contractFixDayMap_To, 'yyyyMMdd') : "";
    this.cond.payDay_From = this.cond.payDayMap_From != null ? this.datepipe.transform(this.cond.payDayMap_From, 'yyyyMMdd') : "";
    this.cond.payDay_To = this.cond.payDayMap_To != null ? this.datepipe.transform(this.cond.payDayMap_To, 'yyyyMMdd') : "";

    this.service.searchPayContract(this.cond).then(res => {
      //const lst = this.groupData(res);
      this.service.searchCondition = this.cond;
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      this.searched = true;
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

  /**
   * CSV出力
   */
  csvExport(){

    let lst = this.dataSource.data.filter(me => me['select']).map(me => Number(me.pid));
    if(lst.length === 0) return;

    //テンプレート選択
    const dialogRef = this.dialog.open(CsvTemplateComponent, {
      width: '450px',
      height: '200px',
      data: {
        type: '02'
      }
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result && result['choose']) {
        this.spinner.show();
        this.service.exportCsv(lst, result['csvCode']).then(ret => {
          Util.stringToCSV(ret['data'], result['csvName']);
          this.spinner.hide();
        });    
      }
    });
  }
}