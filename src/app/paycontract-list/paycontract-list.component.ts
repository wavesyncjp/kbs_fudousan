import { Component, ViewChild } from '@angular/core';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { Paycontractinfo } from '../models/paycontractinfo';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';
import { Util } from '../utils/util';
import { CsvTemplateComponent } from '../csv-template/csv-template.component';
import { Code } from '../models/bukken';

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
    contractBukkenNo_Like: '',//20200913 Add
    bukkenName: '',
    paymentCode: '',
    paymentCodeFilter: '',//20230314 Add
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
    // 20231211 S_Update
    payDayMap_From: '',
    // payDayMap_From: new Date(),
    // 20231211 E_Update
    payDay_To: '',
    payDayMap_To: '',
    //20200913 S_Add
    payFixDay_From: '',
    payFixDayMap_From: '',
    payFixDay_To: '',
    payFixDayMap_To: '',
    //20200913 E_Add
    // 20230331 S_Add
    payDay_FromFilter: '',
    payDayMap_FromFilter: '',
    payDay_ToFilter: '',
    payDayMap_ToFilter: '',
    payFixDay_FromFilter: '',
    payFixDayMap_FromFilter: '',
    payFixDay_ToFilter: '',
    payFixDayMap_ToFilter: '',
    // 20230331 E_Add
  };
  search = '0';
  searched = false;
  selectedRowIndex = -1;
  // 20220511 S_Update
  //20200730 S_Update
  /*displayedColumns: string[] = ['bukkenNo','bukkenName','supplierName','payContractDay','payContractFixDay', 'paymentCode','contractDay','delete', 'detail', 'csvCheck'];*/
  /*
  displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo', 'bukkenName', 'supplierName', 'paymentCode','contractDay','contractFixDay','payPriceTax','delete', 'detail', 'copy', 'csvCheck'];
  */
  displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo', 'bukkenName', 'supplierName', 'paymentCode', 'contractDay', 'contractFixDay', 'payPriceTax', 'delete', 'detail', 'copy', 'csvCheck', 'costCheck'];
  //20200730 E_Update
  // 20220511 E_Update
  dataSource = new MatTableDataSource<Paycontractinfo>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(public router: Router,
    public dialog: MatDialog,
    public datepipe: DatePipe,
    private route: ActivatedRoute,
    public service: BackendService,
    private spinner: NgxSpinnerService) {
    super(router, service, dialog);
    this.route.queryParams.subscribe(params => {
      this.search = params.search;
    });
  }

  paymentTypes: Code[];// 20210211 Add
  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('支払管理一覧');
    this.dataSource.paginator = this.paginator;
    if (this.search === '1') {
      this.cond = this.service.searchCondition;
      if (this.cond == null) {
        this.resetCondition();
      }
    }

    // 20210211 S_Update
    /*
    this.service.getPaymentTypes(null).then(ret => {
      this.payTypes = ret;
    });
    */
    const funcs = [];
    funcs.push(this.service.searchPaymentType({ payContractEntryFlg: '1' }));
    Promise.all(funcs).then(values => {
      this.payTypes = values[0];
      this.paymentTypes = this.getPaymentTypes();
    });
    // 20210211 E_Update

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
      contractBukkenNo_Like: '',//20200913 Add
      paymentCode: '',
      paymentCodeFilter: '',//20230314 Add
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
      // 20231211 S_Update
      payDayMap_From: '',
      // payDayMap_From: new Date(),
      // 20231211 S_Update
      payDay_To: '',
      payDayMap_To: '',
      //20200913 S_Add
      payFixDay_From: '',
      payFixDayMap_From: '',
      payFixDay_To: '',
      payFixDayMap_To: '',
      //20200913 E_Add
      // 20230331 S_Add
      payDay_FromFilter: '',
      payDayMap_FromFilter: '',
      payDay_ToFilter: '',
      payDayMap_ToFilter: '',
      payFixDay_FromFilter: '',
      payFixDayMap_FromFilter: '',
      payFixDay_ToFilter: '',
      payFixDayMap_ToFilter: '',
      // 20230331 E_Add
    };
  }

  /**
   * 検索
   */
  searchPayContract() {
    // 20231213 S_Add
    if (!this.validate()) return;
    // 20231213 E_Add

    this.spinner.show();

    this.cond.contractDay_From = this.cond.contractDayMap_From != null ? this.datepipe.transform(this.cond.contractDayMap_From, 'yyyyMMdd') : "";
    this.cond.contractDay_To = this.cond.contractDayMap_To != null ? this.datepipe.transform(this.cond.contractDayMap_To, 'yyyyMMdd') : "";
    this.cond.contractFixDay_From = this.cond.contractFixDayMap_From != null ? this.datepipe.transform(this.cond.contractFixDayMap_From, 'yyyyMMdd') : "";
    this.cond.contractFixDay_To = this.cond.contractFixDayMap_To != null ? this.datepipe.transform(this.cond.contractFixDayMap_To, 'yyyyMMdd') : "";
    this.cond.payDay_From = this.cond.payDayMap_From != null ? this.datepipe.transform(this.cond.payDayMap_From, 'yyyyMMdd') : "";
    this.cond.payDay_To = this.cond.payDayMap_To != null ? this.datepipe.transform(this.cond.payDayMap_To, 'yyyyMMdd') : "";
    //20200913 S_Add
    this.cond.payFixDay_From = this.cond.payFixDayMap_From != null ? this.datepipe.transform(this.cond.payFixDayMap_From, 'yyyyMMdd') : "";
    this.cond.payFixDay_To = this.cond.payFixDayMap_To != null ? this.datepipe.transform(this.cond.payFixDayMap_To, 'yyyyMMdd') : "";
    //20200913 E_Add
    this.cond.paymentCodeFilter = this.cond.paymentCode;//20230314 Add
    // 20230331 S_Add
    this.cond.payDay_FromFilter = this.cond.payDay_From;
    this.cond.payDay_ToFilter = this.cond.payDay_To;
    this.cond.payFixDay_FromFilter = this.cond.payFixDay_From;
    this.cond.payFixDay_ToFilter = this.cond.payFixDay_To;
    // 20230331 E_Add

    this.service.searchPayContract(this.cond).then(res => {
      //const lst = this.groupData(res);
      // 20210806 S_Add
      // CSVチェックの初期値ON
      if (res !== null && res.length > 0) {
        res.forEach(obj => {
          obj['select'] = true;
        });
      }
      // 20210806 E_Add
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
    const lst = res.map(data => {
      return {
        pid: data.payContractPid, bukkenNo: data.bukkenNo, bukkenName: data.bukkenName,
        supplierName: data.supplierName, payContractDay: data.payContractDay, payContractFixDay: data.payContractFixDay
      };
    }
    ).filter((thing, i, arr) => arr.findIndex(t => t.pid === thing.pid) === i);

    lst.sort((a, b) => {
      return a.bukkenNo.localeCompare(b.bukkenNo);
    });
    lst.forEach(data => {
      data['details'] = res.filter(me => me.payContractPid == data.pid)
        .map(me => { return { paymentCode: me.paymentCode, contractDay: me.contractDay }; });
    });
    return lst;
  }

  // 20210207 S_Update
  //  createNew(raw : PayContractDetailComponent) {
  createNew() {
    // 20210207 E_Update
    this.router.navigate(['/paydetail']);
  }

  deleteRow(row: Paycontractinfo) {
    const dlg = new Dialog({ title: '確認', message: '削除してよろしいですか？' });
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
    this.router.navigate(['/paydetail'], { queryParams: { pid: row.pid } });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }

  /**
   * CSV出力
   */
  csvExport() {

    let lst = this.dataSource.data.filter(me => me['select']).map(me => Number(me.pid));
    if (lst.length === 0) return;

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

  // 20210311 S_Add
  copyDetail(row: Paycontractinfo) {
    this.router.navigate(['/paydetail'], { queryParams: { bukkenid: row.tempLandInfoPid } });
  }
  // 20210311 E_Add
  // 20220511 S_Add
  /**
   * 支払依頼書出力
   */
  costExport() {

    let lst: number[] = [];
    this.dataSource.data.forEach(me => {
      if (me['details'] != null) {
        me['details'].forEach(ct => {
          if (ct['select']) {
            lst.push(Number(ct['pid']));
          }
        });
      }
    });
    if (lst.length === 0) return;

    const dlg = new Dialog({ title: '確認', message: '支払依頼書を出力します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportCostRequest(lst).then(data => {
          this.service.writeToFile(data, "諸経費等");
          this.spinner.hide();
        });
      }
    });
  }
  // 20220511 E_Add

  // 20231213 S_Add
  /**
   * バリデーション
   */
  validate(): boolean {
    let hasSearchItem = false;
    this.errorMsgs = [];

    if (!this.isBlank(this.cond.bukkenNo)) hasSearchItem = true;
    if (!this.isBlank(this.cond.contractBukkenNo_Like)) hasSearchItem = true;
    if (!this.isBlank(this.cond.bukkenName)) hasSearchItem = true;
    if (!this.isBlank(this.cond.paymentCode)) hasSearchItem = true;
    if (!this.isBlank(this.cond.supplierName)) hasSearchItem = true;
    if (!this.isBlank(this.cond.contractDayMap_From)) hasSearchItem = true;
    if (!this.isBlank(this.cond.contractDayMap_To)) hasSearchItem = true;
    if (!this.isBlank(this.cond.contractFixDayMap_From)) hasSearchItem = true;
    if (!this.isBlank(this.cond.contractFixDayMap_To)) hasSearchItem = true;
    if (!this.isBlank(this.cond.payDayMap_From)) hasSearchItem = true;
    if (!this.isBlank(this.cond.payDayMap_To)) hasSearchItem = true;
    if (!this.isBlank(this.cond.payFixDayMap_From)) hasSearchItem = true;
    if (!this.isBlank(this.cond.payFixDayMap_To)) hasSearchItem = true;

    if (!hasSearchItem) {
      this.errorMsgs.push('検索条件のいずれかを指定してください。');
      return false;
    }
    return true;
  }
  // 20231213 E_Add
}