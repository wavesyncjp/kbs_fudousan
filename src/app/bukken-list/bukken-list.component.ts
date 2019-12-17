import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../backend.service';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Templandinfo } from '../models/templandinfo';
import { Code } from '../models/bukken';

@Component({
  selector: 'app-bukken-list',
  templateUrl: './bukken-list.component.html',
  styleUrls: ['./bukken-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ]
})
export class BukkenListComponent extends BaseComponent {

  public cond: any;
  search = '0';
  searched = false;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['bukkenNo', 'bukkenName', 'remark1', 'pickDate', 'department', 'result', 'detail'];
  dataSource = new MatTableDataSource<Templandinfo>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(public router: Router,
              private route: ActivatedRoute,
              public service: BackendService,
              public dialog: MatDialog,
              private spinner: NgxSpinnerService) {
                super(router, service);

                this.route.queryParams.subscribe(params => {
                  this.search = params.search;
                });
  }


  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('土地情報一覧');
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // 初回検索
    this.cond = {
        bukkenNo: '',
        bukkenName: '',
        address: '',
        pickDateMap: new Date(),
        pickDate: '',
        department: [],
        result: ['01']
     };
    if (this.search === '1') {
      this.cond = this.service.searchCondition;
    }

    const funcs = [];
    funcs.push(this.service.getCodes(['001']));
    funcs.push(this.service.getDeps(null));

    Promise.all(funcs).then(values => {

      const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }

      this.deps = values[1];

      this.cond.pickDateMap = null;

      if (this.search === '1') {
        this.searchBukken();
      }

    });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }

  /**
   * 物件検索
   */
  searchBukken() {
    this.spinner.show();

    // const val = new Date();
    // val.toLocaleDateString();
    this.cond.pickDate = this.cond.pickDateMap != null ? this.cond.pickDateMap.toLocaleDateString() : null;
    this.service.searchLand(this.cond).then(res => {
      if (res !== null && res.length > 0) {
        res.forEach(obj => {
          if (obj.department !== null && obj.department !== '') {
            obj.department = this.deps.filter((c) => c.depCode === obj.department).map(c => c.depName)[0];
          }
          if (obj.result !== null && obj.result !== '') {
            const lst = obj.result.split(',');
            obj.result = this.getCode('001').filter((c) => lst.includes(c.codeDetail)).map(c => c.name).join(',');
          }
        });
      }
      this.dataSource.data = res;
      this.searched = true;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);

    });
  }

  /**
   * 物件詳細
   * @param row: 物件データ
   */
  showDetail(row: Templandinfo) {
    this.service.searchCondition = this.cond;
    this.router.navigate(['/bkdetail'], {queryParams: {pid: row.pid}});
  }

  /**
   * 土地新規登録
   */
  createNew() {
    this.service.searchCondition = this.cond;
    this.router.navigate(['/bkdetail']);
  }

  export() {
    this.service.export();
  }

}
