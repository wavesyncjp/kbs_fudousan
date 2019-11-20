import { Component, OnInit } from '@angular/core';
import { InfoDetailComponent } from '../info-detail/info-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { Code } from '../models/bukken';
import { Router } from '@angular/router';
import { Information } from '../models/information';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-info-list',
  templateUrl: './info-list.component.html',
  styleUrls: ['./info-list.component.css']
})
export class InfoListComponent extends BaseComponent {
  selectedRowIndex = -1;
  displayedColumns: string[] = ['infoDate', 'infoSubject', 'detailFlg', 'infoDetail', 'attachFileName', 'finishFlg', 'delete', 'detail'];
  dataSource = new MatTableDataSource<Information>();

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
    const funcs = [];
    funcs.push(this.service.getCodes(['005']));

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
    });
  }

  /**
   * 検索
   */
  searchInfo() {
    this.spinner.show();

    const ELEMENT_DATA: Information[] = [
      new Information({pid: 1, infoDate: '2019/11/20', infoSubject: '休み', detailFlg: 1}),
      new Information({pid: 2, infoDate: '2019/11/18', infoSubject: '忘年会', detailFlg: 1, attachFileName: '地図.pdf'}),
      new Information({pid: 3, infoDate: '2019/11/05', infoSubject: '停電のお知らせ', detailFlg: 1, finishFlg: 1}),
      new Information({pid: 4, infoDate: '2019/10/01', infoSubject: '操作マニュアルのアップ', attachFileName: '20191101.pdf', detailFlg: 1}),
      new Information({pid: 5, infoDate: '2019/09/15', infoSubject: 'システムメンテナンスのお知らせ', detailFlg: 0, finishFlg: 1}),
    ];

    this.dataSource.data = ELEMENT_DATA;

    setTimeout(() => {
      this.spinner.hide();
    }, 500);
  }

  createNew() {
    const dialogRef = this.dialog.open(InfoDetailComponent, {
      width: '60%',
      height: '580px',
      data: new Information()
    });
  }

  deleteRow(row: Information) {
    const dlg = new Dialog({title: '確認', message: '削除してよろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });
  }

  showDetail(row: Information) {
    const dialogRef = this.dialog.open(InfoDetailComponent, {
      width: '60%',
      height: '580px',
      data: row
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }

}
