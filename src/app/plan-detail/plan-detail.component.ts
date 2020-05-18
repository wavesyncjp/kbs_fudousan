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
import { ThrowStmt } from '@angular/compiler';


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


  changeHang(val, val1) {
    if (isNullOrUndefined(val) || val == null || val === '' || isNaN(val)) return 0;
    return Math.floor(Number(val) * this.getNumber(val1));
  }

  changeUnit (val, val1) {
    if (isNullOrUndefined(val) || val == null || val === '' || isNaN(val)) return 0;
    return Math.floor(Number(val) * this.getNumber(val1) / this.getNumber((this.plan.totalArea) * 0.3025));
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

    //計算16
    if(name === 'landEvaluation' || name === 'residentialRate') {
      this.cal16();
    }

     //計算17
     if(name === 'taxation') {
      this.plan.fixedTaxLand = Math.round(this.plan.taxation * 0.014);
    }

    //計算18
    if(name === 'taxationCity') {
      this.plan.cityPlanTaxLand = Math.round(this.plan.taxationCity * 0.03);
    }
     //計算19
     if(name === 'buildValuation') {
      this.plan.fixedTaxBuild = Math.round(this.plan.buildValuation * 0.014);
    }

    //計算20
    if(name === 'buildValuation') {
      this.plan.cityPlanTaxBuild = Math.round(this.plan.buildValuation * 0.03);
    }

  

    //計算２２
    if(name === 'siteAreaBuy' || name === 'taxation' || name === 'landEvaluation' || name === 'residentialRate') {
      this.cal22();
    }

    //計算２３
    if(name === 'siteAreaBuy' || name === 'taxation' || name === 'landEvaluation' || name === 'residentialRate') {
      this.cal23();
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


    if(name === 'price10'){
      if(!isNullOrUndefined(this.plan.details[10].price) && !isNullOrUndefined(this.plan.details[11].price)){
        this.plan.details[11].price= String(Math.floor(Number(this.getNumber(this.plan.details[10].price)) * 0.03));
        // 20200518 S_Add
        this.plan.details[11].price = this.numberFormat(this.plan.details[11].price);
        // 20200518 E_Add
        this.plan.details[13].price= String(Math.floor(Number(this.getNumber(this.plan.details[10].price)) * 0.02));
        // 20200518 S_Add
        this.plan.details[13].price = this.numberFormat(this.plan.details[11].price);
        // 20200518 E_Add
      
        this.changeValue('price11');
        this.changeValue('price13');
      }
    }
    /*//計算３０
    if(name === 'price11' && !isNullOrUndefined(this.plan.details[11].price)) {
      this.plan.details[11].priceTax = String(Math.round(Number(this.plan.details[10].price) * 0.03));
    }

    //計算３１
    if(name === 'price13' && !isNullOrUndefined(this.plan.details[13].price)) {
      this.plan.details[13].priceTax = String(Math.round(Number(this.plan.details[10].price) * 0.02));
    }*/

    //計算４１
    if(name === 'rent' || name === 'totalMonths'){
      this.cal41();
    }

    //計算４３
    if(name === 'landLoan' || name === 'commissionRate'){
      this.cal43();
    }

    // 20200518 S_Add
    if(name === 'landEvaluation') {
      this.plan.landEvaluationMap = this.numberFormat(this.plan.landEvaluationMap);
    }
    if(name === 'taxation') {
      this.plan.taxationMap = this.numberFormat(this.plan.taxationMap);
    }
    if(name === 'taxationCity') {
      this.plan.taxationCityMap = this.numberFormat(this.plan.taxationCityMap);
    }
    if(name === 'buildValuation') {
      this.plan.buildValuationMap = this.numberFormat(this.plan.buildValuationMap);
    }
    if(name === 'fixedTaxLand') {
      this.plan.fixedTaxLandMap = this.numberFormat(this.plan.fixedTaxLandMap);
    }
    if(name === 'cityPlanTaxLand') {
      this.plan.cityPlanTaxLandMap = this.numberFormat(this.plan.cityPlanTaxLandMap);
    }
    if(name === 'fixedTaxBuild') {
      this.plan.fixedTaxBuildMap = this.numberFormat(this.plan.fixedTaxBuildMap);
    }
    if(name === 'cityPlanTaxBuild') {
      this.plan.cityPlanTaxBuildMap = this.numberFormat(this.plan.cityPlanTaxBuildMap);
    }
    if(name === 'afterTaxation') {
      this.plan.afterTaxationMap = this.numberFormat(this.plan.afterTaxationMap);
    }
    if(name === 'afterTaxationCity') {
      this.plan.afterTaxationCityMap = this.numberFormat(this.plan.afterTaxationCityMap);
    }
    if(name === 'afterFixedTax') {
      this.plan.afterFixedTaxMap = this.numberFormat(this.plan.afterFixedTaxMap);
    }
    if(name === 'afterCityPlanTax') {
      this.plan.afterCityPlanTaxMap = this.numberFormat(this.plan.afterCityPlanTaxMap);
    }
    // 20200518 E_Add
    
  }
  
  //計算９  
  cal9() {
    if(this.plan.buildArea > 0 && this.plan.siteAreaCheck > 0) {
      const val9 = Math.round(this.plan.buildArea / this.plan.siteAreaCheck*100*100)/100;
      return val9;
    } else {
      return '';
    }
    
  }

  //計算１０  
  cal10() {
    if(this.plan.totalArea > 0 && this.plan.buildArea > 0) {
      const val10 = Math.round(this.plan.totalArea / this.plan.buildArea *100*100)/100;
      return val10;
    } else {
      return '';
    }
    
  }

  //計算 11 ☆☆
  cal11() {
    if(this.plan.totalArea > 0 && this.plan.buildArea > 0  && this.plan.entrance > 0) {
      const val11 = Math.round((this.plan.totalArea / (this.plan.buildArea + this.plan.entrance)) *100*100)/100;
      return val11;
    } else {
      return '';
    }
    
  }
  

   //計算１２  
   cal12() {
    if(this.plan.parkingIndoor > 0 || this.plan.parkingOutdoor > 0) {
      const val12 =Number(this.plan.parkingIndoor) + Number(this.plan.parkingOutdoor);
      return val12;
    } else {
        return '';
      }
    }

   

  //計算１３
  cal13(){
    if(!isNullOrUndefined(Number(this.cal12())) && this.plan.buysellUnits > 0){
      const val13 = (Number(this.cal12()) / this.plan.buysellUnits * 100) .toFixed(4);
      return val13;
    } else {
      return ' ';
    }
  }

  //計算１４  
  cal14() {
    // 20200518 S_Edit
    var routePriceForCalc0 = this.removeComma(this.plan.details[0].routePrice);

    // if(!isNullOrUndefined(this.plan.details[0].routePrice) && this.plan.siteAreaBuy > 0){
    //   this.plan.landEvaluation = Math.round(Number(this.plan.details[0].routePrice) * this.plan.siteAreaBuy * 7 / 8);
    //   this.changeValue('landEvaluation');
    // } 

    if(!isNullOrUndefined(routePriceForCalc0) && this.plan.siteAreaBuy > 0){
      this.plan.landEvaluation = Math.round(Number(routePriceForCalc0) * this.plan.siteAreaBuy * 7 / 8);
      this.changeValue('landEvaluation');
    }
    // 20200518 E_Edit
  }

  //計算１５
  cal15() {
    if(this.plan.landEvaluation > 0 && this.plan.residentialRate > 0) {
      this.plan.taxation = Math.round(this.plan.landEvaluation * 1 / 6 * this.plan.residentialRate / 100 + this.plan.landEvaluation * (1 - this.plan.residentialRate / 100));
      this.changeValue('taxation');
    }
  }
   //計算16
   cal16() {
    if(this.plan.landEvaluation > 0 && this.plan.residentialRate > 0) {
      this.plan.taxationCity = Math.round(this.plan.landEvaluation * 1 / 3 * this.plan.residentialRate / 100 + this.plan.landEvaluation * (1 - this.plan.residentialRate / 100));
      this.changeValue('taxationCity');
    }
  }

  //計算21
  cal21() {
    // 20200518 S_Add
    this.plan.fixedTaxLand = +this.plan.fixedTaxLandMap.replace(/,/g, "").trim()
    this.plan.cityPlanTaxLand = +this.plan.cityPlanTaxLandMap.replace(/,/g, "").trim()
    this.plan.fixedTaxBuild = +this.plan.fixedTaxBuildMap.replace(/,/g, "").trim()
    this.plan.cityPlanTaxBuild = +this.plan.cityPlanTaxBuildMap.replace(/,/g, "").trim()

    if(this.plan.fixedTaxLand > 0 && this.plan.cityPlanTaxLand > 0 && this.plan.fixedTaxBuild > 0 && this.plan.cityPlanTaxBuild > 0){
      const val21= (this.plan.fixedTaxLand + this.plan.cityPlanTaxLand + this.plan.fixedTaxBuild + this.plan.cityPlanTaxBuild);

      //return val21;
      var result = this.numberFormat(val21.toString());
      return result
      // 20200518 E_Edit
    
    } else {
      return '';
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

  cal23() {
    if(this.plan.siteAreaBuy <= 200) {
      this.plan.afterTaxationCity = this.plan.taxation;
    }
    else {
      this.plan.afterTaxationCity = Math.round(this.plan.landEvaluation / this.plan.siteAreaBuy * (this.plan.siteAreaBuy - 100) * 2 / 3 + this.plan.landEvaluation * (1 - this.plan.residentialRate / 100));
    }
    this.changeValue('afterTaxationCity');
  }


  //計算26
  cal26() {
    // 20200518 S_Add
    this.plan.afterFixedTax = +this.plan.afterFixedTaxMap.replace(/,/g, "").trim()
    this.plan.afterCityPlanTax = +this.plan.afterCityPlanTaxMap.replace(/,/g, "").trim()
    // 20200518 E_Add

    if(this.plan.afterFixedTax > 0 && this.plan.afterCityPlanTax > 0 ){
      const val26= (this.plan.afterFixedTax + this.plan.afterCityPlanTax);

      // 20200518 S_Edit
      //return val26;
      var result = this.numberFormat(val26.toString());
      return result
      // 20200518 E_Edit

    } else {
      return '';
    }
  }

  //計算２７
  cal27() {
    if(this.plan.fixedTaxLand > 0 || this.plan.cityPlanTaxLand > 0 || this.plan.fixedTaxBuild > 0 || this.plan.cityPlanTaxBuild > 0 || !isNullOrUndefined(this.plan.details[4].burdenDays)){
      this.plan.details[4].price = String(Math.floor(
        (this.getNumber(this.plan.fixedTaxLand) + this.getNumber(this.plan.cityPlanTaxLand) 
        + this.getNumber(this.plan.fixedTaxBuild) + this.getNumber(this.plan.cityPlanTaxBuild)) 
        / 365 * Number(this.getNumber(this.plan.details[4].burdenDays))));
    }    
  }

  //計算28　土地その他合計
  cal28() {
    // 20200518 S_Edit
    var priceForCalc5 = this.removeComma(this.plan.details[5].price);
    var priceForCalc6 = this.removeComma(this.plan.details[6].price);
    var priceForCalc7 = this.removeComma(this.plan.details[7].price);
    var priceForCalc8 = this.removeComma(this.plan.details[8].price);
    var priceForCalc9 = this.removeComma(this.plan.details[9].price);

    // let ret= (this.getNumber(this.plan.details[5].price)) + (this.getNumber(this.plan.details[6].price)) + (this.getNumber(this.plan.details[7].price)) + (this.getNumber(this.plan.details[8].price)) + (this.getNumber(this.plan.details[9].price));
    let ret= (this.getNumber(priceForCalc5)) + (this.getNumber(priceForCalc6)) + (this.getNumber(priceForCalc7)) + (this.getNumber(priceForCalc8)) + (this.getNumber(priceForCalc9));
    
    // return Math.floor(ret);
    return this.numberFormat(Math.floor(ret).toString());
    // 20200518 E_Edit
  }


  //計算29 土地原価合計
  cal29() {
    // 20200518 S_Edit
    var priceForCalc0 = this.removeComma(this.plan.details[0].price);
    var priceForCalc1 = this.removeComma(this.plan.details[1].price);
    var priceForCalc2 = this.removeComma(this.plan.details[2].price);
    var priceForCalc3 = this.removeComma(this.plan.details[3].price);
    var priceForCalc4 = this.removeComma(this.plan.details[4].price);

    let ret= (this.getNumber(priceForCalc0)) + (this.getNumber(priceForCalc1)) + (this.getNumber(priceForCalc2)) + (this.getNumber(priceForCalc3)) + (this.getNumber(priceForCalc4));
    
    // let ret= (this.getNumber(this.plan.details[0].price)) + (this.getNumber(this.plan.details[1].price)) + (this.getNumber(this.plan.details[2].price)) + (this.getNumber(this.plan.details[3].price)) + (this.getNumber(this.plan.details[4].price) + this.cal28());
    // return Math.floor(ret);
    return this.numberFormat(Math.floor(ret).toString());
    // 20200518 E_Edit
  }


    
   /* //計算30　☆☆
   cal30() {
      if(!isNullOrUndefined(this.plan.details[10].price) && !isNullOrUndefined(this.plan.details[11].price)){
      this.plan.details[11].price= String(Number(this.getNumber(this.plan.details[10].price)) * 0.03);
      this.changeValue('price11');
      }
      
    }

    //計算31　☆☆
   cal31() {
    if(!isNullOrUndefined(this.plan.details[10].price)){
    this.plan.details[13].price= String(Number(this.getNumber(this.plan.details[10].price)) * 0.02);
    this.changeValue('price13');
    }
    
  }*/



  //計算32
  cal32() {
    // 20200518 S_Edit
    var priceForCalc15 = this.removeComma(this.plan.details[15].price);
    var priceForCalc16 = this.removeComma(this.plan.details[16].price);
    var priceForCalc17 = this.removeComma(this.plan.details[17].price);
    var priceForCalc18 = this.removeComma(this.plan.details[18].price);
    var priceForCalc19 = this.removeComma(this.plan.details[19].price);
    let ret= (this.getNumber(priceForCalc15)) + (this.getNumber(priceForCalc16)) + (this.getNumber(priceForCalc17)) + (this.getNumber(priceForCalc18)) + (this.getNumber(priceForCalc19));

    // let ret= (this.getNumber(this.plan.details[15].price)) + (this.getNumber(this.plan.details[16].price)) + (this.getNumber(this.plan.details[17].price));
    // return Math.floor(ret);
    return this.numberFormat(Math.floor(ret).toString());
    // 20200518 E_Edit
  }

  //計算33　建物その他合計
  cal33() {
    // 20200518 S_Edit
    var priceForCalc18 = this.removeComma(this.plan.details[18].price);
    var priceForCalc19 = this.removeComma(this.plan.details[19].price);
    var priceForCalc20 = this.removeComma(this.plan.details[20].price);
    var priceForCalc21 = this.removeComma(this.plan.details[21].price);
    var priceForCalc22 = this.removeComma(this.plan.details[22].price);
    let ret= (this.getNumber(priceForCalc18)) + (this.getNumber(priceForCalc19)) + (this.getNumber(priceForCalc20)) + (this.getNumber(priceForCalc21)) + (this.getNumber(priceForCalc22));

    //let ret= (this.getNumber(this.plan.details[18].price)) + (this.getNumber(this.plan.details[19].price)) + (this.getNumber(this.plan.details[20].price)) + (this.getNumber(this.plan.details[21].price)) + (this.getNumber(this.plan.details[22].price));
    //return Math.floor(ret);
    return this.numberFormat(Math.floor(ret).toString());
    // 20200518 E_Edit
  }

    //計算34　建物合計
  cal34() {
    // 20200518 S_Edit
    var priceForCalc10 = this.removeComma(this.plan.details[10].price);
    var priceForCalc11 = this.removeComma(this.plan.details[11].price);
    var priceForCalc12 = this.removeComma(this.plan.details[12].price);
    var priceForCalc13 = this.removeComma(this.plan.details[13].price);
    var priceForCalc14 = this.removeComma(this.plan.details[14].price);
    let ret= (this.getNumber(priceForCalc10)) + (this.getNumber(priceForCalc11)) + (this.getNumber(priceForCalc12)) + (this.getNumber(priceForCalc13)) + (this.getNumber(priceForCalc14));

    //let ret= (this.getNumber(this.plan.details[10].price)) + (this.getNumber(this.plan.details[11].price)) + (this.getNumber(this.plan.details[12].price)) + (this.getNumber(this.plan.details[13].price)) + (this.getNumber(this.plan.details[14].price) + this.cal32() + this.cal32() + this.cal33());
    //return Math.floor(ret);
    return this.numberFormat(Math.floor(ret).toString());
    // 20200518 E_Edit
  }

  //計算35
  cal35() {
    if(this.plan.afterFixedTax > 0 && this.plan.afterCityPlanTax > 0 && !isNullOrUndefined(this.plan.details[23].complePriceMonth)){
      this.plan.details[23].price = String(Math.floor(
        (this.getNumber(this.plan.afterFixedTax) + this.getNumber(this.plan.afterCityPlanTax) 
        ) / 12 * Number(this.getNumber(this.plan.details[23].complePriceMonth))));
        
    }
  }

  //計算36
  cal36() {
    if(this.plan.fixedTaxBuild > 0 && this.plan.cityPlanTaxBuild > 0 && !isNullOrUndefined(this.plan.details[24].dismantlingMonth)){
      this.plan.details[24].price = String(Math.floor(
        (this.getNumber(this.plan.fixedTaxBuild) + this.getNumber(this.plan.cityPlanTaxBuild) 
        ) / 12 * Number(this.getNumber(this.plan.details[24].dismantlingMonth))));
        
      }
  }

  //計算37　
  cal37() {
    if(this.plan.buildValuation > 0){
      const val37= Number(this.plan.buildValuation) * 0.03;
      return Math.floor (val37);
    } else {
      return '';
    }

  }

  //計算38　
  cal38() {
      if(this.plan.buildValuation > 0){
      const cal38= Number(this.plan.buildValuation) * 0.02;
      return Math.floor (cal38);
    } else {
      return '';
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

  //計算44　
cal44() {
  if(!isNullOrUndefined(this.plan.landLoan)){
    this.plan.details[37].price = String(Number(this.plan.landLoan) * 0.004);

 }

}

 //計算42　その他その他合計
 cal42() {
  let ret= (this.getNumber(this.plan.details[34].price)) + (this.getNumber(this.plan.details[35].price)) + (this.getNumber(this.plan.details[36].price)) + (this.getNumber(this.plan.details[37].price)) + (this.getNumber(this.plan.details[38].price));
  return Math.floor(ret);
  }

  //計算45　その他合計
  cal45() {
    let ret=(this.getNumber(this.plan.details[23].price)) + (this.getNumber(this.plan.details[24].price)) + (this.getNumber(this.plan.details[25].price)) + (this.getNumber(this.plan.details[26].price)) + (this.getNumber(this.plan.details[27].price))
    + (this.getNumber(this.plan.details[28].price)) + (this.getNumber(this.plan.details[29].price)) + (this.getNumber(this.plan.details[30].price)) + (this.getNumber(this.plan.details[31].price))+ (this.getNumber(this.plan.details[32].price))+ (this.getNumber(this.plan.details[33].price))
    + (Number(this.cal37())) + (Number(this.cal38()))+ (this.changeHang(this.plan.taxation,0.015))+ (this.changeHang(this.plan.taxation,0.02))+ this.cal42();
    return Math.floor(ret);
    }

    //計算46　土地関係金利
    cal46() {
      if(!isNullOrUndefined(this.plan.landLoan) && !isNullOrUndefined(this.plan.landInterest) && !isNullOrUndefined(this.plan.landPeriod)){
        let ret = (Number(this.plan.landLoan) * Number(this.plan.landInterest) / 12 * Number(this.plan.landPeriod));
        return Math.floor (ret);
      }
    
    }

    //計算47　建物関係金利
    cal47() {
      if(!isNullOrUndefined(this.plan.buildLoan) && !isNullOrUndefined(this.plan.buildInterest) && !isNullOrUndefined(this.plan.buildPeriod)){
        let ret =(Number(this.plan.buildLoan) * Number(this.plan.buildInterest) / 12 * Number(this.plan.buildPeriod));
        return Math.floor (ret);
      }
    
    }

    //計算48　金利合計
    cal48() {
      if(this.cal46() > 0 || this.cal47() > 0 ){
      let ret= (Number(this.cal46())) + (Number(this.cal47()));
      return Math.floor(ret);
      } else {
        return '';
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
    return Math.floor(ret);
  }

  //計算50_s    
  cal50(pos :number) {
    let ret = 0;
  
    // 20200518 S_Edit
    var priceForCalc = this.removeComma(this.plan.details[pos].price);

    //ret = !isNullOrUndefined(this.plan.details[pos].price) ? Number(this.plan.details[pos].price) : 0;
    ret = !isNullOrUndefined(priceForCalc) ? Number(priceForCalc) : 0;

    if(ret > 0 && this.plan.totalArea > 0){
      ret = Math.floor(ret / (this.plan.totalArea * 0.3025 ));
    }

    //return Math.floor(ret);
    return this.numberFormat(ret.toString());
    // 20200518 E_Edit
  }
  
  
  /*cal50_39() {
    if(!isNullOrUndefined(Number(this.cal39())) && this.plan.totalArea > 0){
      let ret = Math.floor(Number(this.cal39()) / (this.plan.totalArea * 0.3025 * 100 ) / 100);
      return Math.floor(ret);
    }    
  }

  cal50_40() {
    if(!isNullOrUndefined(Number(this.cal40())) && this.plan.totalArea > 0){
      let ret = Math.floor(Number(this.cal40()) / (this.plan.totalArea * 0.3025 * 100 ) / 100);
      return Math.floor(ret);
    }    
  }*/



  //計算50_e

  //計算51_s 賃料
  //計算52_s　敷金

  
  cal51(pos: number) {
    if(!isNullOrUndefined(this.plan.rentdetails[pos].space) && !isNullOrUndefined(this.plan.rentdetails[pos].rentUnitPrice)){
      let ret = Math.floor(Number(this.plan.rentdetails[pos].space)) * 0.3025 * 100  / 100 * (Number(this.plan.rentdetails[pos].rentUnitPrice));
      return Math.floor(ret);
    }    
  }

  cal52(pos: number) {
    if(!isNullOrUndefined(this.plan.rentdetails[pos].space) && !isNullOrUndefined(this.plan.rentdetails[pos].rentUnitPrice) && !isNullOrUndefined(this.plan.rentdetails[pos].securityDeposit)){
      let ret = Math.floor(Number(this.plan.rentdetails[pos].space)) * 0.3025 * 100  / 100 * (Number(this.plan.rentdetails[pos].rentUnitPrice))* (Number(this.plan.rentdetails[pos].securityDeposit));
      return Math.floor(ret);
    }    
  }

  
  //計算51_e 賃料
  //計算52_e　敷金
  cal53() {
    if(!isNullOrUndefined(this.plan.rentdetails[15].space) && !isNullOrUndefined(this.plan.rentdetails[15].rentUnitPrice)){
      let ret = Math.floor(Number(this.plan.rentdetails[15].space)) * 0.3025 * 100  / 100 * (Number(this.plan.rentdetails[15].rentUnitPrice));
      return Math.floor(ret);
    }    
  }

  cal54() {
    if(!isNullOrUndefined(this.plan.rentdetails[15].space) && !isNullOrUndefined(this.plan.rentdetails[15].rentUnitPrice) && !isNullOrUndefined(this.plan.rentdetails[15].securityDeposit)){
      let ret = Math.floor(Number(this.plan.rentdetails[15].space)) * 0.3025 * 100  / 100 * (Number(this.plan.rentdetails[15].rentUnitPrice))* (Number(this.plan.rentdetails[15].securityDeposit));
      return Math.floor(ret);
    }    
  }

  cal55() {
    if(!isNullOrUndefined(this.plan.rentdetails[16].space) && !isNullOrUndefined(this.plan.rentdetails[16].rentUnitPrice)){
      let ret = Math.floor(Number(this.plan.rentdetails[16].space)) * 0.3025 * 100  / 100 * (Number(this.plan.rentdetails[16].rentUnitPrice));
      return Math.floor(ret);
    }    
  }

  cal56() {
    if(!isNullOrUndefined(this.plan.rentdetails[16].space) && !isNullOrUndefined(this.plan.rentdetails[16].rentUnitPrice) && !isNullOrUndefined(this.plan.rentdetails[16].securityDeposit)){
      let ret = Math.floor(Number(this.plan.rentdetails[16].space)) * 0.3025 * 100  / 100 * (Number(this.plan.rentdetails[16].rentUnitPrice))* (Number(this.plan.rentdetails[16].securityDeposit));
      return Math.floor(ret);
    }    
  }

  cal57() {
    if(!isNullOrUndefined(this.plan.rentdetails[17].space) && !isNullOrUndefined(this.plan.rentdetails[17].rentUnitPrice)){
      let ret = Math.floor(Number(this.plan.rentdetails[17].space)) * 0.3025 * 100  / 100 * (Number(this.plan.rentdetails[17].rentUnitPrice));
      return Math.floor(ret);
    }    
  }

  cal58() {
    if(!isNullOrUndefined(this.plan.rentdetails[17].space) && !isNullOrUndefined(this.plan.rentdetails[17].rentUnitPrice) && !isNullOrUndefined(this.plan.rentdetails[17].securityDeposit)){
      let ret = Math.floor(Number(this.plan.rentdetails[17].space)) * 0.3025 * 100  / 100 * (Number(this.plan.rentdetails[17].rentUnitPrice))* (Number(this.plan.rentdetails[17].securityDeposit));
      return Math.floor(ret);
    }    
  }

  cal59() {
    if(!isNullOrUndefined(this.plan.rentdetails[18].space) && !isNullOrUndefined(this.plan.rentdetails[18].rentUnitPrice)){
      let ret = Math.floor(Number(this.plan.rentdetails[18].space)) * 0.3025 * 100  / 100 * (Number(this.plan.rentdetails[18].rentUnitPrice));
      return Math.floor(ret);
    }    
  }
  
  

  //計算６０
  cal60() {
    if(!isNullOrUndefined(this.plan.rentdetails[18].space) && !isNullOrUndefined(this.plan.rentdetails[18].rentUnitPrice) && !isNullOrUndefined(this.plan.rentdetails[18].securityDeposit)){
    let ret = ((this.getNumber(this.plan.rentdetails[18].space) * 0.3025 * 100 ) / 100)* this.getNumber(this.plan.rentdetails[18].rentUnitPrice) * this.getNumber(this.plan.rentdetails[18].securityDeposit);
    return Math.floor(ret);
    }
  }

  //計算６１
  cal61() {
    let ret = (this.getNumber(this.plan.rentdetails[0].space))+(this.getNumber(this.plan.rentdetails[1].space))+(this.getNumber(this.plan.rentdetails[2].space))+(this.getNumber(this.plan.rentdetails[3].space))+(this.getNumber(this.plan.rentdetails[4].space))
    +(this.getNumber(this.plan.rentdetails[5].space))+(this.getNumber(this.plan.rentdetails[6].space))+(this.getNumber(this.plan.rentdetails[7].space))+(this.getNumber(this.plan.rentdetails[8].space))
    +(this.getNumber(this.plan.rentdetails[9].space))+(this.getNumber(this.plan.rentdetails[10].space))+(this.getNumber(this.plan.rentdetails[11].space))+(this.getNumber(this.plan.rentdetails[12].space))
    +(this.getNumber(this.plan.rentdetails[13].space))+(this.getNumber(this.plan.rentdetails[14].space))+(this.getNumber(this.plan.rentdetails[15].space))+(this.getNumber(this.plan.rentdetails[16].space))+(this.getNumber(this.plan.rentdetails[17].space))+(this.getNumber(this.plan.rentdetails[18].space));
    return Math.floor(ret);
    }
  

  //計算６２
  cal62() {
    let ret = 0;
    let pos = 0;
    while(pos < 19) {      
      ret += (((this.getNumber(this.plan.rentdetails[pos].space) * 0.3025 * 100 ) / 100) * this.getNumber(this.plan.rentdetails[pos].rentUnitPrice));
      pos++;
    }
    return Math.floor(ret);
  }

  //計算６３
  cal63() {
    let ret = 0;
    let pos = 0;
    while(pos < 19) {      
      ret += (((this.getNumber(this.plan.rentdetails[pos].space) * 0.3025 * 100 ) / 100) * this.getNumber(this.plan.rentdetails[pos].rentUnitPrice) * this.getNumber(this.plan.rentdetails[pos].securityDeposit));
      pos++;
    }
    return Math.floor(ret);
  }
  //計算６４
  cal64() {
    let ret = this.cal62() * 12;
    return Math.floor(ret);
 
  }
  //計算６５
  cal65() {
    if(!isNullOrUndefined(this.plan.rent.commonFee == null) && this.plan.totalUnits > 0){
    const cal65= Number(this.plan.rent.commonFee) * this.plan.totalUnits;
    return cal65;
   } else {
     return '';
   }
  
  }

  //計算６６
  cal66() {
    let ret = Number(this.cal65()) * 12;
    return Math.floor(ret);
 
  }

  //計算６７
  cal67() {
    let ret = Math.floor(Number(this.plan.rent.monthlyOtherIncome) * 12);
    return Math.floor(ret);
  }


  //計算６８
  cal68() {
    let val62 = this.cal62() * 12 + this.getNumber(this.plan.rent.commonFee)*this.getNumber(this.plan.totalUnits)*12 + this.getNumber(this.plan.rent.monthlyOtherIncome) * 12;
    return Math.floor(val62);
  }

  //計算６９
  cal69() {
    let cal69 = this.cal68() * this.getNumber(this.plan.rent.occupancyRate);
    return Math.floor(cal69);
  }



//計算７０_S ＮＯＩ※(B)*(1-経費率）
cal70_1() {
  if(!isNullOrUndefined(this.cal69 == null ) && Number(this.plan.rent.expenseRatio1 ) > 0){
  let ret = Math.floor(this.cal69() * ( 1- (this.getNumber(this.plan.rent.expenseRatio1)/100)));
  return Math.floor(ret);
} else {
  return '';
}
}

cal70_2() {
  if(!isNullOrUndefined(this.cal69 == null ) && Number(this.plan.rent.expenseRatio2 ) > 0){
  let ret = Math.floor(this.cal69() * ( 1- (this.getNumber(this.plan.rent.expenseRatio2)/100)));
  return Math.floor(ret);
} else {
  return '';
}
}

cal70_3() {
  if(!isNullOrUndefined(this.cal69 == null ) && Number(this.plan.rent.expenseRatio3 ) > 0){
  let ret =  Math.floor(this.cal69() * ( 1- (this.getNumber(this.plan.rent.expenseRatio3)/100)));
  return Math.floor(ret);
} else {
  return '';
}
}

cal70_4() {
  if(!isNullOrUndefined(this.cal69 == null ) && Number(this.plan.rent.expenseRatio4 ) > 0){
  let ret =  Math.floor(this.cal69() * ( 1- (this.getNumber(this.plan.rent.expenseRatio4)/100)));
  return Math.floor(ret);
} else {
  return '';
}
}

//計算７１_S ＮＯＩ利回り※NOI/(A)
cal71_1() {
  if(isNullOrUndefined(this.cal70_1 == null)){
  let cal71_1 = Math.floor(Number(this.cal70_1()) / this.cal49());
  return Math.floor(cal71_1);
} else {
  return '';
}
}

cal71_2() {
  if(isNullOrUndefined(this.cal70_2 == null )){
    let cal71_2 = Math.floor(Number(this.cal70_2()) / this.cal49());
    return Math.floor(cal71_2);
  } else {
    return '';
  }
  }

cal71_3() {
  if(isNullOrUndefined(this.cal70_3 == null )){
    let cal71_3 = Math.floor(Number(this.cal70_3()) / this.cal49());
    return Math.floor(cal71_3);
  } else {
    return '';
  }
  }

cal71_4() {
  if(isNullOrUndefined(this.cal70_4 == null )){
    let cal70_4 = Math.floor(Number(this.cal70_4()) / this.cal49());
    return Math.floor(cal70_4);
  } else {
    return '';
  }
  }

//計算７２_S 売上金利(D)※NOI/(A)
cal72_1() {
  if(!isNullOrUndefined(this.cal70_1 == null )&&  Number(this.plan.rent.salesProfits) > 0 ){
  let ret = Math.floor(Number(this.cal70_1()) / (Number(this.plan.rent.salesProfits)/100));
  return Math.floor(ret);
} else {
  return '';
}
}

cal72_2() {
  if(!isNullOrUndefined(this.cal70_2 == null )&&  Number(this.plan.rent.salesProfits) > 0 ){
    let ret = Math.floor(Number(this.cal70_2()) / (Number(this.plan.rent.salesProfits)/100));
    return Math.floor(ret);
  } else {
    return '';
  }
  }

cal72_3() {
  if(!isNullOrUndefined(this.cal70_3 == null )&&  Number(this.plan.rent.salesProfits) > 0 ){
    let ret = Math.floor(Number(this.cal70_3()) / (Number(this.plan.rent.salesProfits)/100));
    return Math.floor(ret);
  } else {
    return '';
  }
  }

cal72_4() {
  if(!isNullOrUndefined(this.cal70_4 == null )&&  Number(this.plan.rent.salesProfits) > 0 ){
    let ret = Math.floor(Number(this.cal70_4()) / (Number(this.plan.rent.salesProfits)/100));
    return Math.floor(ret);
  } else {
    return '';
  }
  }

//計算７３_S 売却時利益(E)※(D)-(A)
cal73_1() {
  if(!isNullOrUndefined(this.cal72_1 == null ) && !isNullOrUndefined(this.cal49 == null )){
  let ret = Math.floor(Number(this.cal72_1()) - this.cal49());
  return Math.floor(ret);
}  else {
  return '';
}
}

cal73_2() {
  
  if(!isNullOrUndefined(this.cal72_2 == null ) && !isNullOrUndefined(this.cal49 == null )){
    let ret = Math.floor(Number(this.cal72_2()) - this.cal49());
    return Math.floor(ret);
  }  else {
    return '';
  }
  }

cal73_3() {
  if(!isNullOrUndefined(this.cal72_3 == null ) && !isNullOrUndefined(this.cal49 == null )){
    let ret = Math.floor(Number(this.cal72_3()) - this.cal49());
    return Math.floor(ret);
  }  else {
    return '';
  }
  }

cal73_4() {
  if(!isNullOrUndefined(this.cal72_4 == null ) && !isNullOrUndefined(this.cal49 == null )){
    let ret = Math.floor(Number(this.cal72_4()) - this.cal49());
    return Math.floor(ret);
  }  else {
    return '';
  }
  }

//計算７４_S 利益率※(E)/(D)
cal74_1() {
  
  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
  let ret =  Math.round(Number(this.cal73_1()) / (Number(this.cal72_1())/100)*100);
  return Math.round(ret);

}else{
  return '';
}
}

cal74_2() {
  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
    let ret =  Math.round(Number(this.cal73_2()) / (Number(this.cal72_2())/100)*100);
    return Math.round(ret);
  
  }else{
    return '';
  }
  }

cal74_3() {
  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
    let ret =  Math.round(Number(this.cal73_3()) / (Number(this.cal72_3())/100)*100);
    return Math.round(ret);
  
  }else{
    return '';
  }
  }

cal74_4() {
  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
  let ret =  Math.round(Number(this.cal73_4()) / (Number(this.cal72_4())/100)*100);
  return Math.round(ret);

}else{
  return '';
}
}

//計算７７_S 売買計画　売却金額
cal77_1() {
  let cal77_1 = this.cal69() *  (this.getNumber(this.plan.rent.profitsA));
  return Math.floor(cal77_1);
}

cal77_2() {
  let cal77_2 = this.cal69() *  (this.getNumber(this.plan.rent.profitsB));
  return Math.floor(cal77_2);
}

cal77_3() {
  let cal77_3 = this.cal69() * (this.getNumber(this.plan.rent.profitsC));
  return Math.floor(cal77_3);
}

cal77_4() {
  let cal77_4 = this.cal69() *  (this.getNumber(this.plan.rent.profitsD));
  return Math.floor(cal77_4);
}

//計算７９_S 売買計画　販売経費小計
cal79_1() {
  let cal79_1 = (this.getNumber(this.plan.rent.salesExpense1A)) + (this.getNumber(this.plan.rent.salesExpense2A)) + (this.getNumber(this.plan.rent.salesExpense3A));
  return Math.floor(cal79_1);
}

cal79_2() {
  let cal79_2 =  (this.getNumber(this.plan.rent.salesExpense1B)) + (this.getNumber(this.plan.rent.salesExpense2B)) + (this.getNumber(this.plan.rent.salesExpense3B));
  return Math.floor(cal79_2);
}

cal79_3() {
  let cal79_3 =  (this.getNumber(this.plan.rent.salesExpense1C)) + (this.getNumber(this.plan.rent.salesExpense2C)) + (this.getNumber(this.plan.rent.salesExpense3C));
  return Math.floor(cal79_3);
}

cal79_4() {
  let cal79_4 =  (this.getNumber(this.plan.rent.salesExpense1D)) + (this.getNumber(this.plan.rent.salesExpense2D)) + (this.getNumber(this.plan.rent.salesExpense3D));
  return Math.floor(cal79_4);
}

//計算８０_S 売買計画　利益
cal80_1() {
  let cal80_1 = this.cal77_1() - this.cal49() - this.cal79_1();
  return Math.floor(cal80_1);
}

cal80_2() {
  let cal80_2 = this.cal77_2() - this.cal49() - this.cal79_2();
  return Math.floor(cal80_2);
}

cal80_3() {
  let cal80_3 = this.cal77_3() - this.cal49() - this.cal79_3();
  return Math.floor(cal80_3);
}

cal80_4() {
  let cal80_4 = this.cal77_4() - this.cal49() - this.cal79_4();
  return Math.floor(cal80_4);
}

//計算８１_S 売買計画　利益率
cal81_1() {
  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
  let cal81_1 = Math.round(this.cal80_1() / this.cal77_1()*100)/100;
  return cal81_1;
} else {
  return '';
}
}

cal81_2() {
  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
  let cal81_2 = Math.round(this.cal80_2() / this.cal77_2()*100)/100;
  return cal81_2;
} else {
  return '';
}
}

cal81_3() {
  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
  let cal81_3 =  Math.round(this.cal80_3() / this.cal77_3()*100)/100;
  return cal81_3;
} else {
  return '';
}
}

cal81_4() {
  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
  let cal81_4 =  Math.round(this.cal80_4() / this.cal77_4()*100)/100;
  return cal81_4;
} else {
  return '';
}
}

// 20200518 S_Add
numberFormat(val) {
  // 空の場合そのまま返却
  if (val == ''){
    return '';
  }
  // 全角から半角へ変換し、既にカンマが入力されていたら事前に削除
  val = val.replace(/,/g, "").trim();
  // 整数部分を3桁カンマ区切りへ
  val = Number(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return val;
}

removeComma(val) {
  val = val.replace(/,/g, "").trim();
  return val;
}
// 20200518 E_Add



}
