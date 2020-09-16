import { Component } from '@angular/core';
import { BackendService } from '../backend.service';
import { BaseComponent } from '../BaseComponent';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { JPDateAdapter } from '../adapters/adapters';
import { Planhistorylist, Planhistorydetaillist } from '../models/planhistorylist';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

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

  public planhistorylistsTemp: Planhistorylist[] = [];
  public planhistorylists: Planhistorylist[] = [];
  public planhistorylist: Planhistorylist;
  public planhistorydetaillist: Planhistorydetaillist;
  public planHistoryPid: number;
  
  public history: Planhistorylist;
  public pid: number;
  
  constructor(public router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
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

    const funcs = [];
    funcs.push(this.service.getPlanHistoryList(this.pid));
    
    Promise.all(funcs).then(values => {
      this.planhistorylistsTemp = values[0];
    });
/*pid違いで右に増える配列
    // planHistoryPidチェック用変数初期化
    let planHistoryPidChk = '';
    // 取得データをループ
    this.planhistorylistsTemp.forEach(planhistorylist => {
      // planHistoryPidチェック用変数と取得データのplanHistoryPidが異なる場合
      if(planHistoryPidChk !== String(planhistorylist.planHistoryPid))
      {
        // 1周目以外なら
        if(planHistoryPidChk.length > 0)
        {
          // 画面表示用データにグルーピングデータを設定
          this.planhistorylists.push(this.planhistorylist);
        }

        // グルーピングデータを初期化
        this.planhistorylist = new Planhistorylist();
        // グルーピングデータに取得データを設定
        this.planhistorylist = planhistorylist;
      }
      
      // 取得データを子データの型に変換して設定
      this.planhistorydetaillist = planhistorylist as Planhistorydetaillist;
      // 子データを設定
      this.planhistorylist.details.push(this.planhistorydetaillist);
      
      // チェック用変数に現在のplanHistoryPidを設定
      planHistoryPidChk = String(planhistorylist.planHistoryPid);
    });
*/
//paymentCode違いで縦に増える配列
    // planHistoryPaymentCodeチェック用変数初期化
    let paymentCodeChk = '';
    // 取得データをループ
    this.planhistorylistsTemp.forEach(planhistorylist => {
      // planHistoryPaymentCodeチェック用変数と取得データのplanHistoryPaymentCodeが異なる場合
      if(paymentCodeChk !== planhistorylist.paymentCode)
      {
        // 1周目以外なら
        if(paymentCodeChk.length > 0)
        {
          // 画面表示用データにグルーピングデータを設定
          this.planhistorylists.push(this.planhistorylist);
        }
        // グルーピングデータを初期化
        this.planhistorylist = new Planhistorylist();
        // グルーピングデータに取得データを設定
        this.planhistorylist = planhistorylist;
      }
      
      // 取得データを子データの型に変換して設定
      this.planhistorydetaillist = planhistorylist as Planhistorydetaillist;
      // 子データを設定
      this.planhistorylist.details.push(this.planhistorydetaillist);
      
      // チェック用変数に現在のplanHistoryPaymentCodeを設定
      paymentCodeChk = planhistorylist.paymentCode;
      
    });
  }
}
