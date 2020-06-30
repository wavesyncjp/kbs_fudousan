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
    super(router, service,dialog);
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
          if(this.plan.rent == null || !this.plan.rent) {
            this.plan.rent = new Planrentroll();
          }
          this.plan.convert();
          this.data = new Templandinfo(values[4].land as Templandinfo);
          delete this.plan['land'];
        } else {
          this.data = new Templandinfo(values[4] as Templandinfo);
          this.plan = new Planinfo();
          // 20200519 S_Add
          this.plan.landLoan = "";
          this.plan.buildLoan = "";
          // 20200519 E_Add
          // 20200527 S_Add 新規作成の際、カンマを自動でつける処理が行われないこと、自動計算が行われないことに対する修正
          this.plan.landInterest = "";
          this.plan.landPeriod = "";
          this.plan.buildInterest = "";
          this.plan.buildPeriod = "";
          //新規作成で片方にしか値が入っていない場合計算結果がNaNになっていたため修正
          this.plan.parkingIndoor = 0;
          this.plan.parkingOutdoor = 0;
          // 20200527 E_Add
        }
      }

      if(this.plan.rent == null || !this.plan.rent) {
        this.plan.rent = new Planrentroll();
        // 20200519 S_Add
        this.plan.rent.salesExpense1A = "";
        this.plan.rent.salesExpense1B = "";
        this.plan.rent.salesExpense1C = "";
        this.plan.rent.salesExpense1D = "";
        this.plan.rent.salesExpense2A = "";
        this.plan.rent.salesExpense2B = "";
        this.plan.rent.salesExpense2C = "";
        this.plan.rent.salesExpense2D = "";
        this.plan.rent.salesExpense3A = "";
        this.plan.rent.salesExpense3B = "";
        this.plan.rent.salesExpense3C = "";
        this.plan.rent.salesExpense3D = "";
        this.plan.rent.commonFee = "";
        this.plan.rent.monthlyOtherIncome  ="";
        // 20200519 E_Add
      }

      //明細情報が存在しない場合
      if (this.plan.details == null || this.plan.details.length == 0) {
        this.plan.details = [];
        const lst = ["1001", "1002", "1003", "1004", "1005", "", "", "", "", "", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008",
          "", "", "", "", "", "3001", "3002", "3003", "3004", "3005", "3006", "3007", "3008", "3009", "3010", "3011", "", "", "3012", "3013", "3014"];
        lst.forEach((code, index) => {
          let detail = new Plandetail();
          detail.paymentCode = code;
          detail.backNumber = String(index + 1);

          // 20200527 S_Add 新規作成の際、カンマを自動でつける処理が行われないこと、自動計算が行われないことに対する修正
          detail.price = "";
          detail.unitPrice = "";
          detail.priceTax = "";
          detail.valuation = "";
          detail.rent = "";
          detail.burdenDays = "";
          detail.totalMonths = "";
          detail.commissionRate = "";
          detail.complePriceMonth = "";
          detail.dismantlingMonth = "";
          detail.routePrice = "";
          // 20200527 E_Add
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
      return Math.floor(this.removeComma(val) * 0.3025 * 100) / 100;
    } else {
      return '';
    }
  }
  //20200331 ADD まだ機能しない為、再考

  getNumber(val) {
    if (val == null || val === '' || isNaN(val)) return 0;
      return Number(val);
    }


  changeHang(val, val1) {
    // 20200527 S_Add 土地 取得時税金 所得税・登録税が出力していない点を修正
    val = this.removeComma(String(val));
    // 20200527 E_Add
    if (isNullOrUndefined(val) || val == null || val === '' || isNaN(val)) return 0;
    return Math.floor(Number(val) * this.getNumber(val1));
  }

  changeUnit (val, val1) {
    this.plan.totalArea = this.removeComma(this.plan.totalArea);
    // 20200527 S_Add　土地 取得時税金 所得税・登録税が出力していない点を修正
    val = this.removeComma(String(val));
    // totalAreaが0の時、0除算が発生してエラーになっていたため
      /*if(this.plan.totalArea == 0 || this.plan.totalArea == null) 
        return 0;
      }*/
      if(this.plan.totalArea.length == 0) return 0;
    // 20200527 E_Add
      if (isNullOrUndefined(val) || val == null || val === '' || isNaN(val)) return 0;
      val = Number(val) * this.getNumber(val1) / (this.getNumber(this.plan.totalArea) * 0.3025);
      this.plan.totalArea = this.numberFormat(this.plan.totalArea);
      return Math.floor(val);
    
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
            this.router.navigate(['/plandetail'], {queryParams: {pid: this.plan.pid}});
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
          this.service.writeToFile(data, "収支帳票");
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
      // 20200518 S_Edit
      this.plan.taxation = this.getNumber(this.removeComma(this.plan.taxationMap));
      this.plan.fixedTaxLand = Math.floor(this.plan.taxation * 0.014);
      this.plan.fixedTaxLandMap = this.numberFormat(String(this.plan.fixedTaxLand));
      // 20200518 E_Edit
    }

    //計算18
    if(name === 'taxationCity') {
      // 20200518 S_Edit
      this.plan.taxationCity = this.getNumber(this.removeComma(this.plan.taxationCityMap));
      this.plan.cityPlanTaxLand = Math.floor(this.plan.taxationCity * 0.03);
      this.plan.cityPlanTaxLandMap = this.numberFormat(String(this.plan.cityPlanTaxLand));
      // 20200518 E_Edit
    }
    //計算19
    if(name === 'buildValuation') {
      // 20200518 S_Edit
      this.plan.buildValuation = this.getNumber(this.removeComma(this.plan.buildValuationMap));
      this.plan.fixedTaxBuild = Math.floor(this.plan.buildValuation * 0.014);
      this.plan.fixedTaxBuildMap = this.numberFormat(String(this.plan.fixedTaxBuild));
      // 20200518 E_Edit
    }

    //計算20
    if(name === 'buildValuation') {
      // 20200518 S_Edit
      this.plan.buildValuation = this.getNumber(this.removeComma(this.plan.buildValuationMap));
      this.plan.cityPlanTaxBuild = Math.floor(this.plan.buildValuation * 0.03);
      this.plan.cityPlanTaxBuildMap = this.numberFormat(String(this.plan.cityPlanTaxBuild));
      // 20200518 E_Edit
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
      // 20200518 S_Edit
      this.plan.afterTaxation = this.getNumber(this.removeComma(this.plan.afterTaxationMap));
      this.plan.afterFixedTax = Math.floor(this.plan.afterTaxation * 0.014);
      this.plan.afterFixedTaxMap = this.numberFormat(String(this.plan.afterFixedTax));
      // 20200518 E_Edit
    }

    //計算２５
    if(name === 'afterTaxationCity') {
      // 20200518 S_Edit
      this.plan.afterTaxationCity = this.getNumber(this.removeComma(this.plan.afterTaxationCityMap));
      this.plan.afterCityPlanTax = Math.floor(this.plan.afterTaxationCity * 0.03);
      this.plan.afterCityPlanTaxMap = this.numberFormat(String(this.plan.afterCityPlanTax));
      // 20200518 E_Edit
    }

    //計算２７
    if(name === 'fixedTaxLand' || name === 'cityPlanTaxLand' || name === 'fixedTaxBuild' || name === 'cityPlanTaxBuild' || name === 'burdenDays') {
      this.cal27();
    }

    //設計料 price11
    //建築予備費 price13
    if(name === 'price10'){
      if(!isNullOrUndefined(this.plan.details[10].price) && !isNullOrUndefined(this.plan.details[11].price)){
        // 20200518 S_Edit
        this.plan.details[10].price = this.removeComma(this.plan.details[10].price);
        this.plan.details[11].price= String(Math.floor(Number(this.getNumber(this.plan.details[10].price)) * 0.03));
        //this.plan.details[11].price = this.numberFormat(this.plan.details[11].price);
        this.plan.details[13].price= String(Math.floor(Number(this.getNumber(this.plan.details[10].price)) * 0.02));
        //this.plan.details[13].price = this.numberFormat(this.plan.details[13].price);
      
        this.changeValue('price11');
        this.changeValue('price13');

        this.plan.details[10].price = this.numberFormat(this.plan.details[10].price);
        // 20200518 E_Edit
      }
    }
    //建物　取得時税金　取得税 price30
    //建物　取得時税金　登録税 price31
    if(name === 'buildArea'){
      this.plan.buildArea = this.removeComma(this.plan.buildArea);
      if(Number(this.plan.details[30].valuation)>0 || Number(this.plan.buildArea)>0){
        // 20200518 S_Edit
        
        this.plan.details[30].valuation = this.removeComma(this.plan.details[30].valuation);
        this.plan.details[30].price = String((Math.floor(Number(this.plan.details[30].valuation)) * Number(this.plan.buildArea))*0.04);
        this.plan.details[31].price = String(Math.floor(Number(this.plan.details[30].valuation)) * Number(this.plan.buildArea)*0.004);
        //this.changeValue('price11');
        this.changeValue('price30');
        this.changeValue('price31');
        
        this.plan.details[30].valuation = this.numberFormat(this.plan.details[30].valuation);
        this.plan.buildArea = this.numberFormat(this.plan.buildArea);

        // 20200518 E_Edit
      }
    }

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
    if(name === 'salesExpense1A') {
      this.plan.rent.salesExpense1A = this.numberFormat(this.plan.rent.salesExpense1A);
    }
    if(name === 'salesExpense1B') {
      this.plan.rent.salesExpense1B = this.numberFormat(this.plan.rent.salesExpense1B);
    }
    if(name === 'salesExpense1C') {
      this.plan.rent.salesExpense1C = this.numberFormat(this.plan.rent.salesExpense1C);
    }
    if(name === 'salesExpense1D') {
      this.plan.rent.salesExpense1D = this.numberFormat(this.plan.rent.salesExpense1D);
    }
    if(name === 'salesExpense2A') {
      this.plan.rent.salesExpense2A = this.numberFormat(this.plan.rent.salesExpense2A);
    }
    if(name === 'salesExpense2B') {
      this.plan.rent.salesExpense2B = this.numberFormat(this.plan.rent.salesExpense2B);
    }
    if(name === 'salesExpense2C') {
      this.plan.rent.salesExpense2C = this.numberFormat(this.plan.rent.salesExpense2C);
    }
    if(name === 'salesExpense2D') {
      this.plan.rent.salesExpense2D = this.numberFormat(this.plan.rent.salesExpense2D);
    }
    if(name === 'salesExpense3A') {
      this.plan.rent.salesExpense3A = this.numberFormat(this.plan.rent.salesExpense3A);
    }
    if(name === 'salesExpense3B') {
      this.plan.rent.salesExpense3B = this.numberFormat(this.plan.rent.salesExpense3B);
    }
    if(name === 'salesExpense3C') {
      this.plan.rent.salesExpense3C = this.numberFormat(this.plan.rent.salesExpense3C);
    }
    if(name === 'salesExpense3D') {
      this.plan.rent.salesExpense3D = this.numberFormat(this.plan.rent.salesExpense3D);
    }
    if(name === 'tsuboUnitPriceA') {
      this.plan.rent.tsuboUnitPriceA = this.numberFormat(this.plan.rent.tsuboUnitPriceA);
    }
    if(name === 'tsuboUnitPriceB') {
      this.plan.rent.tsuboUnitPriceB = this.numberFormat(this.plan.rent.tsuboUnitPriceB);
    }
    if(name === 'tsuboUnitPriceC') {
      this.plan.rent.tsuboUnitPriceC = this.numberFormat(this.plan.rent.tsuboUnitPriceC);
    }
    if(name === 'tsuboUnitPriceD') {
      this.plan.rent.tsuboUnitPriceD = this.numberFormat(this.plan.rent.tsuboUnitPriceD);
    }
    if(name === 'landLoan'){
      this.plan.landLoan = this.numberFormat(this.plan.landLoan);
    }
    if(name === 'buildLoan'){
      this.plan.buildLoan = this.numberFormat(this.plan.buildLoan);
    }
    if(name === 'commonFee'){
      this.plan.rent.commonFee = this.numberFormat(this.plan.rent.commonFee);
    }
    if(name === 'monthlyOtherIncome'){
      this.plan.rent.monthlyOtherIncome = this.numberFormat(this.plan.rent.monthlyOtherIncome);
    }
    if(name === 'price11'){
      this.plan.details[11].price = this.numberFormat(this.plan.details[11].price);
    }
    if(name === 'price13'){
      this.plan.details[13].price = this.numberFormat(this.plan.details[13].price);
    }
    if(name === 'routePrice'){
      this.plan.details[0].routePrice = this.numberFormat(this.plan.details[0].routePrice);
    }
    //㎡にカンマをつける作業
    
    if(name === 'siteAreaBuy'){
      if(!isNullOrUndefined(this.plan.siteAreaBuy)){
        
        
        this.plan.siteAreaBuy = this.numberFormat(this.plan.siteAreaBuy);
      }
    }
    if(name === 'siteAreaCheck'){
      if(!isNullOrUndefined(this.plan.siteAreaCheck)){
        
        
        this.plan.siteAreaCheck = this.numberFormat(this.plan.siteAreaCheck);
      } 
    }
    

    if(name === 'buildArea'){
      if(!isNullOrUndefined(this.plan.buildArea)){
       
        
        this.plan.buildArea = this.numberFormat(this.plan.buildArea);
      } 
    }
    if(name === 'entrance'){
      if(!isNullOrUndefined(this.plan.entrance)){
    
        this.plan.entrance = this.numberFormat(this.plan.entrance);
      }
    }

    if(name === 'parking'){
      if(!isNullOrUndefined(this.plan.parking)){

        this.plan.parking = this.numberFormat(this.plan.parking);
      
      }
    }

    if(name === 'underArea'){
      if(!isNullOrUndefined(this.plan.underArea)){
      
        this.plan.underArea = this.numberFormat(this.plan.underArea);
      }
    }

    if(name === 'totalArea'){
      if(!isNullOrUndefined(this.plan.totalArea)){
       
        this.plan.totalArea = this.numberFormat(this.plan.totalArea);
      }
    }

    if(name === 'salesArea'){
      if(!isNullOrUndefined(this.plan.salesArea)){
       
        this.plan.salesArea = this.numberFormat(this.plan.salesArea);
      }
    }
  
  }
  

  // 20200518 S_Add
  /**
   * 値変更イベント
   * @param name 変更属性
   * @param pos 
  */
  changeValueDetail(name: string, pos :number) {
    if(name === 'price') {
      this.plan.details[pos].price = this.numberFormat(this.plan.details[pos].price);
    }
    if(name === 'priceTax') {
      this.plan.details[pos].priceTax = this.numberFormat(this.plan.details[pos].priceTax);
    }
    if(name === 'unitPrice') {
      this.plan.details[pos].unitPrice = this.numberFormat(this.plan.details[pos].unitPrice);
    }
    if(name === 'rentUnitPrice') {
      this.plan.rentdetails[pos].rentUnitPrice = this.numberFormat(this.plan.rentdetails[pos].rentUnitPrice);
    }
    if(name === 'valuation') {
      this.plan.details[pos].valuation = this.numberFormat(this.plan.details[pos].valuation);
    }
  }
  // 20200518 E_Add
  
   //消化容積 
   cal9() {
    this.plan.buildArea = this.removeComma(this.plan.buildArea);
    this.plan.siteAreaCheck = this.removeComma(this.plan.siteAreaCheck);
    if(!isNullOrUndefined(this.plan.buildArea) && !isNullOrUndefined(this.plan.siteAreaCheck)) {
        this.plan.siteAreaCheck = this.removeComma(this.plan.siteAreaCheck);
        const val9 = Math.floor(this.getNumber(this.plan.buildArea) / this.getNumber(this.plan.siteAreaCheck)*100*100)/100;
        this.plan.siteAreaCheck = this.numberFormat(this.plan.siteAreaCheck);
        this.plan.buildArea = this.numberFormat(this.plan.buildArea);
        return val9;
        
    } else {
      return 0;
    }
    
  }

  //レンタブル比 
  cal10() {
    this.plan.buildArea = this.removeComma(this.plan.buildArea);
    this.plan.totalArea = this.removeComma(this.plan.totalArea);
    if(!isNullOrUndefined(this.plan.totalArea)  && !isNullOrUndefined(this.plan.buildArea)) {
        const val10 = Math.floor(this.getNumber(this.plan.totalArea) / this.getNumber(this.plan.buildArea) *100*100)/100;
        this.plan.buildArea = this.numberFormat(this.plan.buildArea);
        this.plan.totalArea = this.numberFormat(this.plan.totalArea);
        return val10;
    } else {
      return 0;
    }
    
  }

  //総専有面積／（建築遅延面積＋エントランス・内廊下部分
  cal11() {
    this.plan.buildArea = this.removeComma(this.plan.buildArea);
    this.plan.entrance = this.removeComma(this.plan.entrance);
    this.plan.totalArea = this.removeComma(this.plan.totalArea);
    if(!isNullOrUndefined(this.plan.totalArea)  && !isNullOrUndefined(this.plan.buildArea)  && !isNullOrUndefined(this.plan.entrance)) {
      //20200528 S_Edit 計算が正しく行われていないことに対する改修
      //const val11 = Math.floor((this.plan.totalArea / (this.plan.buildArea + this.plan.entrance)) *100*100)/100;
        const val11 = Math.floor((this.getNumber(this.plan.totalArea) / 
        (this.getNumber(this.plan.buildArea) + this.getNumber(this.plan.entrance))) *100*100)/100;
        //20200528 E_Edit
        this.plan.buildArea = this.numberFormat(this.plan.buildArea);
        this.plan.entrance = this.numberFormat(this.plan.entrance);
        this.plan.totalArea = this.numberFormat(this.plan.totalArea);
        return val11;
    } else {
      return 0;
    }
    
  }
  

   //駐車合計台数  
   cal12() {
    this.plan.parking = this.removeComma(this.plan.parking);
    if(this.plan.parkingIndoor > 0 || this.plan.parkingOutdoor > 0) {
        const val12 =Number(this.plan.parkingIndoor) + Number(this.plan.parkingOutdoor);
        this.plan.parking = this.numberFormat(this.plan.parking);
        return val12;
    } else {
      return 0;
    }
  }

   

  //駐車場設置率
  cal13(){
    if(this.cal12() > 0 && this.plan.buysellUnits > 0){
      const val13 = (this.cal12() / this.plan.buysellUnits * 100) .toFixed(2);
      return val13;
    } else {
      return 0;
    }
  }

  //土地評価額 
  cal14() {
    // 20200519 S_Edit
    this.plan.details[0].routePrice = this.removeComma(this.plan.details[0].routePrice);
    this.plan.siteAreaBuy = this.removeComma(this.plan.siteAreaBuy);
    if(!isNullOrUndefined(this.plan.details[0].routePrice) && !isNullOrUndefined(this.plan.siteAreaBuy)){
      this.plan.landEvaluation = Math.floor(Number(this.plan.details[0].routePrice) * this.getNumber(this.plan.siteAreaBuy) * 7 / 8);
      this.plan.landEvaluationMap = this.numberFormat(String(this.plan.landEvaluation));
      // 20200527 S_Add 計算後にカンマが外れていたため
      this.plan.details[0].routePrice = this.numberFormat(this.plan.details[0].routePrice);
      // 20200527 E_Add
      // 20200519 E_Edit
      this.changeValue('landEvaluation');
    }
  }

  //課税標準額（固定）
  cal15() {
    // 20200519 S_Edit
    this.plan.landEvaluation = this.getNumber(this.removeComma(this.plan.landEvaluationMap));

    if(this.plan.landEvaluation > 0 && this.plan.residentialRate > 0) {
      this.plan.taxation = Math.floor(this.plan.landEvaluation * 1 / 6 * this.plan.residentialRate / 100 + this.plan.landEvaluation * (1 - this.plan.residentialRate / 100));
      this.plan.taxationMap = this.numberFormat(String(this.plan.taxation));
      // 20200519 E_Edit
      this.changeValue('taxation');
    }
    
  }
   //課税標準額（都市）
  cal16() {
    // 20200519 S_Edit
    this.plan.landEvaluation = this.getNumber(this.removeComma(this.plan.landEvaluationMap));

    if(this.plan.landEvaluation > 0 && this.plan.residentialRate > 0) {
      this.plan.taxationCity = Math.floor(this.plan.landEvaluation * 1 / 3 * this.plan.residentialRate / 100 + this.plan.landEvaluation * (1 - this.plan.residentialRate / 100));
      this.plan.taxationCityMap = this.numberFormat(String(this.plan.taxationCity));
      // 20200519 E_Edit
      this.changeValue('taxationCity');
    }
   
  }

  //精算分固都税年額
  cal21() {
    // 20200519 S_Edit
    this.plan.fixedTaxLand = this.getNumber(this.removeComma(this.plan.fixedTaxLandMap));
    this.plan.cityPlanTaxLand = this.getNumber(this.removeComma(this.plan.cityPlanTaxLandMap));
    this.plan.fixedTaxBuild = this.getNumber(this.removeComma(this.plan.fixedTaxBuildMap));
    this.plan.cityPlanTaxBuild = this.getNumber(this.removeComma(this.plan.cityPlanTaxBuildMap));
    // 20200519 E_Edit

    if(this.plan.fixedTaxLand > 0 || this.plan.cityPlanTaxLand > 0 || this.plan.fixedTaxBuild > 0 || this.plan.cityPlanTaxBuild > 0){
      const val21= (this.plan.fixedTaxLand + this.plan.cityPlanTaxLand + this.plan.fixedTaxBuild + this.plan.cityPlanTaxBuild);
      return val21;
    } else {
      return '';
    }
  }

  //取得後課税標準額（固定）
  cal22() {
    // 20200519 S_Edit
    this.plan.taxation = this.getNumber(this.removeComma(this.plan.taxationMap));
    this.plan.landEvaluation = this.getNumber(this.removeComma(this.plan.landEvaluationMap));
    this.plan.siteAreaBuy = this.removeComma(this.plan.siteAreaBuy);
      if(this.getNumber(this.plan.siteAreaBuy) <= 200) {
        this.plan.afterTaxation = this.plan.taxation;
      }
      else {
        this.plan.afterTaxation = Math.floor(this.plan.landEvaluation / this.getNumber(this.plan.siteAreaBuy) * (this.getNumber(this.plan.siteAreaBuy) - 100) * 1 / 3 + this.plan.landEvaluation * (1 - this.plan.residentialRate / 100));
      }

      if (this.getNumber(this.plan.afterTaxation) != 0) {
        this.plan.afterTaxationMap = this.numberFormat(String(this.plan.afterTaxation));
      }
      // 20200519 E_Edit

      this.changeValue('afterTaxation');
  }


  //取得後課税標準額（都市）
  cal23() {
    // 20200519 S_Edit
    this.plan.taxation = this.getNumber(this.removeComma(this.plan.taxationMap));
    this.plan.landEvaluation = this.getNumber(this.removeComma(this.plan.landEvaluationMap));
    this.plan.siteAreaBuy = this.removeComma(this.plan.siteAreaBuy);

    if(this.getNumber(this.plan.siteAreaBuy) <= 200) {
      this.plan.afterTaxationCity = this.plan.taxation;
    }
    else {
      this.plan.afterTaxationCity = Math.floor(this.plan.landEvaluation / this.getNumber(this.plan.siteAreaBuy) * (this.getNumber(this.plan.siteAreaBuy) - 100) * 2 / 3 + this.plan.landEvaluation * (1 - this.plan.residentialRate / 100));
    }

    if (this.getNumber(this.plan.afterTaxationCity) != 0) {
      this.plan.afterTaxationCityMap = this.numberFormat(String(this.plan.afterTaxationCity));
    }
    // 20200519 E_Edit

    this.changeValue('afterTaxationCity');
  }


  //取得後固都税年額
  cal26() {
    // 20200519 S_Edit
    this.plan.afterFixedTax = this.getNumber(this.removeComma(this.plan.afterFixedTaxMap));
    this.plan.afterCityPlanTax = this.getNumber(this.removeComma(this.plan.afterCityPlanTaxMap));
    // 20200519 E_Edit

    if(this.plan.afterFixedTax > 0 || this.plan.afterCityPlanTax > 0 ){
      const val26= (this.plan.afterFixedTax + this.plan.afterCityPlanTax);
      return val26;
    } else {
      return 0;
    }
  }


  

  //固都税精算金
  cal27() {
    // 20200519 S_Edit
    this.plan.fixedTaxLand = this.getNumber(this.removeComma(this.plan.fixedTaxLandMap));
    this.plan.cityPlanTaxLand = this.getNumber(this.removeComma(this.plan.cityPlanTaxLandMap));
    this.plan.fixedTaxBuild = this.getNumber(this.removeComma(this.plan.fixedTaxBuildMap));
    this.plan.cityPlanTaxBuild = this.getNumber(this.removeComma(this.plan.cityPlanTaxBuildMap));

    if(this.plan.fixedTaxLand > 0 || this.plan.cityPlanTaxLand > 0 || this.plan.fixedTaxBuild > 0 || this.plan.cityPlanTaxBuild > 0 || !isNullOrUndefined(this.plan.details[4].burdenDays)){
      this.plan.details[4].price = String(Math.floor(
      (this.getNumber(this.plan.fixedTaxLand) + this.getNumber(this.plan.cityPlanTaxLand) 
      + this.getNumber(this.plan.fixedTaxBuild) + this.getNumber(this.plan.cityPlanTaxBuild)) 
      / 365 * Number(this.getNumber(this.plan.details[4].burdenDays))));
    }

    this.plan.details[4].price = this.numberFormat(this.plan.details[4].price);
    // 20200519 E_Edit
  }

  //計算28　土地その他合計
  cal28() {
    // 20200519 S_Edit
    for (let i = 5; i <= 9; i++) {
      this.plan.details[i].price = this.removeComma(this.plan.details[i].price);
    }

    let ret= (this.getNumber(this.plan.details[5].price)) + (this.getNumber(this.plan.details[6].price)) + (this.getNumber(this.plan.details[7].price)) + (this.getNumber(this.plan.details[8].price)) + (this.getNumber(this.plan.details[9].price));
    
    for (let i = 5; i <= 9; i++) {
      this.plan.details[i].price = this.numberFormat(this.plan.details[i].price);
    }
    // 20200519 E_Edit

    return Math.floor(ret);
  }


  //計算29 土地原価合計
  cal29() {
    // 20200519 S_Edit
    for (let i = 0; i <= 4; i++) {
      this.plan.details[i].price = this.removeComma(this.plan.details[i].price);
    }

    let ret= (this.getNumber(this.plan.details[0].price)) + (this.getNumber(this.plan.details[1].price)) + (this.getNumber(this.plan.details[2].price)) + (this.getNumber(this.plan.details[3].price)) + (this.getNumber(this.plan.details[4].price) + this.cal28());
    
    for (let i = 0; i <= 4; i++) {
      this.plan.details[i].price = this.numberFormat(this.plan.details[i].price);
    }
    // 20200519 E_Edit

    return Math.floor(ret);
  }


  


  //近隣保障費等　金額(税抜)
  cal32() {
    // 20200519 S_Edit
    for (let i = 15; i <= 17; i++) {
      this.plan.details[i].price = this.removeComma(this.plan.details[i].price);
    }

    let ret= (this.getNumber(this.plan.details[15].price)) + (this.getNumber(this.plan.details[16].price)) + (this.getNumber(this.plan.details[17].price));
    
    for (let i = 15; i <= 17; i++) {
      this.plan.details[i].price = this.numberFormat(this.plan.details[i].price);
    }
    // 20200519 E_Edit

    return Math.floor(ret);
  }

  //計算33　建物その他合計
  cal33() {
    // 20200519 S_Edit
    for (let i = 18; i <= 22; i++) {
      this.plan.details[i].price = this.removeComma(this.plan.details[i].price);
    }

    let ret= (this.getNumber(this.plan.details[18].price)) + (this.getNumber(this.plan.details[19].price)) + (this.getNumber(this.plan.details[20].price)) + (this.getNumber(this.plan.details[21].price)) + (this.getNumber(this.plan.details[22].price));
    
    for (let i = 18; i <= 22; i++) {
      this.plan.details[i].price = this.numberFormat(this.plan.details[i].price);
    }
    // 20200519 E_Edit

    return Math.floor(ret);
  }

  //建物合計
  cal34() {
    // 20200519 S_Edit
    for (let i = 10; i <= 14; i++) {
      this.plan.details[i].price = this.removeComma(this.plan.details[i].price);
    }

    //let ret= (this.getNumber(this.plan.details[10].price)) + (this.getNumber(this.plan.details[11].price)) + (this.getNumber(this.plan.details[12].price)) + (this.getNumber(this.plan.details[13].price)) + (this.getNumber(this.plan.details[14].price) + this.cal32() + this.cal32() + this.cal33());
    let ret= (this.getNumber(this.plan.details[10].price)) + (this.getNumber(this.plan.details[11].price)) + (this.getNumber(this.plan.details[12].price)) + (this.getNumber(this.plan.details[13].price)) + (this.getNumber(this.plan.details[14].price) + this.cal32() + this.cal33());

    for (let i = 10; i <= 14; i++) {
      this.plan.details[i].price = this.numberFormat(this.plan.details[i].price);
    }
    // 20200519 E_Edit

    return Math.floor(ret);
  }

  //その他費用　土地固都税　金額(税抜)
  cal35() {
    // 20200519 S_Edit
    this.plan.afterFixedTax = this.getNumber(this.removeComma(this.plan.afterFixedTaxMap));
    this.plan.afterCityPlanTax = this.getNumber(this.removeComma(this.plan.afterCityPlanTaxMap));

    if(this.plan.afterFixedTax > 0 && this.plan.afterCityPlanTax > 0 && !isNullOrUndefined(this.plan.details[23].complePriceMonth)){
      this.plan.details[23].price = String(Math.floor(
        (this.getNumber(this.plan.afterFixedTax) + this.getNumber(this.plan.afterCityPlanTax) 
        ) / 12 * Number(this.getNumber(this.plan.details[23].complePriceMonth))));     
    }

    this.plan.details[23].price = this.numberFormat(this.plan.details[23].price);
    // 20200519 E_Edit
  }

  //その他費用　既存建物関係費　固都税　金額(税抜)
  cal36() {
    // 20200519 S_Edit
    this.plan.fixedTaxBuild = this.getNumber(this.removeComma(this.plan.fixedTaxBuildMap));
    this.plan.cityPlanTaxBuild = this.getNumber(this.removeComma(this.plan.cityPlanTaxBuildMap));

    if(this.plan.fixedTaxBuild > 0 && this.plan.cityPlanTaxBuild > 0 && !isNullOrUndefined(this.plan.details[24].dismantlingMonth)){
      this.plan.details[24].price = String(Math.floor(
        (this.getNumber(this.plan.fixedTaxBuild) + this.getNumber(this.plan.cityPlanTaxBuild) 
        ) / 12 * Number(this.getNumber(this.plan.details[24].dismantlingMonth))));

      this.plan.details[24].price = this.numberFormat(this.plan.details[24].price);
      // 20200519 E_Edit
    }
  }

  //その他費用　既存建物関係費　取得税
  cal37() {
    // 20200519 S_Edit
    this.plan.buildValuation = this.getNumber(this.removeComma(this.plan.buildValuationMap));
    // 20200519 E_Edit

    if(this.plan.buildValuation > 0){
      const val37= Number(this.plan.buildValuation) * 0.03;
      return Math.floor (val37);
    } else {
      return 0;
    }
  }

  //その他費用　既存建物関係費　登録免許税　
  cal38() {
    // 20200519 S_Edit
    this.plan.buildValuation = this.getNumber(this.removeComma(this.plan.buildValuationMap));
    // 20200519 E_Edit

    if(this.plan.buildValuation > 0){
      const cal38= Number(this.plan.buildValuation) * 0.02;
      return Math.floor (cal38);
    } else {
      return 0;
    }
  }

  //計算４１
  cal41() {
    // 20200519 S_Edit
    this.plan.details[32].rent = this.removeComma(this.plan.details[32].rent);

    if(!isNullOrUndefined(this.plan.details[32].rent) && !isNullOrUndefined(this.plan.details[33].totalMonths)){
      this.plan.details[32].price = String(Number(this.plan.details[32].rent) * Number(this.plan.details[33].totalMonths));
    }

    this.plan.details[32].rent = this.numberFormat(this.plan.details[32].rent);
    // 20200519 E_Edit
  }

  //融資手数料
  cal43() {
    // 20200519 S_Edit
    this.plan.landLoan = this.removeComma(this.plan.landLoan);

    if(!isNullOrUndefined(this.plan.landLoan) && !isNullOrUndefined(this.plan.details[36].commissionRate)){
      this.plan.details[36].price = String(Math.floor(Number(this.plan.landLoan) * Number(this.plan.details[36].commissionRate)/100));
    }
    

    this.plan.details[36].price = this.numberFormat(this.plan.details[36].price);
    this.plan.landLoan = this.numberFormat(this.plan.landLoan);
    // 20200519 E_Edit
  }

  //抵当権設定費用　
  cal44() {
    // 20200519 S_Edit
    this.plan.landLoan = this.removeComma(this.plan.landLoan);

    if(!isNullOrUndefined(this.plan.landLoan)){
      this.plan.details[37].price = String( Math.floor(Number(this.plan.landLoan) * 0.004));
      this.plan.details[37].price = this.numberFormat(this.plan.details[37].price);
      // 20200519 E_Edit
    }    
  }

  //計算42　その他その他合計
  cal42() {
    // 20200519 S_Edit
    for (let i = 34; i <= 38; i++) {
      this.plan.details[i].price = this.removeComma(this.plan.details[i].price);
    }

    let ret= (this.getNumber(this.plan.details[34].price)) + (this.getNumber(this.plan.details[35].price)) + (this.getNumber(this.plan.details[36].price)) + (this.getNumber(this.plan.details[37].price)) + (this.getNumber(this.plan.details[38].price));
    
    for (let i = 34; i <= 38; i++) {
      this.plan.details[i].price = this.numberFormat(this.plan.details[i].price);
    }
    // 20200519 E_Edit

    return Math.floor(ret);
  }

  //計算45　その他合計
  cal45() {
    // 20200519 S_Edit
    for (let i = 23; i <= 33; i++) {
      this.plan.details[i].price = this.removeComma(this.plan.details[i].price);
    }

    let ret=(this.getNumber(this.plan.details[23].price)) + (this.getNumber(this.plan.details[24].price)) + (this.getNumber(this.plan.details[25].price)) + (this.getNumber(this.plan.details[26].price)) + (this.getNumber(this.plan.details[27].price))
    + (this.getNumber(this.plan.details[28].price)) + (this.getNumber(this.plan.details[29].price)) + (this.getNumber(this.plan.details[30].price)) + (this.getNumber(this.plan.details[31].price))+ (this.getNumber(this.plan.details[32].price))+ (this.getNumber(this.plan.details[33].price))
    + (Number(this.cal37())) + (Number(this.cal38()))+ (this.changeHang(this.plan.taxation,0.015))+ (this.changeHang(this.plan.taxation,0.02))+ this.cal42();

    for (let i = 23; i <= 33; i++) {
      this.plan.details[i].price = this.numberFormat(this.plan.details[i].price);
    }
    // 20200519 E_Edit

    return Math.floor(ret);
  }

  //計算46　土地関係金利
  cal46() {
    // 20200519 S_Edit
    this.plan.landLoan = this.removeComma(this.plan.landLoan);

    if(!isNullOrUndefined(this.plan.landLoan) && !isNullOrUndefined(this.plan.landInterest) && !isNullOrUndefined(this.plan.landPeriod)){
      let ret = (Number(this.plan.landLoan) * Number(this.plan.landInterest) / 12 * Number(this.plan.landPeriod)/100);
      this.plan.landLoan = this.numberFormat(this.plan.landLoan);
      // 20200519 E_Edit

      return Math.floor (ret);
    }  
  }

  //計算47　建物関係金利
  cal47() {
    // 20200519 S_Edit
    this.plan.buildLoan = this.removeComma(this.plan.buildLoan);

    if(!isNullOrUndefined(this.plan.buildLoan) && !isNullOrUndefined(this.plan.buildInterest) && !isNullOrUndefined(this.plan.buildPeriod)){
      let ret =(Number(this.plan.buildLoan) * Number(this.plan.buildInterest) / 12 * Number(this.plan.buildPeriod)/100);
      this.plan.buildLoan = this.numberFormat(this.plan.buildLoan);
      // 20200519 E_Edit

      return Math.floor (ret);
    }
  }

    //計算48　金利合計
    cal48() {
      if(this.cal46() > 0 || this.cal47() > 0 ){
        let ret= (Number(this.cal46())) + (Number(this.cal47()));
        return Math.floor(ret);
      } else {
        return 0;
      }
     
     }
    
    

  //PJ原価
  cal49() {
    let ret = 0;

    ret = this.cal29() + this.cal34() + this.cal45() + this.cal46() + this.cal47();
    return Math.floor(ret);
  }

  //計算50_s  
  //計算50_s  
  cal50(pos :number) {
    // 20200519 S_Edit
    this.plan.details[pos].price = this.removeComma(this.plan.details[pos].price);
    
    let ret = 0;
    ret = !isNullOrUndefined(this.plan.details[pos].price) ? Number(this.plan.details[pos].price) : 0;
    
    this.plan.details[pos].price = this.numberFormat(this.plan.details[pos].price);
    // 20200519 E_Edit

    if(ret > 0 && !isNullOrUndefined(this.plan.totalArea)){
      this.plan.totalArea = this.removeComma(this.plan.totalArea);
      ret = Math.floor(ret / (this.getNumber(this.plan.totalArea) * 0.3025 ));
      this.plan.totalArea = this.numberFormat(this.plan.totalArea);
    }
    return Math.floor(ret);
  }

  //計算51_s 賃料
  //計算52_s　敷金

  
  cal51(pos: number) {
    // 20200519 S_Edit
    this.plan.rentdetails[pos].rentUnitPrice = this.removeComma(this.plan.rentdetails[pos].rentUnitPrice);
    this.plan.rentdetails[pos].space = this.removeComma(this.plan.rentdetails[pos].space);

    if(!isNullOrUndefined(this.plan.rentdetails[pos].space) && !isNullOrUndefined(this.plan.rentdetails[pos].rentUnitPrice)){
      let num = Math.floor(Number(this.plan.rentdetails[pos].space) * 0.3025 * 100)/ 100;
      let ret = Math.floor(Number(this.plan.rentdetails[pos].rentUnitPrice)) * num;
      this.plan.rentdetails[pos].rentUnitPrice = this.numberFormat(this.plan.rentdetails[pos].rentUnitPrice);
      this.plan.rentdetails[pos].space = this.numberFormat(this.plan.rentdetails[pos].space);
      // 20200519 E_Edit
      pos++;
      
      return Math.floor(ret);
    }    
  }

  cal52(pos: number) {
    // 20200519 S_Edit
    this.plan.rentdetails[pos].rentUnitPrice = this.removeComma(this.plan.rentdetails[pos].rentUnitPrice);
    this.plan.rentdetails[pos].space = this.removeComma(this.plan.rentdetails[pos].space);

    if(!isNullOrUndefined(this.plan.rentdetails[pos].space) && !isNullOrUndefined(this.plan.rentdetails[pos].rentUnitPrice) && !isNullOrUndefined(this.plan.rentdetails[pos].securityDeposit)){
      let num = Math.floor(Number(this.plan.rentdetails[pos].space) * 0.3025 * 100)/ 100;
      let ret =(Number(this.plan.rentdetails[pos].rentUnitPrice))* (Number(this.plan.rentdetails[pos].securityDeposit)) * num;
      this.plan.rentdetails[pos].rentUnitPrice = this.numberFormat(this.plan.rentdetails[pos].rentUnitPrice);
      this.plan.rentdetails[pos].space = this.numberFormat(this.plan.rentdetails[pos].space);
      // 20200519 E_Edit
      pos++;

      return Math.floor(ret);
    }    
  }

  
  //計算51_e 賃料
  //計算52_e　敷金

  //駐車場 台数
  cal53_1(){
    if(this.plan.parkingIndoor > 0){
      this.plan.rentdetails[15].space = this.removeComma(this.plan.rentdetails[15].space);
      this.plan.rentdetails[15].space = String(Math.floor(
        (this.getNumber(this.plan.parkingIndoor))));
    }else{
      return '';
    }

    this.plan.rentdetails[15].space = this.numberFormat(this.plan.rentdetails[15].space);
    
  }
  

  //駐車場　賃料
  cal53() {
    // 20200519 S_Edit
    this.plan.rentdetails[15].rentUnitPrice = this.removeComma(this.plan.rentdetails[15].rentUnitPrice);

    if(!isNullOrUndefined(this.plan.rentdetails[15].space) && !isNullOrUndefined(this.plan.rentdetails[15].rentUnitPrice)){
      let ret = Math.floor(Number(this.plan.rentdetails[15].space)) * (Number(this.plan.rentdetails[15].rentUnitPrice));
      this.plan.rentdetails[15].rentUnitPrice = this.numberFormat(this.plan.rentdetails[15].rentUnitPrice);
      // 20200519 E_Edit
      return Math.floor(ret);
    }    
  }
  //駐車場　敷金
  cal54() {
    // 20200519 S_Edit
    this.plan.rentdetails[15].rentUnitPrice = this.removeComma(this.plan.rentdetails[15].rentUnitPrice);

    if(!isNullOrUndefined(this.plan.rentdetails[15].space) && !isNullOrUndefined(this.plan.rentdetails[15].rentUnitPrice) && !isNullOrUndefined(this.plan.rentdetails[15].securityDeposit)){
      let ret = Math.floor(Number(this.plan.rentdetails[15].space)) * (Number(this.plan.rentdetails[15].rentUnitPrice))* (Number(this.plan.rentdetails[15].securityDeposit));
      this.plan.rentdetails[15].rentUnitPrice = this.numberFormat(this.plan.rentdetails[15].rentUnitPrice);
      // 20200519 E_Edit
      return Math.floor(ret);
    }    
  }
  //駐輪場　賃料
  cal55() {
    // 20200519 S_Edit
    this.plan.rentdetails[16].rentUnitPrice = this.removeComma(this.plan.rentdetails[16].rentUnitPrice);

    if(!isNullOrUndefined(this.plan.rentdetails[16].space) && !isNullOrUndefined(this.plan.rentdetails[16].rentUnitPrice)){
      let ret = Math.floor(Number(this.plan.rentdetails[16].space)) * (Number(this.plan.rentdetails[16].rentUnitPrice));
      this.plan.rentdetails[16].rentUnitPrice = this.numberFormat(this.plan.rentdetails[16].rentUnitPrice);
      // 20200519 E_Edit
      return Math.floor(ret);
    }    
  }
  //駐輪場　敷金
  cal56() {
    // 20200519 S_Edit
    this.plan.rentdetails[16].rentUnitPrice = this.removeComma(this.plan.rentdetails[16].rentUnitPrice);

    if(!isNullOrUndefined(this.plan.rentdetails[16].space) && !isNullOrUndefined(this.plan.rentdetails[16].rentUnitPrice) && !isNullOrUndefined(this.plan.rentdetails[16].securityDeposit)){
      let ret = Math.floor(Number(this.plan.rentdetails[16].space)) * (Number(this.plan.rentdetails[16].rentUnitPrice))* (Number(this.plan.rentdetails[16].securityDeposit));
      this.plan.rentdetails[16].rentUnitPrice = this.numberFormat(this.plan.rentdetails[16].rentUnitPrice);
      // 20200519 E_Edit
      return Math.floor(ret);
    }    
  }
  //バイク置き場　賃料
  cal57() {
    // 20200519 S_Edit
    this.plan.rentdetails[17].rentUnitPrice = this.removeComma(this.plan.rentdetails[17].rentUnitPrice);

    if(!isNullOrUndefined(this.plan.rentdetails[17].space) && !isNullOrUndefined(this.plan.rentdetails[17].rentUnitPrice)){
      let ret = Math.floor(Number(this.plan.rentdetails[17].space)) * (Number(this.plan.rentdetails[17].rentUnitPrice));
      this.plan.rentdetails[17].rentUnitPrice = this.numberFormat(this.plan.rentdetails[17].rentUnitPrice);
      // 20200519 E_Edit
      return Math.floor(ret);
    }    
  }
  //バイク置き場　敷金
  cal58() {
    // 20200519 S_Edit
    this.plan.rentdetails[17].rentUnitPrice = this.removeComma(this.plan.rentdetails[17].rentUnitPrice);

    if(!isNullOrUndefined(this.plan.rentdetails[17].space) && !isNullOrUndefined(this.plan.rentdetails[17].rentUnitPrice) && !isNullOrUndefined(this.plan.rentdetails[17].securityDeposit)){
      let ret = Math.floor(Number(this.plan.rentdetails[17].space)) * (Number(this.plan.rentdetails[17].rentUnitPrice))* (Number(this.plan.rentdetails[17].securityDeposit));
      this.plan.rentdetails[17].rentUnitPrice = this.numberFormat(this.plan.rentdetails[17].rentUnitPrice);
      // 20200519 E_Edit
      return Math.floor(ret);
    }    
  }
  //自販機　賃料
  cal59() {
    // 20200519 S_Edit
    this.plan.rentdetails[18].rentUnitPrice = this.removeComma(this.plan.rentdetails[18].rentUnitPrice);

    if(!isNullOrUndefined(this.plan.rentdetails[18].space) && !isNullOrUndefined(this.plan.rentdetails[18].rentUnitPrice)){
      let ret = Math.floor(Number(this.plan.rentdetails[18].space)) * (Number(this.plan.rentdetails[18].rentUnitPrice));
      this.plan.rentdetails[18].rentUnitPrice = this.numberFormat(this.plan.rentdetails[18].rentUnitPrice);
      // 20200519 E_Edit
      return Math.floor(ret);
    }    
  }
  
  

  //自販機　敷金
  cal60() {
    // 20200519 S_Edit
    this.plan.rentdetails[18].rentUnitPrice = this.removeComma(this.plan.rentdetails[18].rentUnitPrice);

    if(!isNullOrUndefined(this.plan.rentdetails[18].space) && !isNullOrUndefined(this.plan.rentdetails[18].rentUnitPrice) && !isNullOrUndefined(this.plan.rentdetails[18].securityDeposit)){
      let ret = ((this.getNumber(this.plan.rentdetails[18].space)))* this.getNumber(this.plan.rentdetails[18].rentUnitPrice) * this.getNumber(this.plan.rentdetails[18].securityDeposit);
      this.plan.rentdetails[18].rentUnitPrice = this.numberFormat(this.plan.rentdetails[18].rentUnitPrice);
      // 20200519 E_Edit
      return Math.floor(ret);
    }
  }

  //面積　合計
  cal61() {
    let ret = 0;
    let pos = 0;
    while(pos < 15){
      this.plan.rentdetails[pos].space = this.removeComma(this.plan.rentdetails[pos].space);
      ret =(this.getNumber(this.plan.rentdetails[pos].space))+ ret;
      pos++;
    }
    //ret = Math.floor(ret);
    //return this.numberFormat(ret);
    //ret = this.numberFormat(ret);
    return Math.floor(ret);
  }
  //賃料　合計
    //賃料　合計
    cal62() {
      let ret = 0;
      let pos = 0;

      while(pos < 15) {
        ret += this.cal51(pos);
        pos++;
      }
      ret += this.cal53();
      ret += this.cal55();
      ret += this.cal57();
      ret += this.cal59();
      return Math.floor(ret);
    }

  //敷金　合計
  cal63() {
    let ret = 0;
      let pos = 0;
      
      while(pos < 15) {
        ret += this.cal52(pos);
        pos++;
      }
      ret += this.cal54();
      ret += this.cal56();
      ret += this.cal58();
      ret += this.cal60();
      return Math.floor(ret);
    }
  //計算６４
  cal64() {
    let ret = this.cal62() * 12;
    return Math.floor(ret);
 
  }
  //計算６５
  cal65() {
    // 20200519 S_Edit
    this.plan.rent.commonFee = this.removeComma(this.plan.rent.commonFee); 

    if(!isNullOrUndefined(this.plan.rent.commonFee == null) && this.plan.totalUnits > 0){
      const cal65= Number(this.plan.rent.commonFee) * this.plan.totalUnits;
      this.plan.rent.commonFee = this.numberFormat(this.plan.rent.commonFee);
      return cal65;
    } else {
      this.plan.rent.commonFee = this.numberFormat(this.plan.rent.commonFee);
      // 20200519 E_Edit
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
    // 20200519 S_Edit
    this.plan.rent.monthlyOtherIncome = this.removeComma(this.plan.rent.monthlyOtherIncome); 
    let ret = Math.floor(Number(this.plan.rent.monthlyOtherIncome) * 12);
    this.plan.rent.monthlyOtherIncome = this.numberFormat(this.plan.rent.monthlyOtherIncome);
    // 20200519 E_Edit
    return Math.floor(ret);
  }


  //計算６８
  cal68() {
    // 20200519 S_Edit
    this.plan.rent.commonFee = this.removeComma(this.plan.rent.commonFee);
    this.plan.rent.monthlyOtherIncome = this.removeComma(this.plan.rent.monthlyOtherIncome); 

    let val62 = this.cal62() * 12 + this.getNumber(this.plan.rent.commonFee)*this.getNumber(this.plan.totalUnits)*12 + this.getNumber(this.plan.rent.monthlyOtherIncome) * 12;
    
    this.plan.rent.commonFee = this.numberFormat(this.plan.rent.commonFee);
    this.plan.rent.monthlyOtherIncome = this.numberFormat(this.plan.rent.monthlyOtherIncome);
    // 20200519 E_Edit
    
    return Math.floor(val62);
  }

  //計算６９
  cal69() {
    let cal69 = this.cal68() * this.getNumber(this.plan.rent.occupancyRate)/100;
    return Math.floor(cal69);
  }



//計算７０_S ＮＯＩ※(B)*(1-経費率）
cal70_1() {
    if(Number(this.cal69()) >0  && !isNullOrUndefined(this.plan.rent.expenseRatio1==null)){
      let ret = Math.floor(this.cal69() * ( 1- (this.getNumber(this.plan.rent.expenseRatio1)/100)));
      return Math.floor(ret);
    } else {
      return 0;
    }
}

cal70_2() {
  if(Number(this.cal69()) >0  && !isNullOrUndefined(this.plan.rent.expenseRatio2==null)){
    let ret = Math.floor(this.cal69() * ( 1- (this.getNumber(this.plan.rent.expenseRatio2)/100)));
    return Math.floor(ret);
  } else {
    return 0;
  }
}

cal70_3() {
  if(Number(this.cal69()) >0  && !isNullOrUndefined(this.plan.rent.expenseRatio3==null)){
    let ret = Math.floor(this.cal69() * ( 1- (this.getNumber(this.plan.rent.expenseRatio3)/100)));
    return Math.floor(ret);
  } else {
    return 0;
  }
}

cal70_4() {
  if(Number(this.cal69()) >0  && !isNullOrUndefined(this.plan.rent.expenseRatio4==null)){
    let ret = Math.floor(this.cal69() * ( 1- (this.getNumber(this.plan.rent.expenseRatio4)/100)));
    return Math.floor(ret);
  } else {
    return 0;
  }
}

//計算７１_S ＮＯＩ利回り※NOI/(A)

cal71_1() {
  if(Number(this.cal70_1()) > 0 || Number(this.plan.jvRatio) >0 ){
    let res = Math.floor(Number(this.cal70_1()) / (((this.cal49() -  this.cal46() - this.cal47()) * (Number(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47())*10000)/100;
    
    return (res);
  } else{
    return 0;
  }
}



cal71_2() {
  if(Number(this.cal70_2()) > 0 || Number(this.plan.jvRatio) >0 ){
    let res = Math.floor(Number(this.cal70_2()) / (((this.cal49() -  this.cal46() - this.cal47()) * (Number(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47())*10000)/100;
    
    return (res);
  } else{
    return 0;
  }
}

cal71_3() {
  if(Number(this.cal70_3()) > 0 || Number(this.plan.jvRatio) >0 ){
    let res = Math.floor(Number(this.cal70_3()) / (((this.cal49() -  this.cal46() - this.cal47()) * (Number(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47())*10000)/100;
    
    return (res);
  } else{
    return 0;
  }
}

cal71_4() {
  if(Number(this.cal70_4()) > 0 || Number(this.plan.jvRatio) >0 ){
    let res = Math.floor(Number(this.cal70_4()) / (((this.cal49() -  this.cal46() - this.cal47()) * (Number(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47())*10000)/100;
    
    return (res);
  } else {
    return 0;
  }
}

//計算７２_S 売上金利(D)※NOI/(C)
cal72_1() {
  if(!isNullOrUndefined(this.plan.rent.salesProfits) && this.plan.rent.salesProfits.length > 0){
    let ret = Math.floor(Number(this.cal70_1()) / (this.getNumber(this.plan.rent.salesProfits)/100));
    return Math.floor(ret);
  } else {
    return 0;
  }
}

cal72_2() {
  if(!isNullOrUndefined(this.plan.rent.salesProfits) && this.plan.rent.salesProfits.length > 0){
    let ret = Math.floor(Number(this.cal70_2()) / (this.getNumber(this.plan.rent.salesProfits)/100));
    return Math.floor(ret);
  } else {
    return 0;
  }
}

cal72_3() {
  if(!isNullOrUndefined(this.plan.rent.salesProfits) && this.plan.rent.salesProfits.length > 0){
    let ret = Math.floor(Number(this.cal70_3()) / (this.getNumber(this.plan.rent.salesProfits)/100));
    return Math.floor(ret);
  } else {
    return 0;
  }
}

cal72_4() {
  if(!isNullOrUndefined(this.plan.rent.salesProfits) && this.plan.rent.salesProfits.length > 0){
    let ret = Math.floor(Number(this.cal70_4()) / (this.getNumber(this.plan.rent.salesProfits)/100));
    return Math.floor(ret);
  } else {
    return 0;
  }
}
//計算７３_S 売却時利益(E)※(D)-(A)
cal73_1() {
  if(Number(this.cal72_1()) > 0  && Number(this.cal49()) > 0){
    let ret = Math.floor(Number(this.cal72_1()) - (((this.cal49() -  this.cal46() - this.cal47()) * (Number(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47()));
    return Math.floor(ret);
  } else {
    return 0;
  }
}

cal73_2() {
  if(Number(this.cal72_2()) > 0  && Number(this.cal49()) > 0){
    let ret = Math.floor(Number(this.cal72_2()) - (((this.cal49() -  this.cal46() - this.cal47()) * (Number(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47()));
    return Math.floor(ret);
  } else {
    return 0;
  }
}

cal73_3() {
  if(Number(this.cal72_3()) > 0  && Number(this.cal49()) > 0){
    let ret = Math.floor(Number(this.cal72_3()) - (((this.cal49() -  this.cal46() - this.cal47()) * (Number(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47()));
    return Math.floor(ret);
  } else {
    return 0;
  }
}

cal73_4() {
  if(Number(this.cal72_4()) > 0  && Number(this.cal49()) > 0){
    let ret = Math.floor(Number(this.cal72_4()) - (((this.cal49() -  this.cal46() - this.cal47()) * (Number(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47()));
    return Math.floor(ret);
  } else {
    return 0;
  }
}

//計算７４_S 利益率※(E)/(D)
cal74_1() {
  if(Number(this.cal72_1()) > 0 &&  Number(this.cal73_1()) > 0){
    let ret = Math.floor(this.cal73_1() / this.cal72_1() *10000)/100;
    return (ret);

  } else {
    return 0;
  }
}

cal74_2() {
  if(Number(this.cal72_2()) > 0 &&  Number(this.cal73_2()) > 0){
    let ret = Math.floor(this.cal73_2() / this.cal72_2() *10000)/100;
    return (ret);

  } else {
    return 0;
  }
}

cal74_3() {
  if(Number(this.cal72_3()) > 0 &&  Number(this.cal73_3()) > 0){
    let ret = Math.floor(this.cal73_3() / this.cal72_3() *10000)/100;
    return (ret);

  } else {
    return 0;
  }
}

cal74_4() {
  if(Number(this.cal72_4()) > 0 &&  Number(this.cal73_4()) > 0){
    let ret = Math.floor(this.cal73_4() / this.cal72_4() *10000)/100;
    return (ret);

  } else {
    return 0;
  }
}

//計算７７_S 売買計画　売却金額
cal77_1() {
  if(this.cal69() > 0 && Number(this.plan.rent.profitsA) > 0){
    let cal77_1 = this.cal69() / (this.getNumber(this.plan.rent.profitsA)/100);
    return Math.floor(cal77_1);
  } else {
    return 0 ; 
  }
}

cal77_2() {
  if(this.cal69() > 0 && Number(this.plan.rent.profitsB) > 0){
    let cal77_2 = this.cal69() / (this.getNumber(this.plan.rent.profitsB)/100);
    return Math.floor(cal77_2);
  } else {
    return 0 ; 
  }
}

cal77_3() {
  if(this.cal69() > 0 && Number(this.plan.rent.profitsC) > 0){
    let cal77_3 = this.cal69() / (this.getNumber(this.plan.rent.profitsC)/100);
    return Math.floor(cal77_3);
  } else {
    return 0 ; 
  }
}

cal77_4() {
  if(this.cal69() > 0 && Number(this.plan.rent.profitsD) > 0){
    let cal77_4 = this.cal69() / (this.getNumber(this.plan.rent.profitsD)/100);
    return Math.floor(cal77_4);
  } else {
    return 0 ; 
  }
}

//計算７９_S 売買計画　販売経費小計
cal79_1() {
  // 20200519 S_Add
  this.plan.rent.salesExpense1A = this.removeComma(this.plan.rent.salesExpense1A);
  this.plan.rent.salesExpense2A = this.removeComma(this.plan.rent.salesExpense2A);
  this.plan.rent.salesExpense3A = this.removeComma(this.plan.rent.salesExpense3A);

  let cal79_1 = (this.getNumber(this.plan.rent.salesExpense1A)) + (this.getNumber(this.plan.rent.salesExpense2A)) + (this.getNumber(this.plan.rent.salesExpense3A));
  
  this.plan.rent.salesExpense1A = this.numberFormat(this.plan.rent.salesExpense1A);
  this.plan.rent.salesExpense2A = this.numberFormat(this.plan.rent.salesExpense2A);
  this.plan.rent.salesExpense3A = this.numberFormat(this.plan.rent.salesExpense3A);
  // 20200519 E_Add
  return Math.floor(cal79_1);
}

cal79_2() {
  // 20200519 S_Add
  this.plan.rent.salesExpense1B = this.removeComma(this.plan.rent.salesExpense1B);
  this.plan.rent.salesExpense2B = this.removeComma(this.plan.rent.salesExpense2B);
  this.plan.rent.salesExpense3B = this.removeComma(this.plan.rent.salesExpense3B);

  let cal79_2 =  (this.getNumber(this.plan.rent.salesExpense1B)) + (this.getNumber(this.plan.rent.salesExpense2B)) + (this.getNumber(this.plan.rent.salesExpense3B));
  
  this.plan.rent.salesExpense1B = this.numberFormat(this.plan.rent.salesExpense1B);
  this.plan.rent.salesExpense2B = this.numberFormat(this.plan.rent.salesExpense2B);
  this.plan.rent.salesExpense3B = this.numberFormat(this.plan.rent.salesExpense3B);
  // 20200519 E_Add
  return Math.floor(cal79_2);
}

cal79_3() {
  // 20200519 S_Add
  this.plan.rent.salesExpense1C = this.removeComma(this.plan.rent.salesExpense1C);
  this.plan.rent.salesExpense2C = this.removeComma(this.plan.rent.salesExpense2C);
  this.plan.rent.salesExpense3C = this.removeComma(this.plan.rent.salesExpense3C);

  let cal79_3 =  (this.getNumber(this.plan.rent.salesExpense1C)) + (this.getNumber(this.plan.rent.salesExpense2C)) + (this.getNumber(this.plan.rent.salesExpense3C));
  
  this.plan.rent.salesExpense1C = this.numberFormat(this.plan.rent.salesExpense1C);
  this.plan.rent.salesExpense2C = this.numberFormat(this.plan.rent.salesExpense2C);
  this.plan.rent.salesExpense3C = this.numberFormat(this.plan.rent.salesExpense3C);
  // 20200519 E_Add
  return Math.floor(cal79_3);
}

cal79_4() {
  // 20200519 S_Add
  this.plan.rent.salesExpense1D = this.removeComma(this.plan.rent.salesExpense1D);
  this.plan.rent.salesExpense2D = this.removeComma(this.plan.rent.salesExpense2D);
  this.plan.rent.salesExpense3D = this.removeComma(this.plan.rent.salesExpense3D);

  let cal79_4 =  (this.getNumber(this.plan.rent.salesExpense1D)) + (this.getNumber(this.plan.rent.salesExpense2D)) + (this.getNumber(this.plan.rent.salesExpense3D));
  
  this.plan.rent.salesExpense1D = this.numberFormat(this.plan.rent.salesExpense1D);
  this.plan.rent.salesExpense2D = this.numberFormat(this.plan.rent.salesExpense2D);
  this.plan.rent.salesExpense3D = this.numberFormat(this.plan.rent.salesExpense3D);
  // 20200519 E_Add
  return Math.floor(cal79_4);
}

//計算８０_S 売買計画　利益
cal80_1() {
  if(this.cal77_1() > 0){
    let cal80_1 = this.cal77_1() - (((this.cal49() -  this.cal46() - this.cal47()) * (this.getNumber(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47()) - this.cal79_1();
    return Math.floor(cal80_1);
  }
}

cal80_2() {
  if(this.cal77_2() > 0){
    let cal80_2 = this.cal77_2() - (((this.cal49() -  this.cal46() - this.cal47()) * (this.getNumber(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47()) - this.cal79_2();
    return Math.floor(cal80_2);
  }
}

cal80_3() {
  if(this.cal77_3() > 0){
    let cal80_3 = this.cal77_3() - (((this.cal49() -  this.cal46() - this.cal47()) * (this.getNumber(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47()) - this.cal79_3();
    return Math.floor(cal80_3);
  }
}
cal80_4() {
  if(this.cal77_4() > 0){
    let cal80_4 = this.cal77_4() - (((this.cal49() -  this.cal46() - this.cal47()) * (this.getNumber(this.plan.jvRatio) / 100)) + this.cal46() + this.cal47()) - this.cal79_4();
    return Math.floor(cal80_4);
  }
}

//計算８１_S 売買計画　利益率
cal81_1() {
  //20200527 S_Add 利回りに値が入っていないときに0除算を起こさせないための修正
  if (this.cal77_1() == 0) {
    return 0;
  }
  //20200527 E_Add

  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
    let cal81_1 = Math.floor(this.cal80_1() / this.cal77_1()*10000)/100;
    return cal81_1;
  } else {
    return 0;
  }
}

cal81_2() {
  //20200527 S_Add 利回りに値が入っていないときに0除算を起こさせないための修正
  if (this.cal77_2() == 0) {
    return 0;
  }
  //20200527 E_Add

  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
    let cal81_2 = Math.floor(this.cal80_2() / this.cal77_2()*10000)/100;
    return cal81_2;
  } else {
    return 0;
  } 
}

cal81_3() {
  //20200527 S_Add 利回りに値が入っていないときに0除算を起こさせないための修正
  if (this.cal77_3() == 0) {
    return 0;
  }
  //20200527 E_Add

  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
    let cal81_3 =  Math.floor(this.cal80_3() / this.cal77_3()*10000)/100;
    return cal81_3;
  } else {
    return 0;
  }
}

cal81_4() {
  //20200527 S_Add 利回りに値が入っていないときに0除算を起こさせないための修正
  if (this.cal77_4() == 0) {
    return 0;
  }
  //20200527 E_Add

  if(this.getNumber(this.plan.rent.occupancyRate) > 0  &&  this.getNumber(this.plan.rent.salesProfits) > 0){
    let cal81_4 =  Math.floor(this.cal80_4() / this.cal77_4()*10000)/100;
    return cal81_4;
  } else {
    return 0;
  }
}

  // 20200518 S_Add
  numberFormat(val) {
    // 空の場合そのまま返却
    if (val == '' || val == null){
      return '';
    }
    // 全角から半角へ変換し、既にカンマが入力されていたら事前に削除
    val = val.replace(/,/g, "").trim();
    // 整数部分を3桁カンマ区切りへ
    val = Number(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return val;
  }

  removeComma(val) {
    if (val == '' || val == null){
      return '';
    } else {
      val = val.replace(/,/g, "").trim();
      return val;
    }
  }
  // 20200518 E_Add


}