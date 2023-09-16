import { Component, OnInit, ViewChild } from '@angular/core';
import { BackendService } from '../backend.service';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter, MatPaginatorIntl, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { JPDateAdapter, MatPaginatorIntlJa } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BaseComponent } from '../BaseComponent';
import { RentalInfo } from '../models/rentalinfo';
import { Code } from '../models/bukken';

@Component({
  selector: 'app-rental-list',
  templateUrl: './rental-list.component.html',
  styleUrls: ['./rental-list.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter},
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
  ],
})
export class RentalInfoListComponent  extends BaseComponent {

  displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo', 'apartmentName', 'ownershipRelocationDate', 'validType', 'bankPid', 'detail'];
  dataSource = new MatTableDataSource<RentalInfo>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  bankPids: Code[];
  cond = {
    bukkenNo: ''// 物件番号
    , contractBukkenNo_Like: ''// 契約物件番号
    , ownershipRelocationDate_FromMap: null// 所有権移転日 From
    , ownershipRelocationDate_From: ''// 所有権移転日 From
    , ownershipRelocationDate_ToMap: null// 所有権移転日 To
    , ownershipRelocationDate_To: ''// 所有権移転日 To
    ,validType: ''// 有効区分
    , bankPid: ''// 入金口座
  };
  search = '0';
  searched = false;

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

    this.service.changeTitle('賃貸情報一覧');
    this.dataSource.paginator = this.paginator;
    if (this.search === '1') {
      this.cond = this.service.searchCondition;
      if(this.cond == null) {
        this.resetCondition();
      }
      this.searchRental();
    }
    const funcs = [];
    funcs.push(this.service.getCodes(['005']));
    funcs.push(this.service.getBanks('1'));

    Promise.all(funcs).then(values => {
      // コード
      this.processCodes(values[0] as Code[]);
      
      this.banks = values[1];
      this.bankPids = this.getBanks();
    });
  }

  /**
   * 検索条件リセット
   */
  resetCondition() {
    this.cond = {
      bukkenNo: ''
      , contractBukkenNo_Like: ''
      , ownershipRelocationDate_FromMap: null
      , ownershipRelocationDate_From: ''
      , ownershipRelocationDate_ToMap: null
      , ownershipRelocationDate_To: ''
      , validType: ''
      , bankPid: ''
   };
  }

  /**
   * 検索
   */
  searchRental() {
    this.spinner.show();
    this.cond.ownershipRelocationDate_From = this.cond.ownershipRelocationDate_FromMap != null ? this.datepipe.transform(this.cond.ownershipRelocationDate_FromMap, 'yyyyMMdd') : "";
    this.cond.ownershipRelocationDate_To = this.cond.ownershipRelocationDate_ToMap != null ? this.datepipe.transform(this.cond.ownershipRelocationDate_ToMap, 'yyyyMMdd') : "";

    this.service.searchRental(this.cond).then(res => {
      res.forEach(me => {
      });

      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      this.spinner.hide();
      this.service.searchCondition = this.cond;
      this.searched = true;
    });
  }

  /**
   * 賃貸詳細
   * @param obj ：賃貸情報
   */
  showRental(obj: RentalInfo) {
    this.router.navigate(['/rendetail'], {queryParams: {pid: obj.pid, contractInfoPid:obj.contractInfoPid}});
  }

  /**
   * 口座名
   * @param bankPid ：口座PID
   */
  getBankName(bankPid) {
    if (bankPid !== null) {
      return this.bankPids.filter(c => c.codeDetail === bankPid.toString()).map(c => c.name)[0];
    }
    return null;
  }
}
