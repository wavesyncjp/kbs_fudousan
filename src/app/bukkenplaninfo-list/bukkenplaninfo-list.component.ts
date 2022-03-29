import { Component } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MatDialog } from '@angular/material';
import { BackendService } from '../backend.service';
import { JPDateAdapter } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { Templandinfo, LandPlanInfo } from '../models/templandinfo';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Code } from '../models/bukken';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Bukkenplaninfo } from '../models/bukkenplaninfo';
import { BukkenplaninfoDetailComponent} from '../bukkenplaninfo-detail/bukkenplaninfo-detail.component';
import { Bukkensalesinfo } from '../models/bukkensalesinfo';
import { DatePipe } from '@angular/common';
import { Locationinfo } from '../models/locationinfo';

@Component({
  selector: 'app-bukkenplaninfo-list',
  templateUrl: './bukkenplaninfo-list.component.html',
  styleUrls: ['./bukkenplaninfo-list.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})

export class BukkenplaninfoListComponent extends BaseComponent {
  authority = '';
  public pid: number;
  public data: LandPlanInfo;

  public locAdresses: Locationinfo[] = []; //20201225

  constructor(public router: Router,
              private route: ActivatedRoute,
              public service: BackendService,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              private spinner: NgxSpinnerService) {
    super(router, service,dialog);

    this.route.queryParams.subscribe(params => {
      this.pid = params.pid;
    });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('物件情報詳細');
    this.authority = this.service.loginUser.authority;
    this.spinner.show();

    const funcs = [];
    // 20201124 S_Add
    funcs.push(this.service.getCodes(['027']));

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
    });
    // 20201124 E_Add
    // 20201124 S_Delete
    /*
    if (this.pid > 0) {
      funcs.push(this.service.getLandPlan(this.pid));
    }
    */
    // 20201124 E_Delete

    if(this.pid != undefined && this.pid > 0) {
      this.service.getLandPlan(this.pid).then(ret => {
        this.convertForDisplay(ret);
  
        if(this.data.plans == null || this.data.plans.length === 0) {
          this.data.plans = [new Bukkenplaninfo()];
        }
  
        this.spinner.hide();
      });
    }
    else {
      this.data = new LandPlanInfo();
      this.data.land = new Templandinfo();
      this.spinner.hide();
    }
    
  }

  convertForDisplay(ret) { 

    this.data = new LandPlanInfo(ret);
    this.data.land = new Templandinfo(this.data.land);

    //20201225 S_Add
    if(this.data.land != null && this.data.land.pid > 0) {
      let cond = {
        tempLandInfoPid: this.data.land.pid,
        // 20210106 S_Update
        //clctLocationType: ['01', '02']
        clctLocationType: ['01', '02', '04']
        // 20210106 E_Update
      };
      this.service.searchLocation(cond).then(ret => {
        this.locAdresses = ret;

        this.data.sales.forEach(me => {
          this.loadSaleLocaction(me);
        });
        // 20220329 S_Add
        this.sortSale();
        // 20220329 E_Add

      });
    }
    //20201225 E_Add

    //20200731 S_Update
    /*
    this.data.land.convert();
    */
    this.data.land.convert(null);
    //20200731 E_Update

    let plans: Bukkenplaninfo[] = [];
    if(this.data.plans != null) {
      this.data.plans.forEach(me => {
        plans.push(new Bukkenplaninfo(me));
      });
    }
    this.data.plans = plans;

    // プラン
    this.data.plans.forEach(me => {
      me.convert();
    });

    // 売り契約
    if (this.data.sales == null || this.data.sales.length === 0) {
      this.data.sales = [];
    }
  }
  
  /**
   * プランセールの売買対象（所在地）
   * @param sale プランセール
   */
  loadSaleLocaction(sale: Bukkensalesinfo) {
    if(this.locAdresses == null || this.locAdresses.length == 0) return;
    if(!this.isBlank(sale.salesLocation)) {
      let locs = sale.salesLocation.split(',');
      // 20210106 S_Update
      /*sale.salesLocationStr = this.locAdresses.filter(loc => locs.indexOf(String(loc.pid)) >= 0).map(loc => loc.address + (loc.blockNumber != null ? loc.blockNumber : '')).join('\n');*/
      sale.salesLocationStr = this.locAdresses.filter(loc => locs.indexOf(String(loc.pid)) >= 0).map(loc => (loc.address != null ? loc.address : '') + (loc.blockNumber != null ? loc.blockNumber : '') + (loc.address != null || loc.blockNumber != null ? '　' : '') + (loc.buildingNumber != null ? loc.buildingNumber : '')).join('\n');
      // 20210106 E_Update
    }
  }

  /**
   * プラン追加
   */
  addPlan(): void {
    let plan = new Bukkenplaninfo();
    plan.tempLandInfoPid = this.data.land.pid;
    this.data.plans.push(plan);
  }

  /**
   * 
   * @param pos 削除位置
   */
  deletePlan(plan: Bukkenplaninfo, pos: number) {
    if(!(plan.pid > 0)) {
      this.data.plans.splice(pos, 1);
    }
    else {
      plan.delete = true;
    }
  }

  /**
   * 追加
   */
  addLandSale() {
    const sale = new Bukkensalesinfo();
    sale.tempLandInfoPid = this.data.land.pid;
    const dialogRef = this.dialog.open(BukkenplaninfoDetailComponent, {
      width: '98%',
      height: '650px',// 20220308 Update
      data: sale
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //保存
        if(result.isSave) {
          this.loadSaleLocaction(result.data); //20201225 S_Add
          this.data.sales.push(result.data);
          // 20220329 S_Add
          this.sortSale();
          // 20220329 E_Add
        }
      }
    });
  }

  /**
   * 編集
   * @param sale 編集データ
   */
  showLandSale(sale: Bukkensalesinfo) {

    const dialogRef = this.dialog.open(BukkenplaninfoDetailComponent, {
      width: '98%',
      height: '650px',// 20220308 Update
      data: sale
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) { 
        
        this.loadSaleLocaction(result.data); //20201225 S_Add

        let position;
        this.data.sales.forEach((me, pos) => {
          if(me.pid === result.data.pid) {
            position = pos;
            return false;
          }
        });
        // 20220329 S_Update
        //保存
        /*
        if(result.isSave) {
          this.data.sales[position] = new Bukkensalesinfo(result.data);
        }
        //削除
        if(result.isDelete) {
          this.data.sales.splice(position, 1);
        }
        */
        if (result.isSave || result.isDelete) {
          //保存
          if(result.isSave) {
            this.data.sales[position] = new Bukkensalesinfo(result.data);
          }
          //削除
          else if(result.isDelete) {
            this.data.sales.splice(position, 1);
          }
          this.sortSale();
        }
        // 20220329 E_Update
      }
    });
  }

  /**
   * データ保存
   */
  save() {
    if (!this.validate()) {
      return;
    }

    const dlg = new Dialog({title: '確認', message: '土地情報を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        // 土地情報登録
        this.convertForSave();
        this.service.saveLandPlan(this.data).then(ret => {

          const finishDlg = new Dialog({title: '完了', message: '土地情報を登録しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(res => {
            this.convertForDisplay(ret);
            this.router.navigate(['/bukkenplans'], {queryParams: {pid: this.data.land.pid}});
          });
        });
      }
    });

  }

  /**
   * 保存ための変換
   */
  convertForSave() {
    this.data.land.convertForSave(this.service.loginUser.userId, this.datepipe);
    this.data.plans.forEach(me => {
      me.convertForSave(this.service.loginUser.userId, this.datepipe);
    });
  }
  //数値にカンマを付ける作業
  changeValue(val) {
    val = this.numberFormat(val);
    return val;
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};
    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  flgFinish(event, flg: string) {
    this.data.land[flg] = (event.checked ? '1' : '0');
  }

  flgPlan(event,  plan: Bukkenplaninfo) {
    plan.planFixFlg = (event.checked ? '1' : '0');
  }

  /**
   * 物件戻す
   */
  gotoBukken() {
    this.router.navigate(['/bkdetail'], {queryParams: {pid: this.pid}});
  }

  /**
   * 一覧へ戻る
   */
  backToList() {
    this.router.navigate(['/bukkens'], {queryParams: {search: '1'}});
  }

  // 20220329 S_Add
  sortSale() {
    this.data.sales.sort((a,b) => {
      let id1 = a.displayOrder != null ? a.displayOrder : 0;
      let id2 = b.displayOrder != null ? b.displayOrder : 0;
      if(id1 !== id2) return id1 - id2;

      return a.pid - b.pid;
    });
  }
  // 20220329 E_Add
}
