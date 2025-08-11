import { Component, OnInit, ViewChild } from '@angular/core';
import { BackendService } from '../backend.service';
// 20250804 E_Update
// import { MatDialog, MAT_DATE_LOCALE, DateAdapter, MatPaginatorIntl, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter, MatPaginatorIntl, MatTableDataSource, MatSort, MatPaginator, PageEvent } from '@angular/material';
// 20250804 E_Update
import { NgxSpinnerService } from 'ngx-spinner';
import { JPDateAdapter, MatPaginatorIntlJa } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BaseComponent } from '../BaseComponent';
import { Contractinfo } from '../models/contractinfo';
import { Templandinfo } from '../models/templandinfo';
import { Util } from '../utils/util';
import { CsvTemplateComponent } from '../csv-template/csv-template.component';
// 20210314 S_Add
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Dialog } from '../models/dialog';
// 20210314 E_Add
import { Code } from '../models/bukken';// 20221122 Add

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter},
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
  ],
})
export class ContractListComponent  extends BaseComponent {

  // 20221122 S_Update
  /*
  displayedColumns: string[] = ['bukkenNo', 'bukkenName', 'contractBukkenNo', 'remark1', 'remark2', 'contractNo', 'contractOwner', 'detail'];
  */
  displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo', 'bukkenName', 'remark1', 'contractStaffName', 'tradingPrice', 'contractNo', 'contractDay', 'decisionDay', 'contractNow', 'canncellDay', 'delete', 'detail', 'csvCheck'];
  // 20221122 E_Update
  dataSource = new MatTableDataSource<Templandinfo>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  cond = {
    bukkenNo: ''
    // 20220912 S_Update
    // , contractBukkenNo:''
    , contractBukkenNo_Like: ''
    // 20220912 E_Update
    , bukkenName: ''
    , contractNumber: ''
    , vacationDayMap: null
    , vacationDay: ''
    //20200730 S_Update
    /*
    contractDay: '',
    contractDayMap: null
    */
    , contractDay_FromMap: null
    , contractDay_From: ''
    , contractDay_ToMap: null
    , contractDay_To: ''
    //20200730 E_Update
    //20201223 S_Add
    , decisionDay_FromMap: null
    , decisionDay_From: ''
    , decisionDay_ToMap: null
    , decisionDay_To: ''
    //20201223 E_Add
    , department: []// 20220519 Add
    // 20221122 S_Add
    , contractNow: ''
    , canncellDay_FromMap: null
    , canncellDay_From: ''
    , canncellDay_ToMap: null
    , canncellDay_To: ''
    // 20221122 E_Add
    , pageSize : 10// 20250804 Add
    , pageIndex : 0// 20250804 Add
  };
  search = '0';
  searched = false;// 20210103 Add
  // 20210314 S_Add
  authority = '';
  enableUser: boolean = false;
  // 20210314 E_Add

  constructor(public router: Router,
              private route: ActivatedRoute,
              public service: BackendService,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              private spinner: NgxSpinnerService) {
                super(router, service,dialog);
                this.route.queryParams.subscribe(params => {
                  this.search = params.search;
                });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();

    // 20210314 S_Add
    this.authority = this.service.loginUser.authority;
    this.enableUser = (this.authority === '01');
    // 20210314 E_Add

    this.service.changeTitle('仕入契約一覧');
    this.dataSource.paginator = this.paginator;
    if (this.search === '1') {
      this.cond = this.service.searchCondition;
      if(this.cond == null) {
        this.resetCondition();
      }
      this.searchContract();
    }
    // 20200921 S_Add
    const funcs = [];
    funcs.push(this.service.getEmps(null));
    funcs.push(this.service.getDeps(null));// 20220519 Add
    funcs.push(this.service.getCodes(['019']));// 20221122 Add
    Promise.all(funcs).then(values => {
      this.emps = values[0];
      this.deps = values[1];// 20220519 Add
      // 20221122 S_Add
      // コード
      const codes = values[2] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }
      // 20221122 E_Add
    });
    // 20200921 E_Add
  }

  /**
   * 検索条件リセット
   */
  resetCondition() {
    this.cond = {
      bukkenNo: ''
      // 20220912 S_Update
      // , contractBukkenNo:''
      , contractBukkenNo_Like: ''
      // 20220912 E_Update
      , bukkenName: ''
      , contractNumber: ''
      , vacationDayMap: null
      , vacationDay: ''
      //20200730 S_Update
      /*
      contractDay: '',
      contractDayMap: null
      */
      , contractDay_FromMap: null
      , contractDay_From: ''
      , contractDay_ToMap: null
      , contractDay_To: ''
      //20200730 E_Update
      //20201223 S_Add
      , decisionDay_FromMap: null
      , decisionDay_From: ''
      , decisionDay_ToMap: null
      , decisionDay_To: ''
      //20201223 E_Add
      , department: []// 20220519 Add
      // 20221122 S_Add
      , contractNow: ''
      , canncellDay_FromMap: null
      , canncellDay_From: ''
      , canncellDay_ToMap: null
      , canncellDay_To: ''
      // 20221122 E_Add
      , pageSize : 10// 20250804 Add
      , pageIndex : 0// 20250804 Add
   };
  }

  /**
   * 検索
   */
  searchContract() {
    this.spinner.show();
    this.cond.vacationDay = this.cond.vacationDayMap != null ? this.datepipe.transform(this.cond.vacationDayMap, 'yyyyMMdd') : null;
    //20200730 S_Update
    /*
    this.cond.contractDay = this.cond.contractDayMap != null ? this.datepipe.transform(this.cond.contractDayMap, 'yyyyMMdd') : null;
    */
    this.cond.contractDay_From = this.cond.contractDay_FromMap != null ? this.datepipe.transform(this.cond.contractDay_FromMap, 'yyyyMMdd') : "";
    this.cond.contractDay_To = this.cond.contractDay_ToMap != null ? this.datepipe.transform(this.cond.contractDay_ToMap, 'yyyyMMdd') : "";
    //20200730 E_Update
    //20201223 S_Add
    this.cond.decisionDay_From = this.cond.decisionDay_FromMap != null ? this.datepipe.transform(this.cond.decisionDay_FromMap, 'yyyyMMdd') : "";
    this.cond.decisionDay_To = this.cond.decisionDay_ToMap != null ? this.datepipe.transform(this.cond.decisionDay_ToMap, 'yyyyMMdd') : "";
    //20201223 E_Add
    //20221122 S_Add
    this.cond.canncellDay_From = this.cond.canncellDay_FromMap != null ? this.datepipe.transform(this.cond.canncellDay_FromMap, 'yyyyMMdd') : "";
    this.cond.canncellDay_To = this.cond.canncellDay_ToMap != null ? this.datepipe.transform(this.cond.canncellDay_ToMap, 'yyyyMMdd') : "";
    //20221122 E_Add
    this.service.searchContract(this.cond).then(res => {
      // 20210103 S_Add
      res.forEach(me => {
        if(me['contracts'] != null) {
          me['contracts'].forEach(ct => {
            ct['select'] = true;
          });
        }
      });
      // 20210103 E_Add
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      this.spinner.hide();
      this.service.searchCondition = this.cond;
      this.searched = true;// 20210103 Add
    });
  }

  showContract(ct: Contractinfo) {
    this.router.navigate(['/ctdetail'], {queryParams: {pid: ct.pid}});
  }

  getLocationType(locationId: number, locs: any) {
    if (locationId === 0) {
      return '';
    }
    for (const ele of locs) {
      if (ele.pid === locationId) {
        return (ele.locationType === '01' ? '土地' : '建物');
      }
    }
    return '';
  }

  getContractStaffName(contractinfo: Contractinfo) {
    // 契約担当者
    let staff = [];
    let contractStaffName = '';
    if(!this.isBlank(contractinfo.contractStaff)) {
      contractinfo.contractStaff.split(',').forEach(me => {
        let lst = this.emps.filter(us=>us.userId === me).map(me => me.userName);
        if(lst.length > 0) {
          staff.push(lst[0]);
        }
      });
      contractStaffName = staff.join(',');
    }
    return contractStaffName;
  }

  // 20210103 S_Add
  /**
   * CSV出力
   */
  csvExport(){

    let lst: number[] = [];
    this.dataSource.data.forEach(me => {
      if(me['contracts'] != null) {
        me['contracts'].forEach(ct => {
          if(ct['select']) {
            lst.push(Number(ct['pid']));
          }
        });
      }
    });
    if(lst.length === 0) return;

    //テンプレート選択
    const dialogRef = this.dialog.open(CsvTemplateComponent, {
      width: '450px',
      height: '200px',
      data: {
        type: '03'
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
  // 20210103 E_Add
  // 20210314 S_Add
  deleteRow(ct: Contractinfo) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteContract(ct.pid).then(res => {
          this.searchContract();
        });
      }
    });
  }
  // 20210314 E_Add


  // 20250804 S_Add
  ngAfterViewInit() {
    if (this.search === '1') {
      setTimeout(() => {
        this.paginator.pageIndex = this.cond.pageIndex;
        this.paginator._changePageSize(this.cond.pageSize); 
      });
    }
  }

  onPageChange(event: PageEvent, cond: any) {
    cond.pageSize = event.pageSize; 
    cond.pageIndex = event.pageIndex;
  }
  // 20250804 E_Add  
}
