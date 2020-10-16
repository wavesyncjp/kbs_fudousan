import { Component } from '@angular/core';
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
import { Planinfohistory } from '../models/Planinfohistory';
import { PlanHistoryCreateComponent } from '../planhistory-create/planhistory-create.component';
import { PlanHistoryListComponent } from '../planhistory-list/planhistory-list.component';
import { Converter } from '../utils/converter';

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
  //20200805 S_Add
  public cond = {
    tempLandInfoPid: null,
    notPlanPid: null,
    planPid:null
  };
  //20200805 E_Add

  public contract: Contractinfo;
  public data: Templandinfo;
  public pid: number;
  public tempLandInfoPid: number;//20200805 Add
  public bukkenid: number;
  public plan: Planinfo;
  public rent: Planrentroll;
  public planHistoryPid: number;
  plans: Planinfo[] = [];//20200805 Add
  planHistorys: Planinfohistory[] = [];

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
      this.tempLandInfoPid = params.tempLandInfoPid;//20200805 Add
      this.planHistoryPid =  params.planHistoryPid;//20200909 Add
    });

    this.data = new Templandinfo();
  }

  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('事業収支詳細');

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();
    this.plan = new Planinfo();
    this.plan.rent = new Planrentroll();

    const funcs = [];
    funcs.push(this.service.getCodes(['011', '016', '017', '018', '020']));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getEmps(null));
    funcs.push(this.service.getPaymentTypes(null));

    // 新規登録の場合
    if(this.bukkenid > 0) {
      // 物件情報取得
      funcs.push(this.service.getLand(this.bukkenid));
      // 事業収支一覧取得
      this.cond.tempLandInfoPid = this.bukkenid;
      funcs.push(this.service.searchPlanForGrid(this.cond));
    }
    // 詳細の場合
    else if(this.pid > 0) {
      // 事業収支取得
      funcs.push(this.service.getPlan(this.pid));
      // 事業収支一覧取得
      this.cond.tempLandInfoPid = this.tempLandInfoPid;
      this.cond.notPlanPid = this.pid;
      funcs.push(this.service.searchPlanForGrid(this.cond));
      // 事業収支履歴一覧取得
      this.cond.planPid = this.pid;
      funcs.push(this.service.searchPlanHistoryForGrid(this.cond));
    }
    // 履歴詳細の場合
    else if(this.planHistoryPid > 0) {
      // 事業収支履歴取得
      funcs.push(this.service.getPlanHistory(this.planHistoryPid));
    }

    Promise.all(funcs).then(values => {
      const codes = values[0] as Code[];
      if(codes !== null && codes.length > 0){
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a, b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }

      this.deps = values[1];    // 部署
      this.emps = values[2];    // 社員
      this.payTypes = values[3];// 支払種別

      // 支払種別（コンボ用）
      this.payTypeGroup1 = this.payTypes.filter(tp => { return tp.costFlg === '01' && tp.addFlg === '1' })
        .map(tp => new Code({ codeDetail: tp.paymentCode, name: tp.paymentName }));
      this.payTypeGroup2 = this.payTypes.filter(tp => { return tp.costFlg === '02' && tp.addFlg === '1' })
        .map(tp => new Code({ codeDetail: tp.paymentCode, name: tp.paymentName }));
      this.payTypeGroup3 = this.payTypes.filter(tp => { return tp.costFlg === '03' && tp.addFlg === '1' })
        .map(tp => new Code({ codeDetail: tp.paymentCode, name: tp.paymentName }));

      // データが存在する場合
      if(values.length > 4) {
        // 詳細もしくは、履歴詳細の場合
        if(this.pid > 0 || this.planHistoryPid > 0) {
          // this.planにはPlanもしくは、PlanHistoryを設定
          this.plan = new Planinfo(values[4] as Planinfo);
          // 物件情報を設定
          this.data = new Templandinfo(values[4].land as Templandinfo);
          delete this.plan['land'];
          // 詳細の場合
          if(this.pid > 0) {
            // 事業収支一覧設定
            this.plans = values[5];
            this.plans.forEach(me => {
              //20201016 S_Add
              me = this.getCost(me);
              //20201016 E_Add
              //me['pjCost'] = this.getPjCost(me);
            });
            
            if(values.length > 6) {
              // 事業収支履歴一覧設定
              this.planHistorys = values[6];
              this.planHistorys.forEach(me => {
                //20201016 S_Add
                me = this.getCost(me);
                //20201016 E_Add
                //me['pjCost'] = this.getPjCost(me);
              });
            }
          }
          // 履歴詳細の場合
          else if(this.planHistoryPid > 0) {
            // 履歴の値を設定
            this.plan.planHistoryPid = this.plan.pid;
            this.plan.pid = this.plan.planPid;
          }
        }
        // 新規登録の場合
        else {
          // 物件情報を設定
          this.data = new Templandinfo(values[4] as Templandinfo);
          // 事業収支を初期化
          this.plan = new Planinfo();
          this.plan.landLoanMap = "0";
          this.plan.buildLoanMap = "0";
          // 20201013 S_Add
          if(values.length > 5) {
            // 事業収支一覧設定
            this.plans = values[5];
            this.plans.forEach(me => {
              //20201016 S_Add
              me = this.getCost(me);
              //20201016 E_Add
              //me['pjCost'] = this.getPjCost(me);
            });
          }
          // 20201013 E_Add
        }
      }
      // 初期化
      if(this.plan.rent == null || !this.plan.rent) {
        this.plan.rent = new Planrentroll();
      }
      
      this.plan.convert();

      // 明細情報が存在しない場合
      if(this.plan.details == null || this.plan.details.length == 0){
        this.plan.details = [];
        const lst = ["1001", "1002", "1003", "1004", "1005", "", "", "", "", "", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008",
          "", "", "", "", "", "3001", "3002", "3003", "3004", "3005", "3006", "3007", "3008", "3009", "3010", "3011", "", "", "3012", "3013", "3014"];
        lst.forEach((code, index) => {
          let detail = new Plandetail();
          detail.paymentCode = code;
          detail.backNumber = index + 1;
          
          this.plan.details.push(detail);
        });
      }
      
      if(this.plan.rentdetails == null || this.plan.rentdetails.length == 0){
        this.plan.rentdetails = [];
        //targetArea="101"～ "115" //space="201"～ "219" //rentUnitPrice="301"～ "319" //securityDeposit="401"～ "419"
        const lst = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "駐車場", "駐輪場", "ﾊﾞｲｸ置き場", "自販機"];
        lst.forEach((code, index) => {
          let rentdetail = new Planrentrolldetail();
          rentdetail.targetArea = code;
          rentdetail.backNumber = index + 1;

          this.plan.rentdetails.push(rentdetail);
        });
      }
      this.spinner.hide();
    });
  }

  /**
   * 坪数計算
   */
  calTsubo(val) {
    let ret = 0;
    ret = this.getNumber(this.removeComma(val));
    if (ret > 0) {
      ret = Math.floor(ret * (0.3025 * 100)) / 100;
    }
    return ret;
  }

  /**
   * ・土地 取得時税金.取得税
   * ・土地 取得時税金.登録税
   */
  changeHang(val, val1) {
    let ret = 0;
    val = this.getNumber(this.removeComma(val));
    val1 = this.getNumber(this.removeComma(val1));
    if (val > 0 && val1 > 0) {
      ret = Math.floor(val * val1);
    }
    return ret;
  }

  /**
   * ・土地 取得時税金.取得税.単価・坪
   * ・土地 取得時税金.登録税.単価・坪
   */
  changeUnit (plan: Planinfo, val, val1) {
    let ret = 0;
    let totalArea = this.getNumber(this.removeComma(plan.totalAreaMap));
    val = this.getNumber(this.removeComma(val));
    val1 = this.getNumber(this.removeComma(val1));
    if (val > 0 && val1 > 0 && totalArea > 0) {
      ret = Math.floor(val * val1 / (totalArea * 0.3025));
    }
    return ret;
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
            // 20201013 S_Add
            this.plan = new Planinfo(res);
            this.plan.convert();
            // 20201013 E_Add
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

  /**
   * 帳票出力
   */
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
  changeValue(plan: Planinfo, name: string) {

    //路線価
    //敷地面積(売買)
    if(name === 'routePrice' || name === 'siteAreaBuy'){
      this.cal14(plan);
    }

    //【固定資産税(精算分)】.住宅用地の率
    //【固定資産税(精算分)】.土地評価額
    if(name === 'landEvaluation' || name === 'residentialRate'){
      this.cal15(plan);
      this.cal16(plan);
    }

    //【固定資産税(精算分)】.課税標準額(固定)
    if(name === 'taxation'){
      let taxation = this.getNumber(this.removeComma(plan.taxationMap));
      //固定資産税(土地)
      let fixedTaxLand = Math.floor(taxation * 0.014);
      plan.fixedTaxLandMap = this.numberFormat(fixedTaxLand);
      this.cal27(plan);// 20201013 Add
    }

    //【固定資産税(精算分)】.課税標準額(都市)
    if(name === 'taxationCity'){
      let taxationCity = this.getNumber(this.removeComma(plan.taxationCityMap));
      //都市計画税(土地)
      let cityPlanTaxLand = Math.floor(taxationCity * 0.03);
      plan.cityPlanTaxLandMap = this.numberFormat(cityPlanTaxLand);
      this.cal27(plan);// 20201013 Add
    }
    
    //【固定資産税(精算分)】.既存建物評価額
    if(name === 'buildValuation'){
      let buildValuation = this.getNumber(this.removeComma(plan.buildValuationMap));
      //固定資産税(建物)
      let fixedTaxBuild = Math.floor(buildValuation * 0.014);
      plan.fixedTaxBuildMap = this.numberFormat(fixedTaxBuild);
      //都市計画税(建物)
      let cityPlanTaxBuild = Math.floor(buildValuation * 0.03);
      plan.cityPlanTaxBuildMap = this.numberFormat(cityPlanTaxBuild);
      this.cal27(plan);// 20201013 Add
    }

    //敷地面積(売買)・課税標準額(固定)・土地評価額・住宅用地の率
    if(name === 'siteAreaBuy' || name === 'taxation' || name === 'landEvaluation' || name === 'residentialRate') {
      this.cal22(plan);
      this.cal23(plan);
    }

    //【土地固定資産税(取得後)】.課税標準額(固定)
    if(name === 'afterTaxation'){
      let afterTaxation = this.getNumber(this.removeComma(plan.afterTaxationMap));
      //【土地固定資産税(取得後)】.固定資産税
      let afterFixedTax = Math.floor(afterTaxation * 0.014);
      plan.afterFixedTaxMap = this.numberFormat(afterFixedTax);
    }

    //【土地固定資産税(取得後)】.課税標準額(都市)
    if(name === 'afterTaxationCity'){
      let afterTaxationCity = this.getNumber(this.removeComma(plan.afterTaxationCityMap));
      //【土地固定資産税(取得後)】.都市計画税
      let afterCityPlanTax = Math.floor(afterTaxationCity * 0.03);
      plan.afterCityPlanTaxMap = this.numberFormat(afterCityPlanTax);
    }

    //【固定資産税(精算分)】.固定資産税(土地)
    //【固定資産税(精算分)】.都市計画税(土地)
    //【固定資産税(精算分)】.固定資産税(建物)
    //【固定資産税(精算分)】.都市計画税(建物)
    //固都税精算金.負担日数
    if(name === 'fixedTaxLand' || name === 'cityPlanTaxLand' || name === 'fixedTaxBuild' || name === 'cityPlanTaxBuild' || name === 'burdenDays') {
      this.cal27(plan);
    }

    //建築費
    if(name === 'price10'){
      let val = this.getNumber(this.removeComma(plan.details[10].priceMap));
      if(val > 0){
        //設計料
        plan.details[11].priceMap = String(Math.floor(val * 0.03));
        this.changeValue(plan, 'price11');
        //建築予備費
        plan.details[13].priceMap = String(Math.floor(val * 0.02));
        this.changeValue(plan, 'price13');
      }
      plan.details[10].priceMap = this.numberFormat(plan.details[10].priceMap);
    }

    //建築延面積
    if(name === 'buildArea'){
      let buildArea = this.getNumber(this.removeComma(plan.buildAreaMap));
      //・建物 取得時税金.取得税評価額
      let valuation = this.getNumber(this.removeComma(plan.details[30].valuationMap));
      if(valuation > 0 || buildArea > 0){
        //・建物 取得時税金.取得税
        plan.details[30].priceMap = String(Math.floor(valuation * buildArea * 0.04));
        this.changeValueDetail(plan, 'price', 30);
        //・建物 取得時税金.登録税
        plan.details[31].priceMap = String(Math.floor(valuation * buildArea * 0.004));
        this.changeValueDetail(plan, 'price', 31);
      }
      plan.details[30].valuationMap = this.numberFormat(plan.details[30].valuationMap);
      plan.buildAreaMap = this.numberFormat(plan.buildAreaMap);
    }

    //竣工前地代.地代
    //保証金(解体費用).取得～竣工
    if(name === 'rent' || name === 'totalMonths'){
      this.cal41(plan);
    }

    //土地関係金利.融資金額
    //融資手数料.手数料率
    if(name === 'landLoan' || name === 'commissionRate'){
      this.cal43(plan);
    }

    //【固定資産税(精算分)】.土地評価額
    if(name === 'landEvaluation'){
      plan.landEvaluationMap = this.numberFormat(plan.landEvaluationMap);
    }
    //【固定資産税(精算分)】.課税標準額(固定)
    if(name === 'taxation'){
      plan.taxationMap = this.numberFormat(plan.taxationMap);
    }
    //【固定資産税(精算分)】.課税標準額(都市)
    if(name === 'taxationCity'){
      plan.taxationCityMap = this.numberFormat(plan.taxationCityMap);
    }
    //【固定資産税(精算分)】.既存建物評価額
    if(name === 'buildValuation'){
      plan.buildValuationMap = this.numberFormat(plan.buildValuationMap);
    }
    //【固定資産税(精算分)】.固定資産税(土地)
    if(name === 'fixedTaxLand'){
      plan.fixedTaxLandMap = this.numberFormat(plan.fixedTaxLandMap);
    }
    //【固定資産税(精算分)】.都市計画税(土地)
    if(name === 'cityPlanTaxLand'){
      plan.cityPlanTaxLandMap = this.numberFormat(plan.cityPlanTaxLandMap);
    }
    //【固定資産税(精算分)】.固定資産税(建物)
    if(name === 'fixedTaxBuild'){
      plan.fixedTaxBuildMap = this.numberFormat(plan.fixedTaxBuildMap);
    }
    //【固定資産税(精算分)】.都市計画税(建物)
    if(name === 'cityPlanTaxBuild'){
      plan.cityPlanTaxBuildMap = this.numberFormat(plan.cityPlanTaxBuildMap);
    }
    //【土地固定資産税(取得後)】.課税標準額(固定)
    if(name === 'afterTaxation'){
      plan.afterTaxationMap = this.numberFormat(plan.afterTaxationMap);
    }
    //【土地固定資産税(取得後)】.課税標準額(都市)
    if(name === 'afterTaxationCity'){
      plan.afterTaxationCityMap = this.numberFormat(plan.afterTaxationCityMap);
    }
    //【土地固定資産税(取得後)】.固定資産税
    if(name === 'afterFixedTax'){
      plan.afterFixedTaxMap = this.numberFormat(plan.afterFixedTaxMap);
    }
    //【土地固定資産税(取得後)】.都市計画税
    if(name === 'afterCityPlanTax'){
      plan.afterCityPlanTaxMap = this.numberFormat(plan.afterCityPlanTaxMap);
    }
    //売却金額.プラン1-A
    if(name === 'salesExpense1A'){
      plan.rent.salesExpense1AMap = this.numberFormat(plan.rent.salesExpense1AMap);
    }
    //売却金額.プラン1-B
    if(name === 'salesExpense1B'){
      plan.rent.salesExpense1BMap = this.numberFormat(plan.rent.salesExpense1BMap);
    }
    //売却金額.プラン1-C
    if(name === 'salesExpense1C'){
      plan.rent.salesExpense1CMap = this.numberFormat(plan.rent.salesExpense1CMap);
    }
    //売却金額.プラン1-D
    if(name === 'salesExpense1D'){
      plan.rent.salesExpense1DMap = this.numberFormat(plan.rent.salesExpense1DMap);
    }
    //売却金額.プラン2-A
    if(name === 'salesExpense2A'){
      plan.rent.salesExpense2AMap = this.numberFormat(plan.rent.salesExpense2AMap);
    }
    //売却金額.プラン2-B
    if(name === 'salesExpense2B'){
      plan.rent.salesExpense2BMap = this.numberFormat(plan.rent.salesExpense2BMap);
    }
    //売却金額.プラン2-C
    if(name === 'salesExpense2C'){
      plan.rent.salesExpense2CMap = this.numberFormat(plan.rent.salesExpense2CMap);
    }
    //売却金額.プラン2-D
    if(name === 'salesExpense2D'){
      plan.rent.salesExpense2DMap = this.numberFormat(plan.rent.salesExpense2DMap);
    }
    //売却金額.プラン3-A
    if(name === 'salesExpense3A'){
      plan.rent.salesExpense3AMap = this.numberFormat(plan.rent.salesExpense3AMap);
    }
    //売却金額.プラン3-B
    if(name === 'salesExpense3B'){
      plan.rent.salesExpense3BMap = this.numberFormat(plan.rent.salesExpense3BMap);
    }
    //売却金額.プラン3-C
    if(name === 'salesExpense3C'){
      plan.rent.salesExpense3CMap = this.numberFormat(plan.rent.salesExpense3CMap);
    }
    //売却金額.プラン3-D
    if(name === 'salesExpense3D'){
      plan.rent.salesExpense3DMap = this.numberFormat(plan.rent.salesExpense3DMap);
    }
    //簡易版.坪単価A
    if(name === 'tsuboUnitPriceA'){
      plan.rent.tsuboUnitPriceAMap = this.numberFormat(plan.rent.tsuboUnitPriceAMap);
    }
    //簡易版.坪単価B
    if(name === 'tsuboUnitPriceB'){
      plan.rent.tsuboUnitPriceBMap = this.numberFormat(plan.rent.tsuboUnitPriceBMap);
    }
    //簡易版.坪単価C
    if(name === 'tsuboUnitPriceC'){
      plan.rent.tsuboUnitPriceCMap = this.numberFormat(plan.rent.tsuboUnitPriceCMap);
    }
    //簡易版.坪単価D
    if(name === 'tsuboUnitPriceD'){
      plan.rent.tsuboUnitPriceDMap = this.numberFormat(plan.rent.tsuboUnitPriceDMap);
    }
    //土地関係金利.融資金額
    if(name === 'landLoan'){
      plan.landLoanMap = this.numberFormat(plan.landLoanMap);
    }
    //建物関係金利.融資金額
    if(name === 'buildLoan'){
      plan.buildLoanMap = this.numberFormat(plan.buildLoanMap);
    }
    //共益費(月間).共益費
    if(name === 'commonFee'){
      plan.rent.commonFeeMap = this.numberFormat(plan.rent.commonFeeMap);
    }
    //その他収入(月間)
    if(name === 'monthlyOtherIncome'){
      plan.rent.monthlyOtherIncomeMap = this.numberFormat(plan.rent.monthlyOtherIncomeMap);
    }
    //設計料
    if(name === 'price11'){
      plan.details[11].priceMap = this.numberFormat(plan.details[11].priceMap);
    }
    //建築予備費
    if(name === 'price13'){
      plan.details[13].priceMap = this.numberFormat(plan.details[13].priceMap);
    }
    //土地代.路線価
    if(name === 'routePrice'){
      plan.details[0].routePriceMap = this.numberFormat(plan.details[0].routePriceMap);
    }
    //敷地面積(売買)
    if(name === 'siteAreaBuy'){
      plan.siteAreaBuyMap = this.numberFormat(plan.siteAreaBuyMap);
    }
    //敷地面積(確認)
    if(name === 'siteAreaCheck'){
      plan.siteAreaCheckMap = this.numberFormat(plan.siteAreaCheckMap);
    }
    //建築延面積
    if(name === 'buildArea'){
      plan.buildAreaMap = this.numberFormat(plan.buildAreaMap);
    }
    //エントランス
    if(name === 'entrance'){
      plan.entranceMap = this.numberFormat(plan.entranceMap);
    }
    //駐車場面積
    if(name === 'parking'){
      plan.parkingMap = this.numberFormat(plan.parkingMap);
    }
    //地下面積
    if(name === 'underArea'){
      plan.underAreaMap = this.numberFormat(plan.underAreaMap);
    }
    //総専有面積
    if(name === 'totalArea'){
      plan.totalAreaMap = this.numberFormat(plan.totalAreaMap);
    }
    //販売専有面積
    if(name === 'salesArea'){
      plan.salesAreaMap = this.numberFormat(plan.salesAreaMap);
    }
  }

  /**
   * 値変更イベント（明細）
   * @param name 変更属性
   * @param pos 
  */
  changeValueDetail(plan: Planinfo, name: string, pos: number) {
    if(name === 'price'){
      plan.details[pos].priceMap = this.numberFormat(plan.details[pos].priceMap);
    }
    if(name === 'priceTax'){
      plan.details[pos].priceTaxMap = this.numberFormat(plan.details[pos].priceTaxMap);
    }
    if(name === 'unitPrice'){
      plan.details[pos].unitPriceMap = this.numberFormat(plan.details[pos].unitPriceMap);
    }
    if(name === 'rentUnitPrice'){
      plan.rentdetails[pos].rentUnitPriceMap = this.numberFormat(plan.rentdetails[pos].rentUnitPriceMap);
    }
    if(name === 'valuation'){
      plan.details[pos].valuationMap = this.numberFormat(plan.details[pos].valuationMap);
    }
  }
  
  /**
   * 消化容積
   */
  cal9(plan: Planinfo) {
    let ret: number;
    let buildArea = this.getNumber(this.removeComma(plan.buildAreaMap));
    let siteAreaCheck = this.getNumber(this.removeComma(plan.siteAreaCheckMap));

    if(buildArea > 0 && siteAreaCheck > 0){
      ret = Math.floor(10000 * (buildArea / siteAreaCheck)) / 100;
    } else {
      ret = 0;
    }
    return ret;
  }

  /**
   * レンタブル比
   */
  cal10(plan: Planinfo) {
    let ret: number;
    let buildArea = this.getNumber(this.removeComma(plan.buildAreaMap));
    let totalArea = this.getNumber(this.removeComma(plan.totalAreaMap));

    if(totalArea > 0 && buildArea > 0){
      ret = Math.floor((totalArea / buildArea) * 10000) / 100;
    } else {
      ret = 0;
    }
    return ret;
  }

  /**
   * 総専有面積／（建築遅延面積＋エントランス・内廊下部分
   */
  cal11(plan: Planinfo) {
    let ret: number;
    let buildArea = this.getNumber(this.removeComma(plan.buildAreaMap));
    let entrance = this.getNumber(this.removeComma(plan.entranceMap));
    let totalArea = this.getNumber(this.removeComma(plan.totalAreaMap));

    if(totalArea > 0 && (buildArea > 0 || entrance > 0)){
      ret = Math.floor((totalArea / (buildArea + entrance) * 10000)) / 100;
    } else {
      ret = 0;
    }
    return ret;
  }
  
  /**
   * 駐車合計台数
   */
  cal12(plan: Planinfo) {
    let ret: number;
    let parkingIndoor = this.getNumber(this.removeComma(plan.parkingIndoorMap));
    let parkingOutdoor = this.getNumber(this.removeComma(plan.parkingOutdoorMap));
    ret = parkingIndoor + parkingOutdoor;
    return ret;
  }
  
  /**
   * 駐車場設置率
   */
  cal13(plan: Planinfo){
    let ret: string | number;
    let buysellUnits = this.getNumber(this.removeComma(plan.buysellUnitsMap));
    if(this.cal12(plan) > 0 && buysellUnits > 0){
      ret = (Math.floor(this.cal12(plan) / buysellUnits * 10000) / 100).toFixed(2);
    } else {
      ret = 0;
    }
    return ret;
  }

  /**
   * 土地評価額
   */
  cal14(plan: Planinfo) {
    let routePrice = this.removeComma(plan.details[0].routePriceMap);
    let siteAreaBuy = this.removeComma(plan.siteAreaBuyMap);
    
    if(routePrice !== '' && siteAreaBuy !== ''){
      let landEvaluation = Math.floor(this.getNumber(routePrice) * this.getNumber(siteAreaBuy) * 7 / 8);
      plan.landEvaluationMap = this.numberFormat(landEvaluation);
      this.changeValue(plan, 'landEvaluation');
    }
  }

  /**
   * 課税標準額（固定）
   */
  cal15(plan: Planinfo) {
    let landEvaluation = this.getNumber(this.removeComma(plan.landEvaluationMap));
    let residentialRate = this.getNumber(this.removeComma(plan.residentialRate));

    if(landEvaluation > 0 && residentialRate > 0){
      let taxation = Math.floor(landEvaluation * 1 / 6 * residentialRate / 100 + landEvaluation * (1 - residentialRate / 100));
      plan.taxationMap = this.numberFormat(taxation);
      this.changeValue(plan, 'taxation');
    }
  }

  /**
   * 課税標準額（都市）
   */
  cal16(plan: Planinfo) {
    let landEvaluation = this.getNumber(this.removeComma(plan.landEvaluationMap));
    let residentialRate = this.getNumber(this.removeComma(plan.residentialRate));

    if(landEvaluation > 0 && residentialRate > 0){
      let taxationCity = Math.floor(landEvaluation * 1 / 3 * residentialRate / 100 + landEvaluation * (1 - residentialRate / 100));
      plan.taxationCityMap = this.numberFormat(taxationCity);
      this.changeValue(plan, 'taxationCity');
    }
  }

  /**
   * 精算分固都税年額
   */
  cal21(plan: Planinfo) {
    let ret: string | number;
    let fixedTaxLand = this.getNumber(this.removeComma(plan.fixedTaxLandMap));
    let cityPlanTaxLand = this.getNumber(this.removeComma(plan.cityPlanTaxLandMap));
    let fixedTaxBuild = this.getNumber(this.removeComma(plan.fixedTaxBuildMap));
    let cityPlanTaxBuild = this.getNumber(this.removeComma(plan.cityPlanTaxBuildMap));
    
    if(fixedTaxLand > 0 || cityPlanTaxLand > 0 || fixedTaxBuild > 0 || cityPlanTaxBuild > 0){
      ret = fixedTaxLand + cityPlanTaxLand + fixedTaxBuild + cityPlanTaxBuild;
    } else {
      ret = '';
    }
    return ret;
  }

  /**
   * 取得後課税標準額（固定）
   */
  cal22(plan: Planinfo) {
    let taxation = this.getNumber(this.removeComma(plan.taxationMap));
    let landEvaluation = this.getNumber(this.removeComma(plan.landEvaluationMap));
    let siteAreaBuy = this.getNumber(this.removeComma(plan.siteAreaBuyMap));
    let residentialRate = this.getNumber(this.removeComma(plan.residentialRate));

    let afterTaxation = 0;
    if(siteAreaBuy <= 200){
      afterTaxation = taxation;
    } else {
      afterTaxation = Math.floor(landEvaluation / siteAreaBuy * (siteAreaBuy - 100) * 1 / 3 + landEvaluation * (1 - residentialRate / 100));
    }

    if(afterTaxation != 0){
      plan.afterTaxationMap = this.numberFormat(afterTaxation);
    }
    this.changeValue(plan, 'afterTaxation');
  }

  /**
   * 取得後課税標準額（都市）
   */
  cal23(plan: Planinfo) {
    let taxation = this.getNumber(this.removeComma(plan.taxationMap));
    let landEvaluation = this.getNumber(this.removeComma(plan.landEvaluationMap));
    let siteAreaBuy = this.getNumber(this.removeComma(plan.siteAreaBuyMap));
    let residentialRate = this.getNumber(this.removeComma(plan.residentialRate));

    let afterTaxationCity = 0;
    if(siteAreaBuy <= 200){
      afterTaxationCity = taxation;
    } else {
      afterTaxationCity = Math.floor(landEvaluation / siteAreaBuy * (siteAreaBuy - 100) * 2 / 3 + landEvaluation * (1 - residentialRate / 100));
    }

    if(afterTaxationCity != 0) {
      plan.afterTaxationCityMap = this.numberFormat(afterTaxationCity);
    }
    this.changeValue(plan, 'afterTaxationCity');
  }

  /**
   * 取得後固都税年額
   */
  cal26(plan: Planinfo) {
    let ret: number;
    let afterFixedTax = this.getNumber(this.removeComma(plan.afterFixedTaxMap));
    let afterCityPlanTax = this.getNumber(this.removeComma(plan.afterCityPlanTaxMap));

    if(afterFixedTax > 0 || afterCityPlanTax > 0){
      ret = afterFixedTax + afterCityPlanTax;
    } else {
      ret = 0;
    }
    return ret;
  }
  
  /**
   * 固都税精算金
   */
  cal27(plan: Planinfo) {
    let fixedTaxLand = this.getNumber(this.removeComma(plan.fixedTaxLandMap));
    let cityPlanTaxLand = this.getNumber(this.removeComma(plan.cityPlanTaxLandMap));
    let fixedTaxBuild = this.getNumber(this.removeComma(plan.fixedTaxBuildMap));
    let cityPlanTaxBuild = this.getNumber(this.removeComma(plan.cityPlanTaxBuildMap));
    let burdenDays = this.getNumber(this.removeComma(plan.details[4].burdenDaysMap));

    let price = 0;
    if(fixedTaxLand > 0 || cityPlanTaxLand > 0 || fixedTaxBuild > 0 || cityPlanTaxBuild > 0 || burdenDays > 0){
      price = Math.floor((fixedTaxLand + cityPlanTaxLand + fixedTaxBuild + cityPlanTaxBuild) / 365 * burdenDays);
    }
    plan.details[4].priceMap = this.numberFormat(price);
  }

  /**
   * 土地原価.その他合計
   * 土地原価合計
   * 建物原価.近隣保障費等
   * 建物原価.その他合計
   * 建物原価合計
   * その他費用.その他合計
   */
  total(plan: Planinfo, from: number, to: number)
  {
    let ret = 0;
    for (let i = from; i <= to; i++) {
      let price = this.getNumber(this.removeComma(plan.details[i].priceMap));
      ret += price;
    }
    return Math.floor(ret);
  }

  /**
   * その他費用.土地固都税.金額(税抜)
   */
  cal35(plan: Planinfo) {
    let afterFixedTax = this.getNumber(this.removeComma(plan.afterFixedTaxMap));
    let afterCityPlanTax = this.getNumber(this.removeComma(plan.afterCityPlanTaxMap));
    let complePriceMonth = this.getNumber(this.removeComma(plan.details[23].complePriceMonthMap));

    let price = 0;
    if(afterFixedTax > 0 && afterCityPlanTax > 0 && complePriceMonth > 0){
      price = Math.floor((afterFixedTax + afterCityPlanTax) / 12 * complePriceMonth);
    }
    plan.details[23].priceMap = this.numberFormat(price);
  }

  /**
   * その他費用.既存建物関係費.固都税.金額(税抜)
   */
  cal36(plan: Planinfo) {
    let fixedTaxBuild = this.getNumber(this.removeComma(plan.fixedTaxBuildMap));
    let cityPlanTaxBuild = this.getNumber(this.removeComma(plan.cityPlanTaxBuildMap));
    let dismantlingMonth = this.getNumber(this.removeComma(plan.details[24].dismantlingMonthMap));

    let price = 0;
    if(fixedTaxBuild > 0 && cityPlanTaxBuild > 0 && dismantlingMonth > 0){
      price = Math.floor((fixedTaxBuild + cityPlanTaxBuild) / 12 * dismantlingMonth);
    }
    plan.details[24].priceMap = this.numberFormat(price);
  }

  /**
   * その他費用.既存建物関係費.取得税
   * その他費用.既存建物関係費.登録免許税
   */
  cal37(plan: Planinfo, num: number) {
    let ret = 0;
    let buildValuation = this.getNumber(this.removeComma(plan.buildValuationMap));
    
    if(buildValuation > 0){
      ret = Math.floor(buildValuation * num);
    }
    return ret;
  }

  /**
   * 竣工前地代.地代
   * 保証金(解体費用).取得～竣工
   */
  cal41(plan: Planinfo) {
    let rent = this.removeComma(plan.details[32].rentMap);
    let totalMonths = this.removeComma(plan.details[33].totalMonthsMap);
    
    let price = 0;
    if(rent !== '' && totalMonths !== ''){
      price = this.getNumber(rent) * this.getNumber(totalMonths);
    }
    plan.details[32].priceMap = this.numberFormat(price);
    plan.details[32].rentMap = this.numberFormat(rent);
  }

  /**
   * 融資手数料
   */
  cal43(plan: Planinfo) {
    let landLoan = this.removeComma(plan.landLoanMap);
    let commissionRate = this.removeComma(plan.details[36].commissionRateMap);

    let price = 0;
    if(landLoan !== '' && commissionRate !== ''){
      price = Math.floor(this.getNumber(landLoan) * this.getNumber(commissionRate) / 100);
    }
    plan.details[36].priceMap = this.numberFormat(price);
  }

  /**
   * 抵当権設定費用
   */
  cal44(plan: Planinfo) {
    let landLoan = this.removeComma(plan.landLoanMap);

    if(landLoan !== ''){
      let price = Math.floor(this.getNumber(landLoan) * 0.004);
      plan.details[37].priceMap = this.numberFormat(price);
    }
  }

  /**
   * その他費用合計
   */
  cal45(plan: Planinfo) {
    let ret = this.total(plan, 23, 38) + this.cal37(plan, 0.03) + this.cal37(plan, 0.02) + this.changeHang(plan.taxationMap, 0.015) + this.changeHang(plan.taxationMap, 0.02);
    return Math.floor(ret);
  }

  /**
   * 土地関係金利
   */
  cal46(plan: Planinfo) {
    let ret = 0;
    let landLoan = this.getNumber(this.removeComma(plan.landLoanMap));
    let landInterest = this.getNumber(this.removeComma(plan.landInterestMap));
    let landPeriod = this.getNumber(this.removeComma(plan.landPeriodMap));

    if(landLoan > 0 && landInterest > 0 && landPeriod > 0){
      ret = landLoan * landInterest / 12 * landPeriod / 100;
    }
    return Math.floor(ret);
  }

  /**
   * 建物関係金利
   */
  cal47(plan: Planinfo) {
    let ret = 0;
    let buildLoan = this.getNumber(this.removeComma(plan.buildLoanMap));
    let buildInterest = this.getNumber(this.removeComma(plan.buildInterestMap));
    let buildPeriod = this.getNumber(this.removeComma(plan.buildPeriodMap));

    if(buildLoan > 0 && buildInterest > 0 && buildPeriod > 0){
      ret = buildLoan * buildInterest / 12 * buildPeriod / 100;
    }
    return Math.floor(ret);
  }

  /**
   * 金利合計
   */
  cal48(plan: Planinfo) {
    let ret = this.cal46(plan) + this.cal47(plan);
    return Math.floor(ret);
  }
  
  /**
   * PJ原価
   */
  cal49(plan: Planinfo) {
    let ret = this.total(plan, 0, 22) + this.cal45(plan) + this.cal48(plan);
    return Math.floor(ret);
  }

  /**
   * 単価・坪
   */
  cal50(plan: Planinfo, pos: number) {
    let ret = 0;
    let price = this.getNumber(this.removeComma(plan.details[pos].priceMap));
    let totalArea = this.getNumber(this.removeComma(plan.totalAreaMap));
    if(price > 0 && totalArea > 0){
      ret = Math.floor(price / ((Math.floor(totalArea * (0.3025 * 100))) / 100));
    }
    return ret;
  }

  /**
   * 賃料
   */
  cal51(plan: Planinfo, pos: number) {
    let ret = 0;
    let space = this.getNumber(this.removeComma(plan.rentdetails[pos].spaceMap));
    let rentUnitPrice = this.getNumber(this.removeComma(plan.rentdetails[pos].rentUnitPriceMap));
    
    if(space > 0 && rentUnitPrice > 0){
      ret = Math.floor(space * (0.3025 * 100)) / 100;
      ret = Math.floor(rentUnitPrice) * ret;
    }
    return Math.floor(ret);
  }

  /**
   * 敷金
   */
  cal52(plan: Planinfo, pos: number) {
    let ret = 0;
    let space = this.getNumber(this.removeComma(plan.rentdetails[pos].spaceMap));
    let rentUnitPrice = this.getNumber(this.removeComma(plan.rentdetails[pos].rentUnitPriceMap));
    let securityDeposit = this.getNumber(this.removeComma(plan.rentdetails[pos].securityDepositMap));
    
    if(space > 0 && rentUnitPrice > 0 && securityDeposit > 0){
      ret = Math.floor(space * (0.3025 * 100)) / 100;
      ret = rentUnitPrice * securityDeposit * ret;
    }
    return Math.floor(ret);
  }

  /**
   * 駐車場 台数
   */
  cal53_1(plan: Planinfo){
    let ret = 0;
    let parkingIndoor = this.getNumber(this.removeComma(plan.parkingIndoorMap));
    if(parkingIndoor > 0){
      ret = Math.floor(parkingIndoor);
    }
    plan.rentdetails[15].spaceMap = this.numberFormat(ret);
    return ret;
  }
  
  /**
   * 駐車場.賃料
   * 駐輪場.賃料
   * バイク置き場.賃料
   * 自販機.賃料
   */
  cal53(plan: Planinfo, pos: number) {
    let ret = 0;
    let space = this.getNumber(this.removeComma(plan.rentdetails[pos].spaceMap));
    let rentUnitPrice = this.getNumber(this.removeComma(plan.rentdetails[pos].rentUnitPriceMap));

    if(space > 0 && rentUnitPrice > 0){
      ret = Math.floor(space) * rentUnitPrice;
    }
    return Math.floor(ret);
  }
  
  /**
   * 駐車場.敷金
   * 駐輪場.敷金
   * バイク置き場.敷金
   * 自販機.敷金
   */
  cal54(plan: Planinfo, pos: number) {
    let ret = 0;
    let space = this.getNumber(this.removeComma(plan.rentdetails[pos].spaceMap));
    let rentUnitPrice = this.getNumber(this.removeComma(plan.rentdetails[pos].rentUnitPriceMap));
    let securityDeposit = this.getNumber(this.removeComma(plan.rentdetails[pos].securityDepositMap));

    if(space > 0 && rentUnitPrice > 0 && securityDeposit > 0){
      ret = Math.floor(space) * rentUnitPrice * securityDeposit;
    }
    return Math.floor(ret);
  }

  /**
   * 面積.合計
   */
  cal61(plan: Planinfo) {
    let ret = 0;

    let pos = 0;
    while(pos < 15){
      let space = this.getNumber(this.removeComma(plan.rentdetails[pos].spaceMap));
      ret += space;
      pos++;
    }
    return Math.floor(ret);
  }
  
  /**
   * 賃料.合計
   */
  cal62(plan: Planinfo) {
    let ret = 0;

    let pos = 0;
    while(pos < 15) {
      ret += this.cal51(plan, pos);
      pos++;
    }
    for (let i = 15; i <= 18; i++) {
      ret += this.cal53(plan, i);
    }
    return Math.floor(ret);
  }

  /**
   * 敷金.合計
   */
  cal63(plan: Planinfo) {
    let ret = 0;

    let pos = 0;
    while(pos < 15) {
      ret += this.cal52(plan,pos);
      pos++;
    }
    for (let i = 15; i <= 18; i++) {
      ret += this.cal54(plan, i);
    }
    return Math.floor(ret);
  }

  /**
   * 年間賃料
   */
  cal64(plan: Planinfo) {
    let ret = this.cal62(plan) * 12;
    return Math.floor(ret);
  }

  /**
   * 共益費(月間)
   */
  cal65(plan: Planinfo) {
    let ret = 0;
    let commonFee = this.getNumber(this.removeComma(plan.rent.commonFeeMap));
    let totalUnits = this.getNumber(this.removeComma(plan.totalUnitsMap));

    if(commonFee > 0 && totalUnits > 0){
      ret = commonFee * totalUnits;
    }
    return ret;
  }

  /**
   * 共益費(年間)
   */
  cal66(plan: Planinfo) {
    let ret = this.cal65(plan) * 12;
    return Math.floor(ret);
  }

  /**
   * その他収入(年間)
   */
  cal67(plan: Planinfo) {
    let ret = 0;
    let monthlyOtherIncome = this.getNumber(this.removeComma(plan.rent.monthlyOtherIncomeMap)); 
    ret = Math.floor(monthlyOtherIncome * 12);
    return ret;
  }

  /**
   * 年間(税込み)
   */
  cal68(plan: Planinfo) {
    let ret = 0;
    let commonFee = this.getNumber(this.removeComma(plan.rent.commonFeeMap));
    let totalUnits = this.getNumber(this.removeComma(plan.totalUnitsMap));
    let monthlyOtherIncome = this.getNumber(this.removeComma(plan.rent.monthlyOtherIncomeMap));
    
    ret = this.cal62(plan) * 12 + commonFee * totalUnits * 12 + monthlyOtherIncome * 12;
    return Math.floor(ret);
  }

  /**
   * 年間収入(B)
   */
  cal69(plan: Planinfo) {
    let ret = this.cal68(plan) * this.getNumber(this.removeComma(plan.rent.occupancyRate)) / 100;
    return Math.floor(ret);
  }

  /**
   * NOI※(B)*(1-経費率)
   */
  cal70(plan: Planinfo, name: string) {
    let ret = 0;
    if(name === '1') ret = this.getNumber(this.removeComma(plan.rent.expenseRatio1));
    else if(name === '2') ret = this.getNumber(this.removeComma(plan.rent.expenseRatio2));
    else if(name === '3') ret = this.getNumber(this.removeComma(plan.rent.expenseRatio3));
    else if(name === '4') ret = this.getNumber(this.removeComma(plan.rent.expenseRatio4));

    if(this.cal69(plan) > 0 && ret > 0){
      ret = Math.floor(this.cal69(plan) * (1 - (ret / 100)));
    }
    return ret;
  }

  /**
   * NOI利回り(%)※NOI/(A)
   */
  cal71(plan: Planinfo, name: string) {
    let ret = 0;
    let jvRatio = this.getNumber(this.removeComma(plan.jvRatio));
//    if(this.cal70(plan, name) > 0 || jvRatio > 0){
    if((((this.cal49(plan) - this.cal46(plan) - this.cal47(plan)) * (jvRatio / 100)) + this.cal46(plan) + this.cal47(plan)) > 0){
      ret = Math.floor(this.cal70(plan, name) / (((this.cal49(plan) - this.cal46(plan) - this.cal47(plan)) * (jvRatio / 100)) + this.cal46(plan) + this.cal47(plan)) * 10000) / 100;
    }
    return ret;
  }

  /**
   * 売上金利(D)※NOI/(C)
   */
  cal72(plan: Planinfo, name: string) {
    let ret = 0;
    let salesProfits = this.getNumber(this.removeComma(plan.rent.salesProfits));

    if(salesProfits > 0)
    {
      ret = Math.floor(Number(this.cal70(plan, name)) / (salesProfits / 100));
    }
    return ret;
  }

  /**
   * 売却時利益(E)<br>※(D)-(A)
   */
  cal73(plan: Planinfo, name: string) {
    let ret = 0;
    let jvRatio = this.getNumber(this.removeComma(plan.jvRatio));
    if(this.cal72(plan, name) > 0  && this.cal49(plan) > 0 && jvRatio > 0){
      ret = this.cal72(plan, name) - (Math.floor((this.cal49(plan) - this.cal46(plan) - this.cal47(plan)) * (jvRatio / 100)) + this.cal46(plan) + this.cal47(plan));
    }
    return ret;
  }

  /**
   * 利益率(%)<br>※(E)/(D)
   */
  cal74(plan: Planinfo, name: string) {
    let ret = 0;
    if(this.cal72(plan, name) > 0 && this.cal73(plan, name) > 0){
      ret = Math.floor(this.cal73(plan, name) / this.cal72(plan, name) * 10000) / 100;
    }
    return ret;
  }

  /**
   * 売却金額
   */
  cal77(plan: Planinfo, name: string) {
    let ret = 0;
    if(name === 'A') ret = this.getNumber(this.removeComma(plan.rent.profitsA));
    else if(name === 'B') ret = this.getNumber(this.removeComma(plan.rent.profitsB));
    else if(name === 'C') ret = this.getNumber(this.removeComma(plan.rent.profitsC));
    else if(name === 'D') ret = this.getNumber(this.removeComma(plan.rent.profitsD));

    if(this.cal69(plan) > 0 && ret > 0){
      ret = Math.floor(this.cal69(plan) / (ret / 100));
    }
    return ret;
  }

  /**
   * 販売経費小計
   */
  cal79(plan: Planinfo, name: string) {
    let ret = 0;
    if(name === 'A'){
      ret = this.getNumber(this.removeComma(plan.rent.salesExpense1AMap))
              + this.getNumber(this.removeComma(plan.rent.salesExpense2AMap))
              + this.getNumber(this.removeComma(plan.rent.salesExpense3AMap));
    } else if(name === 'B'){
      ret = this.getNumber(this.removeComma(plan.rent.salesExpense1BMap))
              + this.getNumber(this.removeComma(plan.rent.salesExpense2BMap))
              + this.getNumber(this.removeComma(plan.rent.salesExpense3BMap));
    } else if(name === 'C'){
      ret = this.getNumber(this.removeComma(plan.rent.salesExpense1CMap))
              + this.getNumber(this.removeComma(plan.rent.salesExpense2CMap))
              + this.getNumber(this.removeComma(plan.rent.salesExpense3CMap));
    } else if(name === 'D'){
      ret = this.getNumber(this.removeComma(plan.rent.salesExpense1DMap))
              + this.getNumber(this.removeComma(plan.rent.salesExpense2DMap))
              + this.getNumber(this.removeComma(plan.rent.salesExpense3DMap));
    }
    return Math.floor(ret);
  }

  /**
   * 利益
   */
  cal80(plan: Planinfo, name: string) {
    let ret = 0;
    let jvRatio = this.getNumber(this.removeComma(plan.jvRatio));
    if(this.cal77(plan, name) > 0){
      ret = this.cal77(plan, name) - (Math.floor((this.cal49(plan) - this.cal46(plan) - this.cal47(plan)) * (jvRatio / 100)) + this.cal46(plan) + this.cal47(plan)) - this.cal79(plan, name);
    }
    return ret;
  }

  /**
   * 利益率(%)
   */
  cal81(plan: Planinfo, name: string) {
    let ret = 0;
    let occupancyRate = this.getNumber(this.removeComma(plan.rent.occupancyRate));
    let salesProfits = this.getNumber(this.removeComma(plan.rent.salesProfits));

    if(this.cal77(plan, name) > 0) {
      if(occupancyRate > 0 && salesProfits > 0){
        ret = Math.floor((this.cal80(plan, name) / this.cal77(plan, name)) * 10000) / 100;
      }
    }
    return ret;
  }
  // 20200910
  createHistory(plan: Planinfo) {
    //plan.planHistoryPid = null;//20200929 Add
    plan.planHistoryName = '';//20200929 Add
    const dialogRef = this.dialog.open(PlanHistoryCreateComponent, {
      width: '40%',
      height: '300px',
      data: plan
      
    });
    //20200925 S_Add
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isSave) {
        this.planHistorys.push(result.data);
        //20200930 S_Add
        this.planHistorys.forEach(me => {
          //20201016 S_Add
          me = this.getCost(me);
          //20201016 E_Add
          //me['pjCost'] = this.getPjCost(me);
        });
        this.sortPlanHistorys(this.planHistorys);
        //20200930 E_Add
      }
    });
    //20200925 E_Add
  }

  // 20201013 S_Update
  /*
  historyList(plan: Planinfo) {
    this.dialog.open(PlanHistoryListComponent,{
      width: '70%',
      height: '100%',
      data: plan
    });
  }
  */
  /**
   * 履歴照会ボタン
   */
  showPlanHistoryList(row: Planinfo) {
    this.router.navigate(['/planhistorylist'], {queryParams: {pid: row.pid, tempLandInfoPid: row.tempLandInfoPid}});
  }
  
  //20200817 S_Edd
  /**
   * 事業収支詳細ボタン
   */
  showPlan(row: Planinfo) {
  //20200820 S_Update
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/plandetail'], {queryParams: {pid: row.pid, tempLandInfoPid: row.tempLandInfoPid}});
    //20200820 E_Update
  }

  //20200909 S_Edd
  /**
   * 履歴詳細ボタン
   */
  showPlanHistory(row: Planinfohistory) {
    //20200820 S_Update
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/plandetail'], {queryParams: {planHistoryPid:row.pid}});
    //20200909 E_Update
  }

  /**
   * 戻るボタン
   */
  backPlan(row: Planinfo) {
    this.router.navigate(['/plandetail'], {queryParams: {pid:row.planPid,tempLandInfoPid: row.tempLandInfoPid}});
  }

  //20201016 S_Delete
  /**
   * PJ原価（グリッド用）
   */
  /*
  getPjCost(plan: any) {
    let ret = 0;

    //ret = this.cal29() + this.cal34() + this.cal45() + this.cal46() + this.cal47();
    
    for (let i = 0; i <= 38; i++) {
      let price = this.getNumber(this.removeComma(plan.details[i].price));
      ret += price;
    }
    ret += this.changeHang(plan.taxation, 0.015) + this.changeHang(plan.taxation, 0.02);

    let buildValuation = this.getNumber(this.removeComma(plan.buildValuation));
    
    if(buildValuation > 0){
      ret += Math.floor(buildValuation * 0.03);
      ret += Math.floor(buildValuation * 0.02);
    }

    let landLoan = this.getNumber(this.removeComma(plan.landLoan));
    let landInterest = this.getNumber(this.removeComma(plan.landInterest));
    let landPeriod = this.getNumber(this.removeComma(plan.landPeriod));

    if(landLoan > 0 && landInterest > 0 && landPeriod > 0){
      ret += landLoan * landInterest / 12 * landPeriod / 100;
    }

    let buildLoan = this.getNumber(this.removeComma(plan.buildLoan));
    let buildInterest = this.getNumber(this.removeComma(plan.buildInterest));
    let buildPeriod = this.getNumber(this.removeComma(plan.buildPeriod));

    if(buildLoan > 0 && buildInterest > 0 && buildPeriod > 0){
      ret += buildLoan * buildInterest / 12 * buildPeriod / 100;
    }

    return Math.floor(ret);
  }
  */
  //20201016 E_Delete
  //20201016 S_Add
  /**
   * 原価合計取得（グリッド用）
   */
  getCost(param: any) {
    let plan = new Planinfo(param);
    plan.convert();
    param['landCost'] = this.total(plan, 0, 9);
    param['buildingCost'] = this.total(plan, 10, 22);
    param['otherCost'] = this.cal45(plan);
    param['pjCost'] = this.cal49(plan);
    return param;
  }
  //20201016 E_Add

  //20200930 S_Add
  /**
   * 履歴一覧ソート
   */
  sortPlanHistorys(planHistorys : Planinfohistory[]) {
    planHistorys.sort((a,b) => {
      let id1 = a.pid;
      let id2 = b.pid;

      if(a.pid !== null){
        id1 = Number(a.pid);
      }
      if(b.pid !== null){
        id2 = Number(b.pid);
      }
      
      return id2 - id1;
    });
  }
  //20200930 E_Add
}
