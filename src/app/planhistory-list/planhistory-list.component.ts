import { Component } from '@angular/core';
import { BackendService } from '../backend.service';
import { BaseComponent } from '../BaseComponent';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter,MatDialogRef } from '@angular/material';
import { JPDateAdapter } from '../adapters/adapters';
import { Planhistorylist, Planhistorydetaillist } from '../models/planhistorylist';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Planinfo } from '../models/planinfo';//20200926


@Component({
  selector: 'app-planhistory-list',
  templateUrl: './planhistory-list.component.html',
  styleUrls: ['./planhistory-list.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class PlanHistoryListComponent extends BaseComponent {

  public history: Planhistorylist[];
  public pid: number;
  //public dialogRef: MatDialogRef<PlanHistoryListComponent>;// 20200928Add

  constructor(public router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public dialogRef: MatDialogRef<PlanHistoryListComponent>) {
      super(router, service,dialog);
      this.route.queryParams.subscribe(params => {
        this.pid = params.pid;
      });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('事業収支詳細');

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();

    this.service.getPlanHistoryList(this.pid).then(ret => {
      this.parseData(ret);
    }).catch(err => {
      console.log(err);
    }).finally(() => {
      this.spinner.hide();
    });
  }

  /**
   * データ分析
   * @param ret 検索結果
   */
  parseData(ret: Planhistorylist[]) {
    if(ret.length == 0) return;

    let map = new Map();
    this.history = [];

    ret.sort((a,b) => a.paymentCode > b.paymentCode ? 1 : a.paymentCode < b.paymentCode ? -1 : 0);

    //検索結果ループ
    ret.forEach(me => {
      if(!map.has(me.paymentCode)){
        map.set(me.paymentCode, true);

        //まとめオブジェクト
        let obj = new Planhistorylist();
        obj.paymentCode = me.paymentCode;
        obj.paymentName = me.paymentName;
        let subList = ret.filter(cd => cd.paymentCode === me.paymentCode);
        subList.sort((a,b) => a.planHistoryPid - b.planHistoryPid );
        obj.details = subList;

        this.history.push(obj);
      }
    });

    //console.log(this.history);
  }

  //20200926
  /*backPlan() {
    
      return;
    }*/
    //20200926
    //20200928 S_Add
  backPlan() {
    this.spinner.hide();
    this.dialogRef.close();
  }
  //20200928 E_Add

}
