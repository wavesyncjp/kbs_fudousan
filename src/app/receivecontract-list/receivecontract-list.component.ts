import { Component, ViewChild } from '@angular/core';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { Receivecontractinfo } from '../models/receivecontractinfo';
import { Router,ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';
import { Code } from '../models/bukken';

@Component({
  selector: 'app-receivecontract-list',
  templateUrl: './receivecontract-list.component.html',
  styleUrls: ['./receivecontract-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class ReceiveContractListComponent extends BaseComponent {
  public cond = {
    bukkenNo: '',
    contractBukkenNo_Like:'',
    bukkenName: '',
    receiveCode: '',
    supplierName: '',
    contractDay_From: '',
    contractDayMap_From: '',
    contractDay_To: '',
    contractDayMap_To: '',
    contractFixDay_From: '',
    contractFixDayMap_From: '',
    contractFixDay_To: '',
    contractFixDayMap_To: '',
    receiveDay_From: '',
    receiveDayMap_From: '',
    receiveDay_To: '',
    receiveDayMap_To: '',
    receiveFixDay_From: '',
    receiveFixDayMap_From: '',
    receiveFixDay_To:'',
    receiveFixDayMap_To:''
 };
  search = '0';
  searched = false;
  selectedRowIndex = -1;

  // displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo', 'bukkenName', 'supplierName', 'receiveCode','contractDay','contractFixDay','receivePriceTax','delete', 'detail', 'copy'];
  displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo', 'bukkenName', 'supplierName', 'receiveCode','contractFixDay','receivePriceTax','delete', 'detail', 'copy'];

  dataSource = new MatTableDataSource<Receivecontractinfo>();
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

  receiveTypes: Code[];

  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('入金管理一覧');
    this.dataSource.paginator = this.paginator;
    
    if (this.search === '1') {
      this.cond = this.service.searchCondition;
      if(this.cond == null) {
        this.resetCondition();
      }
    }

    const funcs = [];
    funcs.push(this.service.searchReceiveType(null));
    Promise.all(funcs).then(values => {
      this.recTypes = values[0];
      this.receiveTypes = this.getReceiveTypes();
    });

    if (this.search === '1') {
      this.searchReceiveContract();
    }
  }

  /**
   * 検索条件リセット
   */
  resetCondition() {
    this.cond = {
      bukkenNo: '',
      contractBukkenNo_Like:'',
      bukkenName: '',
      receiveCode: '',
      supplierName: '',
      contractDay_From: '',
      contractDayMap_From: '',
      contractDay_To: '',
      contractDayMap_To: '',
      contractFixDay_From: '',
      contractFixDayMap_From: '',
      contractFixDay_To: '',
      contractFixDayMap_To: '',
      receiveDay_From: '',
      receiveDayMap_From: '',
      receiveDay_To: '',
      receiveDayMap_To: '',
      receiveFixDay_From: '',
      receiveFixDayMap_From: '',
      receiveFixDay_To:'',
      receiveFixDayMap_To:''
      };
  }

  /**
   * 検索
   */
  searchReceiveContract() {
    this.spinner.show();

    this.cond.contractDay_From = this.cond.contractDayMap_From != null ? this.datepipe.transform(this.cond.contractDayMap_From, 'yyyyMMdd') : "";
    this.cond.contractDay_To = this.cond.contractDayMap_To != null ? this.datepipe.transform(this.cond.contractDayMap_To, 'yyyyMMdd') : "";
    this.cond.contractFixDay_From = this.cond.contractFixDayMap_From != null ? this.datepipe.transform(this.cond.contractFixDayMap_From, 'yyyyMMdd') : "";
    this.cond.contractFixDay_To = this.cond.contractFixDayMap_To != null ? this.datepipe.transform(this.cond.contractFixDayMap_To, 'yyyyMMdd') : "";
    this.cond.receiveDay_From = this.cond.receiveDayMap_From != null ? this.datepipe.transform(this.cond.receiveDayMap_From, 'yyyyMMdd') : "";
    this.cond.receiveDay_To = this.cond.receiveDayMap_To != null ? this.datepipe.transform(this.cond.receiveDayMap_To, 'yyyyMMdd') : "";
    this.cond.receiveFixDay_From = this.cond.receiveFixDayMap_From != null ? this.datepipe.transform(this.cond.receiveFixDayMap_From, 'yyyyMMdd') : "";
    this.cond.receiveFixDay_To = this.cond.receiveFixDayMap_To != null ? this.datepipe.transform(this.cond.receiveFixDayMap_To, 'yyyyMMdd') : "";

    this.service.searchReceiveContract(this.cond).then(res => {
      if (res !== null && res.length > 0) {
        res.forEach(obj => {
          obj['select'] = true;
        });
      }
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
    const lst = res.map(data => {return {pid: data.receiveContractPid, bukkenNo: data.bukkenNo, bukkenName: data.bukkenName,
                                        supplierName: data.supplierName, receiveContractDay: data.receiveContractDay, receiveContractFixDay: data.receiveContractFixDay};}
                  ).filter((thing, i, arr) => arr.findIndex(t => t.pid === thing.pid) === i);

    lst.sort((a,b) => {
      return a.bukkenNo.localeCompare(b.bukkenNo);
    });
    lst.forEach(data => {
      data['details'] = res.filter(me => me.receiveContractPid == data.pid)
                           .map(me => {return {receiveCode: me.receiCode, contractDay: me.contractDay};});
    });
    return lst;
  }

  createNew() {
    this.router.navigate(['/receivedetail']);
  }

  deleteRow(row: Receivecontractinfo) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteReceiveContracte(row.pid).then(res => {
          this.searchReceiveContract();
        });
      }
    });
  }

  showDetail(row: Receivecontractinfo) {
    this.router.navigate(['/receivedetail'], {queryParams: {pid: row.pid}});
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }

  copyDetail(row: Receivecontractinfo) {
    this.router.navigate(['/receivedetail'], {queryParams: {bukkenid: row.tempLandInfoPid}});
  }
}
