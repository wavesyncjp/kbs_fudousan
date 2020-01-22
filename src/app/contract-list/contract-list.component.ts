import { Component, OnInit, ViewChild } from '@angular/core';
import { BackendService } from '../backend.service';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter, MatPaginatorIntl, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ContractDetailComponent } from '../contract-detail/contract-detail.component';
import { JPDateAdapter, MatPaginatorIntlJa } from '../adapters/adapters';
import { Router } from '@angular/router';
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

  displayedColumns: string[] = ['bukkenNo', 'bukkenName', 'remark1', 'remark2',
                                'contractNo', 'buildingType', 'contractOwner', 'detail'];
  dataSource = new MatTableDataSource<Templandinfo>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  cond = {
    bukkenNo: '',
    bukkenName: '',
    contractNumber: '',
    vacationDayMap: null,
    vacationDay: '',
    contractDay: '',
    contractDayMap: null
 };

  constructor(public router: Router,
              public service: BackendService,
              public dialog: MatDialog,
              private spinner: NgxSpinnerService) {
                super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('仕入契約一覧');
    this.dataSource.paginator = this.paginator;
  }

  searchContract() {
    this.spinner.show();
    this.cond.vacationDay = this.cond.vacationDayMap != null ? this.cond.vacationDayMap.toLocaleDateString() : null;
    this.cond.contractDay = this.cond.contractDayMap != null ? this.cond.contractDayMap.toLocaleDateString() : null;
    this.service.searchContract(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      this.spinner.hide();
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
}
