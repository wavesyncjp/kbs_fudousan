import { Component, OnInit,ViewChild } from '@angular/core';
import { PlanDetailComponent } from '../Plan-detail/Plan-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code } from '../models/bukken';
import { DatePipe } from '@angular/common';
import { Planinfo } from '../models/planinfo';
import { Router,ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';


@Component({
  selector: 'app-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class PlanListComponent extends BaseComponent {
  public cond = {
    bukkenNo: '',
    bukkenName: '',
    address: '',
    planName: '',
    createDay: '',
    createDayMap: ''
 };
  search = '0';
  selectedRowIndex = -1;
  displayedColumns: string[] = ['create', 'bukkenNo', 'bukkenName', 'address', 'planName', 'createDay', 'delete', 'detail'];
  dataSource = new MatTableDataSource<Planinfo>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(public router: Router,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              private route: ActivatedRoute,
              public service: BackendService,
              private spinner: NgxSpinnerService,) {
    super(router, service);
    this.route.queryParams.subscribe(params => {
      this.search = params.search;
    });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('事業収支一覧');
    this.dataSource.paginator = this.paginator;

    if (this.search === '1') {
      this.cond = this.service.searchCondition;
    }

    const funcs = [];
    /*funcs.push(this.service.getCodes(['014']));*/

    Promise.all(funcs).then(values => {

      // コード
      const codes = values[0] as Code[];
      if (codes != null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }

      if (this.search === '1') {
        this.searchPlan();
      }

    });
  }

  /**
   * 検索
   */
  searchPlan() {
    this.spinner.show();

    this.cond.createDay = this.cond.createDayMap != null ? this.datepipe.transform(this.cond.createDayMap, 'yyyyMMdd') : "";

    this.service.searchPlan(this.cond).then(res => {
      this.service.searchCondition = this.cond;
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  createPlan(row: Planinfo) {
    this.router.navigate(['/plandetail'], {queryParams: {bukkenid: row.tempLandInfoPid}});
  }

  createNew(raw : PlanDetailComponent) {
    this.router.navigate(['/plandetail']);
  }

  deleteRow(row: Planinfo) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deletePlan(row.pid).then(res => {
          this.searchPlan();
        });
      }
    });
  }
/*
  showDetail(row: Planinfo) {
    const dialogRef = this.dialog.open(PlanListComponent, {
      width: '840px',
      height: '420px',
      data: row
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchPlan();
      }
    });
  }*/
  showDetail(row: Planinfo) {
    this.router.navigate(['/plandetail'], {queryParams: {pid: row.pid}});
  }
  

  highlight(row) {
    this.selectedRowIndex = row.tempLandInfoPid;
  }
  
}