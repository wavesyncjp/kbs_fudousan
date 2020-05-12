import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MatDialog, MAT_DATE_FORMATS, MatCheckbox,MatTabGroup,MatRadioChange} from '@angular/material';
import { BackendService } from '../backend.service';
import { JPDateAdapter } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { Templandinfo, LandPlanInfo } from '../models/templandinfo';
import { Locationinfo } from '../models/locationinfo';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Code } from '../models/bukken';
import { MapAttach, AttachFile } from '../models/mapattach';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Contractinfo } from '../models/contractinfo';
import { SharerInfo } from '../models/sharer-info';
import { LocationDetailComponent } from '../location-detail/location-detail.component';
import { Bukkenplaninfo } from '../models/bukkenplaninfo';
import { BukkenplaninfoDetailComponent} from '../bukkenplaninfo-detail/bukkenplaninfo-detail.component';
import { Bukkensalesinfo } from '../models/bukkensalesinfo';
import { DatePipe } from '@angular/common';

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
  public pid: number;
  public data: LandPlanInfo;

  constructor(public router: Router,
              private route: ActivatedRoute,
              public service: BackendService,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              private spinner: NgxSpinnerService) {
    super(router, service);

    this.route.queryParams.subscribe(params => {
      this.pid = params.pid;
    });    
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('物件情報詳細');
    this.spinner.show();

    const funcs = [];
    if (this.pid > 0) {
      funcs.push(this.service.getLandPlan(this.pid));
    }

    this.service.getLandPlan(this.pid).then(ret => {      
      this.convertForDisplay(ret);

      if(this.data.plans == null || this.data.plans.length === 0) {
        this.data.plans = [new Bukkenplaninfo()];
      }

      this.spinner.hide();
    });
  }

  convertForDisplay(ret) { 

    this.data = new LandPlanInfo(ret);
    this.data.land = new Templandinfo(this.data.land);
    this.data.land.convert(); 


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
      height: '500px',
      data: sale
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {          
        //保存
        if(result.isSave) {
          this.data.sales.push(result.data);          
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
      height: '500px',
      data: sale
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) { 
        
        let position;
        this.data.sales.forEach((me, pos) => {
          if(me.pid === result.data.pid) {
            position = pos;
            return false;
          }
        });
        
        //保存
        if(result.isSave) {
          this.data.sales[position] = new Bukkensalesinfo(result.data);
        } 

        //削除
        if(result.isDelete) {
          this.data.sales.splice(position, 1);
        }      
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
}


