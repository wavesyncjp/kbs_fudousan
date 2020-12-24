import { Component, OnInit, ViewChild } from '@angular/core';
import { BackendService } from '../backend.service';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter, MatPaginatorIntl, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ContractDetailComponent } from '../contract-detail/contract-detail.component';
import { JPDateAdapter, MatPaginatorIntlJa } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BaseComponent } from '../BaseComponent';
import { Contractinfo } from '../models/contractinfo';
import { Templandinfo } from '../models/templandinfo';

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

  //20200906 S_Update
  /*
  displayedColumns: string[] = ['bukkenNo', 'bukkenName', 'contractBukkenNo', 'remark1', 'remark2', 'contractNo', 'contractOwner', 'detail'];
  */
  displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo', 'bukkenName', 'remark1', 'contractStaffName', 'tradingPrice', 'contractNo', 'date', 'decisionDay', 'detail'];
  //20200906 E_Update
  dataSource = new MatTableDataSource<Templandinfo>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  cond = {
    bukkenNo: '',
    contractBukkenNo:'',
    bukkenName: '',
    contractNumber: '',
    vacationDayMap: null,
    vacationDay: '',
    //20200730 S_Update
    /*
    contractDay: '',
    contractDayMap: null
    */
    contractDay_FromMap: null,
    contractDay_From: '',
    contractDay_ToMap: null,
    contractDay_To: '',
    //20200730 E_Update
    //20201223 S_Add
    decisionDay_FromMap: null,
    decisionDay_From: '',
    decisionDay_ToMap: null,
    decisionDay_To: ''
    //20201223 E_Add
 };
 search = '0';

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
    Promise.all(funcs).then(values => {
      this.emps = values[0];
    });
    // 20200921 E_Add
  }

  /**
   * 検索条件リセット
   */
  resetCondition() {
    this.cond = {
      bukkenNo: '',
      contractBukkenNo:'',
      bukkenName: '',
      contractNumber: '',
      vacationDayMap: null,
      vacationDay: '',
      //20200730 S_Update
      /*
      contractDay: '',
      contractDayMap: null
      */
      contractDay_FromMap: null,
      contractDay_From: '',
      contractDay_ToMap: null,
      contractDay_To: '',
      //20200730 E_Update
      //20201223 S_Add
      decisionDay_FromMap: null,
      decisionDay_From: '',
      decisionDay_ToMap: null,
      decisionDay_To: ''
      //20201223 E_Add
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
    this.service.searchContract(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      this.spinner.hide();
      this.service.searchCondition = this.cond;
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
}
