import { Component, OnInit ,ViewChild} from '@angular/core';
import { InfoDetailComponent } from '../info-detail/info-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code } from '../models/bukken';
import { Router } from '@angular/router';
import { Information } from '../models/information';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';

@Component({
  selector: 'app-info-list',
  templateUrl: './info-list.component.html',
  styleUrls: ['./info-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class InfoListComponent extends BaseComponent {
  public cond: any;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['infoDate', 'infoSubject', 'detailFlg', 'infoDetail', 'attachFileName', 'finishFlg', 'delete', 'detail'];
  dataSource = new MatTableDataSource<Information>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  constructor(public router: Router,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
    super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('インフォメーション');
    this.dataSource.paginator = this.paginator;
    this.cond = {
      infoSubject: '',
      infoDateMap: '',
      infoDate: '',
      finishFlg: ['0']
    };

    const funcs = [];
    funcs.push(this.service.getCodes(['005', '006']));

    Promise.all(funcs).then(values => {

      // コード
      const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }

      //this.cond.infoDateMap = null;

    });
  }

  /**
   * 検索
   */
  searchInfo() {
    this.spinner.show();
    this.cond.infoDate = this.cond.infoDateMap != null ? this.cond.infoDateMap.toLocaleDateString() : null;
    this.service.searchInfo(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);

    });

  }

  createNew() {
    const row = new Information();
    const dialogRef = this.dialog.open(InfoDetailComponent, {
      width: '60%',
      height: '580px',
      data: row
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchInfo();
      }
    });
  }

  deleteRow(row: Information) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteInfo(row.pid).then(res => {
          this.searchInfo();
        });
      }
    });

  }

  showDetail(row: Information) {
    const dialogRef = this.dialog.open(InfoDetailComponent, {
      width: '60%',
      height: '580px',
      data: row
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.searchInfo();
      }
    });

  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }
}
