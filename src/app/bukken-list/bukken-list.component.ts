import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../backend.service';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

import { MatPaginatorIntlJa } from '../adapters/adapters';
import { Router } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Templandinfo } from '../models/templandinfo';
import { Code } from '../models/bukken';

@Component({
  selector: 'app-bukken-list',
  templateUrl: './bukken-list.component.html',
  styleUrls: ['./bukken-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa }
  ]
})
export class BukkenListComponent extends BaseComponent {
  selectedRowIndex = -1;
  displayedColumns: string[] = ['bukkenNo', 'bukkenName', 'address', 'pickDate', 'department', 'result', 'detail'];
  dataSource = new MatTableDataSource<Templandinfo>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(public router: Router,
              public service: BackendService,
              public dialog: MatDialog,
              private spinner: NgxSpinnerService) {
                super(router, service);
  }


  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('土地情報一覧');
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

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
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.bukkenId;
  }

  /**
   * 物件検索
   */
  searchBukken() {
    this.spinner.show();
    this.service.searchLand().then(res => {
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
    this.router.navigate(['/bkdetail'], {queryParams: {pid: row.pid}});
  }

  /**
   * 土地新規登録
   */
  createNew() {
    this.router.navigate(['/bkdetail']);
  }

  export() {
    this.service.export();
  }

}
