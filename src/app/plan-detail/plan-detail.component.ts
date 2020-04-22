import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Contractinfo } from '../models/contractinfo';
import { Code } from '../models/bukken';
import { Templandinfo } from '../models/templandinfo';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Dialog } from '../models/dialog';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { Planinfo } from '../models/planinfo';
import { Plandetail } from '../models/plandetail';
import { Planrentroll } from '../models/Planrentroll';
import { Planrentrolldetail } from '../models/Planrentrolldetail';
import { Converter } from '../utils/converter';
import { isNullOrUndefined } from 'util';


@Component({
  selector: 'app-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})
export class PlanDetailComponent extends BaseComponent {

  public contract: Contractinfo;
  public data: Templandinfo;
  public pid: number;
  public bukkenid: number;
  public plan: Planinfo;
  public rent: Planrentroll;


  public payTypeGroup1 = [];
  public payTypeGroup2 = [];
  public payTypeGroup3 = [];

  constructor(public router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public service: BackendService,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe) {
    super(router, service);
    this.route.queryParams.subscribe(params => {
      this.pid = params.pid;
      this.bukkenid = params.bukkenid;
    });

    this.data = new Templandinfo();
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('事業収支詳細');

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();
    this.plan = new Planinfo();
    this.plan.rent = new Planrentroll();// 20200422 Add

    const funcs = [];
    funcs.push(this.service.getCodes(['011', '016', '017', '018', '020']));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getEmps(null));

    funcs.push(this.service.getPaymentTypes(null));
    if (this.bukkenid > 0) {
      funcs.push(this.service.getLand(this.bukkenid));
    }
    // tslint:disable-next-line:one-line
    else if (this.pid > 0) {
      funcs.push(this.service.getPlan(this.pid));
    }

    Promise.all(funcs).then(values => {

      const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a, b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }
      // 20200222 S_Update
      //      this.emps = values[1];
      this.deps = values[1];
      this.emps = values[2];
      this.payTypes = values[3];

      this.payTypeGroup1 = this.payTypes.filter(tp => { return tp.costFlg === '01' && tp.addFlg === '1' })
        .map(tp => new Code({ codeDetail: tp.paymentCode, name: tp.paymentName }));
      this.payTypeGroup2 = this.payTypes.filter(tp => { return tp.costFlg === '02' && tp.addFlg === '1' })
        .map(tp => new Code({ codeDetail: tp.paymentCode, name: tp.paymentName }));
      this.payTypeGroup3 = this.payTypes.filter(tp => { return tp.costFlg === '03' && tp.addFlg === '1' })
        .map(tp => new Code({ codeDetail: tp.paymentCode, name: tp.paymentName }));

      // データが存在する場合
      if (values.length > 4) {
        if (this.pid > 0) {
          this.plan = new Planinfo(values[4] as Planinfo);
          this.plan.convert();
          this.data = new Templandinfo(values[4].land as Templandinfo);
          delete this.plan['land'];
        } else {
          this.data = new Templandinfo(values[4] as Templandinfo);
          this.plan = new Planinfo();
        }
      }     

      if(this.plan.rent == null || !this.plan.rent) {
        this.plan.rent = new Planrentroll();
      }

      //明細情報が存在しない場合
      if (this.plan.details == null || this.plan.details.length == 0) {
        this.plan.details = [];
        const lst = ["1001", "1002", "1003", "1004", "1005", "", "", "", "", "", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008",
          "", "", "", "", "", "3001", "3002", "3003", "3004", "3005", "3006", "3007", "3008", "3009", "3010", "3011", "", "", "", "", ""];
        lst.forEach((code, index) => {
          let detail = new Plandetail();
          detail.paymentCode = code;
          detail.backNumber = String(index + 1);
          detail.price = null;
          this.plan.details.push(detail);
        });
      }
      //20200416_hirano_src
      if (this.plan.rentdetails == null || this.plan.rentdetails.length == 0) {
        this.plan.rentdetails = [];
        //targetArea="101"～ "115" //space="201"～ "219" //rentUnitPrice="301"～ "319" //securityDeposit="401"～ "419"
        const lst = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "駐車場", "駐輪場", "ﾊﾞｲｸ置き場", "自販機"];
        lst.forEach((code, index) => {
          let rentdetail = new Planrentrolldetail();
          rentdetail.targetArea = code;
          rentdetail.space = '';
          rentdetail.rentUnitPrice = '';
          rentdetail.securityDeposit = '';
          rentdetail.backNumber = String(index + 1);
          this.plan.rentdetails.push(rentdetail);
        });
      }
      //20200416_hirano_src
      this.spinner.hide();

    });
  }

  /*坪数計算*/
  calTsubo(val) {
    if (!isNullOrUndefined(val)) {
      return Math.floor(this.getNumber(val) * 0.3025 * 100) / 100;
    }
    else {
      return '';
    }
  }
  //20200331 ADD まだ機能しない為、再考

  getNumber(val) {
    if (val == null || val === '' || isNaN(val)) return 0;
    return Number(val);
  }

  changeSum(val1, val2, val3, val4, val5) {
    return this.getNumber(val1) + this.getNumber(val2) + this.getNumber(val3) + this.getNumber(val4) + this.getNumber(val5);
  }
  changeSumLand(val1, val2, val3, val4, val5, val6, val7, val8, val9, val10) {
    return this.getNumber(val1) + this.getNumber(val2) + this.getNumber(val3) + this.getNumber(val4) + this.getNumber(val5)
      + this.getNumber(val6) + this.getNumber(val7) + this.getNumber(val8) + this.getNumber(val9) + this.getNumber(val10);
  }

  changeHang(val, val1) {
    if (val == null || val === '' || isNaN(val)) return 0;
    return Number(val) * this.getNumber(val1);
  }

  /**
   * 登録
   */
  save() {
    if (!this.validate()) {
      return;
    }
    const dlg = new Dialog({ title: '確認', message: '事業収支情報を登録しますが、よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {

        this.spinner.show();

        this.plan.tempLandInfoPid = this.data.pid;
        this.plan.convertForSave(this.service.loginUser.userId, this.datepipe);
        this.service.savePlan(this.plan).then(res => {

          const finishDlg = new Dialog({ title: '完了', message: '事業収支情報を登録しました。' });
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(val => {
            this.spinner.hide();
            this.router.navigate(['/plans'], { queryParams: { search: 1 } });
          });

        });
      }
    });

  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    this.checkBlank(this.plan.planNumber, 'planNumber', 'プラン番号は必須です。');
    this.checkBlank(this.plan.planName, 'planName', 'プラン名は必須です。');

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  ok() {
    if (!this.validate()) {
      return;
    }

    this.data.locations.forEach((loc, pos) => {
      if (loc.sharers == null || loc.sharers.length == 1) {
        return;
      }
      if ((loc.contractDetail.contractDataType === '01' || loc.contractDetail.contractDataType === '03')
        && (loc.contractDetail.registrants == null || loc.contractDetail.registrants.length == 0)) {
        if (loc.contractDetail.contractDataType === '01') {
          this.errorMsgs.push('売主選択のデータで登記人が選択されていません。');
          this.errors['contractDataType_01_' + pos] = true;
        }
        else {
          this.errorMsgs.push('底地選択のデータで登記人が選択されていません。');
          this.errors['contractDataType_03_' + pos] = true;
        }
      }
    });

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * 一覧へ戻る
   */
  backToList() {
    this.router.navigate(['/plans'], { queryParams: { search: '1' } });
  }

  export() {
    const dlg = new Dialog({ title: '確認', message: '収支帳票を出力しますが、よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportPlan(this.plan.pid).then(data => {
          this.service.writeToFile(data);
          this.spinner.hide();
        });
      }
    });
  }


  /**
   * 値変更イベント
   * @param name 変更属性
   */
  changeValue(name: string) {

    //計算１４
    if(name === 'routePrice' || name === 'siteAreaBuy') {
      this.cal14();
    }

    //計算１５
    if(name === 'landEvaluation' || name === 'residentialRate') {
      this.cal15();
    }

    //計算２２
    if(name === 'siteAreaBuy' || name === 'taxation' || name === 'landEvaluation' || name === 'residentialRate') {
      this.cal22();
    }

    //計算２４
    if(name === 'afterTaxation') {
      this.plan.afterFixedTax = Math.round(this.plan.afterTaxation * 0.014);
    }

    //計算２５
    if(name === 'afterTaxationCity') {
      this.plan.afterCityPlanTax = Math.round(this.plan.afterTaxationCity * 0.03);
    }

    //計算２７
    if(name === 'fixedTaxLand' || name === 'cityPlanTaxLand' || name === 'fixedTaxBuild' || name === 'cityPlanTaxBuild' || name === 'burdenDays') {
      this.cal27();
    }

    //計算３０
    if(name === 'price11' && !isNullOrUndefined(this.plan.details[11].price)) {
      this.plan.details[11].priceTax = String(Math.round(Number(this.plan.details[11].price) * 0.03));
    }

    //計算４１
    if(name === 'rent' || name === 'totalMonths'){
      this.cal41();
    }

    //計算４３
    if(name === 'landLoan' || name === 'commissionRate'){
      this.cal43();
    }
  }

  //計算１３
  cal13(){
    if(this.plan.startDayMap == null || this.plan.completionDayMap == null 
      || this.plan.buysellUnits == null || this.plan.completionDayMap < this.plan.startDayMap) return;
      
    const months = Converter.monthsDiff(this.plan.startDayMap, this.plan.completionDayMap);
    const val13 = (months/this.plan.buysellUnits).toFixed(4);
    return val13;
  }

  //計算１４  
  cal14() {
    if(!isNullOrUndefined(this.plan.details[0].routePrice) && this.plan.siteAreaBuy > 0){
      this.plan.landEvaluation = Math.round(Number(this.plan.details[0].routePrice) * this.plan.siteAreaBuy * 7 / 8);
      this.changeValue('landEvaluation');
    }    
  }

  //計算１５
  cal15() {
    if(this.plan.landEvaluation > 0 && this.plan.residentialRate > 0) {
      this.plan.taxation = Math.round(this.plan.landEvaluation * 1 / 6 * this.plan.residentialRate / 100 + this.plan.landEvaluation * (1 - this.plan.residentialRate / 100));
      this.changeValue('taxation');
    }
  }

  //計算２２
  cal22() {
    if(this.plan.siteAreaBuy <= 200) {
      this.plan.afterTaxation = this.plan.taxation;
    }
    else {
      this.plan.afterTaxation = Math.round(this.plan.landEvaluation / this.plan.siteAreaBuy * (this.plan.siteAreaBuy - 100) * 1 / 3 + this.plan.landEvaluation * (1 - this.plan.residentialRate / 100));
    }
    this.changeValue('afterTaxation');
  }

  //計算２７
  cal27() {
    if(this.plan.fixedTaxLand > 0 || this.plan.cityPlanTaxLand > 0 || this.plan.fixedTaxBuild > 0 || this.plan.cityPlanTaxBuild > 0 || !isNullOrUndefined(this.plan.details[4].burdenDays)){
      this.plan.details[4].price = String(Math.round(
        (this.getNumber(this.plan.fixedTaxLand) + this.getNumber(this.plan.cityPlanTaxLand) 
        + this.getNumber(this.plan.fixedTaxBuild) + this.getNumber(this.plan.cityPlanTaxBuild)) 
        / 365 * Number(this.getNumber(this.plan.details[4].burdenDays))));
    }    
  }

  //計算４１
  cal41() {
    if(!isNullOrUndefined(this.plan.details[32].rent) && !isNullOrUndefined(this.plan.details[33].totalMonths)){
      this.plan.details[32].price = String(Number(this.plan.details[32].rent) * Number(this.plan.details[33].totalMonths));
    }    
  }

  //計算４３
  cal43() {
    if(!isNullOrUndefined(this.plan.landLoan) && !isNullOrUndefined(this.plan.details[36].commissionRate)){
      this.plan.details[36].price = String(Number(this.plan.landLoan) * Number(this.plan.details[36].commissionRate));
    }    
  }

  //計算４９
  cal49() {
    let ret = 0;
    let pos = 0;
    while(pos < 39) {
      ret += this.getNumber(this.plan.details[pos].price);
      pos++
    }
    if(this.getNumber(this.plan.landPeriod) > 0) {
      ret += (this.getNumber(this.plan.landLoan) * this.getNumber(this.plan.landInterest) / 12 * this.getNumber(this.plan.landPeriod));
    }    
    if(this.getNumber(this.plan.buildPeriod) > 0) {
      ret += (this.getNumber(this.plan.buildLoan) * this.getNumber(this.plan.buildInterest) / 12 * this.getNumber(this.plan.buildPeriod));
    }     
    return Math.round(ret);
  }

  //計算６０
  cal60() {
    let ret = ((this.getNumber(this.plan.rentdetails[18].space) * 0.3025 * 100 ) / 100)* this.getNumber(this.plan.rentdetails[18].rentUnitPrice) * this.getNumber(this.plan.rentdetails[18].securityDeposit);
    return Math.round(ret);
  }

  //計算６２
  cal62() {
    let ret = 0;
    let pos = 0;
    while(pos < 19) {      
      ret += (((this.getNumber(this.plan.rentdetails[pos].space) * 0.3025 * 100 ) / 100) * this.getNumber(this.plan.rentdetails[pos].rentUnitPrice));
      pos++;
    }
    return Math.round(ret);
  }

  //計算６８
  cal68() {
    let val62 = this.cal62() * 12 + this.getNumber(this.plan.rent.commonFee)*this.getNumber(this.plan.totalUnits)*12 + this.getNumber(this.plan.rent.monthlyOtherIncome) * 12
    return Math.round(val62);
  }
}
