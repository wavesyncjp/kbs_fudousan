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
              me['pjCost'] = this.getPjCost(me);
            });
            
            if(values.length > 6) {
              // 事業収支履歴一覧設定
              this.planHistorys = values[6];
              this.planHistorys.forEach(me => {
                me['pjCost'] = this.getPjCost(me);
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
              me['pjCost'] = this.getPjCost(me);
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
  changeUnit (val, val1) {
    let ret = 0;
    let totalArea = this.getNumber(this.removeComma(this.plan.totalAreaMap));
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
  changeValue(name: string) {

    //路線価
    //敷地面積(売買)
    if(name === 'routePrice' || name === 'siteAreaBuy'){
      this.cal14();
    }

    //【固定資産税(精算分)】.住宅用地の率
    //【固定資産税(精算分)】.土地評価額
    if(name === 'landEvaluation' || name === 'residentialRate'){
      this.cal15();
      this.cal16();
    }

    //【固定資産税(精算分)】.課税標準額(固定)
    if(name === 'taxation'){
      let taxation = this.getNumber(this.removeComma(this.plan.taxationMap));
      //固定資産税(土地)
      let fixedTaxLand = Math.floor(taxation * 0.014);
      this.plan.fixedTaxLandMap = this.numberFormat(fixedTaxLand);
      this.cal27();// 20201013 Add
    }

    //【固定資産税(精算分)】.課税標準額(都市)
    if(name === 'taxationCity'){
      let taxationCity = this.getNumber(this.removeComma(this.plan.taxationCityMap));
      //都市計画税(土地)
      let cityPlanTaxLand = Math.floor(taxationCity * 0.03);
      this.plan.cityPlanTaxLandMap = this.numberFormat(cityPlanTaxLand);
      this.cal27();// 20201013 Add
    }
    
    //【固定資産税(精算分)】.既存建物評価額
    if(name === 'buildValuation'){
      let buildValuation = this.getNumber(this.removeComma(this.plan.buildValuationMap));
      //固定資産税(建物)
      let fixedTaxBuild = Math.floor(buildValuation * 0.014);
      this.plan.fixedTaxBuildMap = this.numberFormat(fixedTaxBuild);
      //都市計画税(建物)
      let cityPlanTaxBuild = Math.floor(buildValuation * 0.03);
      this.plan.cityPlanTaxBuildMap = this.numberFormat(cityPlanTaxBuild);
      this.cal27();// 20201013 Add
    }

    //敷地面積(売買)・課税標準額(固定)・土地評価額・住宅用地の率
    if(name === 'siteAreaBuy' || name === 'taxation' || name === 'landEvaluation' || name === 'residentialRate') {
      this.cal22();
      this.cal23();
    }

    //【土地固定資産税(取得後)】.課税標準額(固定)
    if(name === 'afterTaxation'){
      let afterTaxation = this.getNumber(this.removeComma(this.plan.afterTaxationMap));
      //【土地固定資産税(取得後)】.固定資産税
      let afterFixedTax = Math.floor(afterTaxation * 0.014);
      this.plan.afterFixedTaxMap = this.numberFormat(afterFixedTax);
    }

    //【土地固定資産税(取得後)】.課税標準額(都市)
    if(name === 'afterTaxationCity'){
      let afterTaxationCity = this.getNumber(this.removeComma(this.plan.afterTaxationCityMap));
      //【土地固定資産税(取得後)】.都市計画税
      let afterCityPlanTax = Math.floor(afterTaxationCity * 0.03);
      this.plan.afterCityPlanTaxMap = this.numberFormat(afterCityPlanTax);
    }

    //【固定資産税(精算分)】.固定資産税(土地)
    //【固定資産税(精算分)】.都市計画税(土地)
    //【固定資産税(精算分)】.固定資産税(建物)
    //【固定資産税(精算分)】.都市計画税(建物)
    //固都税精算金.負担日数
    if(name === 'fixedTaxLand' || name === 'cityPlanTaxLand' || name === 'fixedTaxBuild' || name === 'cityPlanTaxBuild' || name === 'burdenDays') {
      this.cal27();
    }

    //建築費
    if(name === 'price10'){
      let val = this.getNumber(this.removeComma(this.plan.details[10].priceMap));
      if(val > 0){
        //設計料
        this.plan.details[11].priceMap = String(Math.floor(val * 0.03));
        this.changeValue('price11');
        //建築予備費
        this.plan.details[13].priceMap = String(Math.floor(val * 0.02));
        this.changeValue('price13');
      }
      this.plan.details[10].priceMap = this.numberFormat(this.plan.details[10].priceMap);
    }

    //建築延面積
    if(name === 'buildArea'){
      let buildArea = this.getNumber(this.removeComma(this.plan.buildAreaMap));
      //・建物 取得時税金.取得税評価額
      let valuation = this.getNumber(this.removeComma(this.plan.details[30].valuationMap));
      if(valuation > 0 || buildArea > 0){
        //・建物 取得時税金.取得税
        this.plan.details[30].priceMap = String(Math.floor(valuation * buildArea * 0.04));
        this.changeValueDetail('price', 30);
        //・建物 取得時税金.登録税
        this.plan.details[31].priceMap = String(Math.floor(valuation * buildArea * 0.004));
        this.changeValueDetail('price', 31);
      }
      this.plan.details[30].valuationMap = this.numberFormat(this.plan.details[30].valuationMap);
      this.plan.buildAreaMap = this.numberFormat(this.plan.buildAreaMap);
    }

    //竣工前地代.地代
    //保証金(解体費用).取得～竣工
    if(name === 'rent' || name === 'totalMonths'){
      this.cal41();
    }

    //土地関係金利.融資金額
    //融資手数料.手数料率
    if(name === 'landLoan' || name === 'commissionRate'){
      this.cal43();
    }

    //【固定資産税(精算分)】.土地評価額
    if(name === 'landEvaluation'){
      this.plan.landEvaluationMap = this.numberFormat(this.plan.landEvaluationMap);
    }
    //【固定資産税(精算分)】.課税標準額(固定)
    if(name === 'taxation'){
      this.plan.taxationMap = this.numberFormat(this.plan.taxationMap);
    }
    //【固定資産税(精算分)】.課税標準額(都市)
    if(name === 'taxationCity'){
      this.plan.taxationCityMap = this.numberFormat(this.plan.taxationCityMap);
    }
    //【固定資産税(精算分)】.既存建物評価額
    if(name === 'buildValuation'){
      this.plan.buildValuationMap = this.numberFormat(this.plan.buildValuationMap);
    }
    //【固定資産税(精算分)】.固定資産税(土地)
    if(name === 'fixedTaxLand'){
      this.plan.fixedTaxLandMap = this.numberFormat(this.plan.fixedTaxLandMap);
    }
    //【固定資産税(精算分)】.都市計画税(土地)
    if(name === 'cityPlanTaxLand'){
      this.plan.cityPlanTaxLandMap = this.numberFormat(this.plan.cityPlanTaxLandMap);
    }
    //【固定資産税(精算分)】.固定資産税(建物)
    if(name === 'fixedTaxBuild'){
      this.plan.fixedTaxBuildMap = this.numberFormat(this.plan.fixedTaxBuildMap);
    }
    //【固定資産税(精算分)】.都市計画税(建物)
    if(name === 'cityPlanTaxBuild'){
      this.plan.cityPlanTaxBuildMap = this.numberFormat(this.plan.cityPlanTaxBuildMap);
    }
    //【土地固定資産税(取得後)】.課税標準額(固定)
    if(name === 'afterTaxation'){
      this.plan.afterTaxationMap = this.numberFormat(this.plan.afterTaxationMap);
    }
    //【土地固定資産税(取得後)】.課税標準額(都市)
    if(name === 'afterTaxationCity'){
      this.plan.afterTaxationCityMap = this.numberFormat(this.plan.afterTaxationCityMap);
    }
    //【土地固定資産税(取得後)】.固定資産税
    if(name === 'afterFixedTax'){
      this.plan.afterFixedTaxMap = this.numberFormat(this.plan.afterFixedTaxMap);
    }
    //【土地固定資産税(取得後)】.都市計画税
    if(name === 'afterCityPlanTax'){
      this.plan.afterCityPlanTaxMap = this.numberFormat(this.plan.afterCityPlanTaxMap);
    }
    //売却金額.プラン1-A
    if(name === 'salesExpense1A'){
      this.plan.rent.salesExpense1AMap = this.numberFormat(this.plan.rent.salesExpense1AMap);
    }
    //売却金額.プラン1-B
    if(name === 'salesExpense1B'){
      this.plan.rent.salesExpense1BMap = this.numberFormat(this.plan.rent.salesExpense1BMap);
    }
    //売却金額.プラン1-C
    if(name === 'salesExpense1C'){
      this.plan.rent.salesExpense1CMap = this.numberFormat(this.plan.rent.salesExpense1CMap);
    }
    //売却金額.プラン1-D
    if(name === 'salesExpense1D'){
      this.plan.rent.salesExpense1DMap = this.numberFormat(this.plan.rent.salesExpense1DMap);
    }
    //売却金額.プラン2-A
    if(name === 'salesExpense2A'){
      this.plan.rent.salesExpense2AMap = this.numberFormat(this.plan.rent.salesExpense2AMap);
    }
    //売却金額.プラン2-B
    if(name === 'salesExpense2B'){
      this.plan.rent.salesExpense2BMap = this.numberFormat(this.plan.rent.salesExpense2BMap);
    }
    //売却金額.プラン2-C
    if(name === 'salesExpense2C'){
      this.plan.rent.salesExpense2CMap = this.numberFormat(this.plan.rent.salesExpense2CMap);
    }
    //売却金額.プラン2-D
    if(name === 'salesExpense2D'){
      this.plan.rent.salesExpense2DMap = this.numberFormat(this.plan.rent.salesExpense2DMap);
    }
    //売却金額.プラン3-A
    if(name === 'salesExpense3A'){
      this.plan.rent.salesExpense3AMap = this.numberFormat(this.plan.rent.salesExpense3AMap);
    }
    //売却金額.プラン3-B
    if(name === 'salesExpense3B'){
      this.plan.rent.salesExpense3BMap = this.numberFormat(this.plan.rent.salesExpense3BMap);
    }
    //売却金額.プラン3-C
    if(name === 'salesExpense3C'){
      this.plan.rent.salesExpense3CMap = this.numberFormat(this.plan.rent.salesExpense3CMap);
    }
    //売却金額.プラン3-D
    if(name === 'salesExpense3D'){
      this.plan.rent.salesExpense3DMap = this.numberFormat(this.plan.rent.salesExpense3DMap);
    }
    //簡易版.坪単価A
    if(name === 'tsuboUnitPriceA'){
      this.plan.rent.tsuboUnitPriceAMap = this.numberFormat(this.plan.rent.tsuboUnitPriceAMap);
    }
    //簡易版.坪単価B
    if(name === 'tsuboUnitPriceB'){
      this.plan.rent.tsuboUnitPriceBMap = this.numberFormat(this.plan.rent.tsuboUnitPriceBMap);
    }
    //簡易版.坪単価C
    if(name === 'tsuboUnitPriceC'){
      this.plan.rent.tsuboUnitPriceCMap = this.numberFormat(this.plan.rent.tsuboUnitPriceCMap);
    }
    //簡易版.坪単価D
    if(name === 'tsuboUnitPriceD'){
      this.plan.rent.tsuboUnitPriceDMap = this.numberFormat(this.plan.rent.tsuboUnitPriceDMap);
    }
    //土地関係金利.融資金額
    if(name === 'landLoan'){
      this.plan.landLoanMap = this.numberFormat(this.plan.landLoanMap);
    }
    //建物関係金利.融資金額
    if(name === 'buildLoan'){
      this.plan.buildLoanMap = this.numberFormat(this.plan.buildLoanMap);
    }
    //共益費(月間).共益費
    if(name === 'commonFee'){
      this.plan.rent.commonFeeMap = this.numberFormat(this.plan.rent.commonFeeMap);
    }
    //その他収入(月間)
    if(name === 'monthlyOtherIncome'){
      this.plan.rent.monthlyOtherIncomeMap = this.numberFormat(this.plan.rent.monthlyOtherIncomeMap);
    }
    //設計料
    if(name === 'price11'){
      this.plan.details[11].priceMap = this.numberFormat(this.plan.details[11].priceMap);
    }
    //建築予備費
    if(name === 'price13'){
      this.plan.details[13].priceMap = this.numberFormat(this.plan.details[13].priceMap);
    }
    //土地代.路線価
    if(name === 'routePrice'){
      this.plan.details[0].routePriceMap = this.numberFormat(this.plan.details[0].routePriceMap);
    }
    //敷地面積(売買)
    if(name === 'siteAreaBuy'){
      this.plan.siteAreaBuyMap = this.numberFormat(this.plan.siteAreaBuyMap);
    }
    //敷地面積(確認)
    if(name === 'siteAreaCheck'){
      this.plan.siteAreaCheckMap = this.numberFormat(this.plan.siteAreaCheckMap);
    }
    //建築延面積
    if(name === 'buildArea'){
      this.plan.buildAreaMap = this.numberFormat(this.plan.buildAreaMap);
    }
    //エントランス
    if(name === 'entrance'){
      this.plan.entranceMap = this.numberFormat(this.plan.entranceMap);
    }
    //駐車場面積
    if(name === 'parking'){
      this.plan.parkingMap = this.numberFormat(this.plan.parkingMap);
    }
    //地下面積
    if(name === 'underArea'){
      this.plan.underAreaMap = this.numberFormat(this.plan.underAreaMap);
    }
    //総専有面積
    if(name === 'totalArea'){
      this.plan.totalAreaMap = this.numberFormat(this.plan.totalAreaMap);
    }
    //販売専有面積
    if(name === 'salesArea'){
      this.plan.salesAreaMap = this.numberFormat(this.plan.salesAreaMap);
    }
  }

  /**
   * 値変更イベント（明細）
   * @param name 変更属性
   * @param pos 
  */
  changeValueDetail(name: string, pos: number) {
    if(name === 'price'){
      this.plan.details[pos].priceMap = this.numberFormat(this.plan.details[pos].priceMap);
    }
    if(name === 'priceTax'){
      this.plan.details[pos].priceTaxMap = this.numberFormat(this.plan.details[pos].priceTaxMap);
    }
    if(name === 'unitPrice'){
      this.plan.details[pos].unitPriceMap = this.numberFormat(this.plan.details[pos].unitPriceMap);
    }
    if(name === 'rentUnitPrice'){
      this.plan.rentdetails[pos].rentUnitPriceMap = this.numberFormat(this.plan.rentdetails[pos].rentUnitPriceMap);
    }
    if(name === 'valuation'){
      this.plan.details[pos].valuationMap = this.numberFormat(this.plan.details[pos].valuationMap);
    }
  }
  
  /**
   * 消化容積
   */
  cal9() {
    let ret: number;
    let buildArea = this.getNumber(this.removeComma(this.plan.buildAreaMap));
    let siteAreaCheck = this.getNumber(this.removeComma(this.plan.siteAreaCheckMap));

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
  cal10() {
    let ret: number;
    let buildArea = this.getNumber(this.removeComma(this.plan.buildAreaMap));
    let totalArea = this.getNumber(this.removeComma(this.plan.totalAreaMap));

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
  cal11() {
    let ret: number;
    let buildArea = this.getNumber(this.removeComma(this.plan.buildAreaMap));
    let entrance = this.getNumber(this.removeComma(this.plan.entranceMap));
    let totalArea = this.getNumber(this.removeComma(this.plan.totalAreaMap));

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
  cal12() {
    let ret: number;
    let parkingIndoor = this.getNumber(this.removeComma(this.plan.parkingIndoorMap));
    let parkingOutdoor = this.getNumber(this.removeComma(this.plan.parkingOutdoorMap));
    ret = parkingIndoor + parkingOutdoor;
    return ret;
  }
  
  /**
   * 駐車場設置率
   */
  cal13(){
    let ret: string | number;
    let buysellUnits = this.getNumber(this.removeComma(this.plan.buysellUnitsMap));
    if(this.cal12() > 0 && buysellUnits > 0){
      ret = (Math.floor(this.cal12() / buysellUnits * 10000) / 100).toFixed(2);
    } else {
      ret = 0;
    }
    return ret;
  }

  /**
   * 土地評価額
   */
  cal14() {
    let routePrice = this.removeComma(this.plan.details[0].routePriceMap);
    let siteAreaBuy = this.removeComma(this.plan.siteAreaBuyMap);
    
    if(routePrice !== '' && siteAreaBuy !== ''){
      let landEvaluation = Math.floor(this.getNumber(routePrice) * this.getNumber(siteAreaBuy) * 7 / 8);
      this.plan.landEvaluationMap = this.numberFormat(landEvaluation);
      this.changeValue('landEvaluation');
    }
  }

  /**
   * 課税標準額（固定）
   */
  cal15() {
    let landEvaluation = this.getNumber(this.removeComma(this.plan.landEvaluationMap));
    let residentialRate = this.getNumber(this.removeComma(this.plan.residentialRate));

    if(landEvaluation > 0 && residentialRate > 0){
      let taxation = Math.floor(landEvaluation * 1 / 6 * residentialRate / 100 + landEvaluation * (1 - residentialRate / 100));
      this.plan.taxationMap = this.numberFormat(taxation);
      this.changeValue('taxation');
    }
  }

  /**
   * 課税標準額（都市）
   */
  cal16() {
    let landEvaluation = this.getNumber(this.removeComma(this.plan.landEvaluationMap));
    let residentialRate = this.getNumber(this.removeComma(this.plan.residentialRate));

    if(landEvaluation > 0 && residentialRate > 0){
      let taxationCity = Math.floor(landEvaluation * 1 / 3 * residentialRate / 100 + landEvaluation * (1 - residentialRate / 100));
      this.plan.taxationCityMap = this.numberFormat(taxationCity);
      this.changeValue('taxationCity');
    }
  }

  /**
   * 精算分固都税年額
   */
  cal21() {
    let ret: string | number;
    let fixedTaxLand = this.getNumber(this.removeComma(this.plan.fixedTaxLandMap));
    let cityPlanTaxLand = this.getNumber(this.removeComma(this.plan.cityPlanTaxLandMap));
    let fixedTaxBuild = this.getNumber(this.removeComma(this.plan.fixedTaxBuildMap));
    let cityPlanTaxBuild = this.getNumber(this.removeComma(this.plan.cityPlanTaxBuildMap));
    
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
  cal22() {
    let taxation = this.getNumber(this.removeComma(this.plan.taxationMap));
    let landEvaluation = this.getNumber(this.removeComma(this.plan.landEvaluationMap));
    let siteAreaBuy = this.getNumber(this.removeComma(this.plan.siteAreaBuyMap));
    let residentialRate = this.getNumber(this.removeComma(this.plan.residentialRate));

    let afterTaxation = 0;
    if(siteAreaBuy <= 200){
      afterTaxation = taxation;
    } else {
      afterTaxation = Math.floor(landEvaluation / siteAreaBuy * (siteAreaBuy - 100) * 1 / 3 + landEvaluation * (1 - residentialRate / 100));
    }

    if(afterTaxation != 0){
      this.plan.afterTaxationMap = this.numberFormat(afterTaxation);
    }
    this.changeValue('afterTaxation');
  }

  /**
   * 取得後課税標準額（都市）
   */
  cal23() {
    let taxation = this.getNumber(this.removeComma(this.plan.taxationMap));
    let landEvaluation = this.getNumber(this.removeComma(this.plan.landEvaluationMap));
    let siteAreaBuy = this.getNumber(this.removeComma(this.plan.siteAreaBuyMap));
    let residentialRate = this.getNumber(this.removeComma(this.plan.residentialRate));

    let afterTaxationCity = 0;
    if(siteAreaBuy <= 200){
      afterTaxationCity = taxation;
    } else {
      afterTaxationCity = Math.floor(landEvaluation / siteAreaBuy * (siteAreaBuy - 100) * 2 / 3 + landEvaluation * (1 - residentialRate / 100));
    }

    if(afterTaxationCity != 0) {
      this.plan.afterTaxationCityMap = this.numberFormat(afterTaxationCity);
    }
    this.changeValue('afterTaxationCity');
  }

  /**
   * 取得後固都税年額
   */
  cal26() {
    let ret: number;
    let afterFixedTax = this.getNumber(this.removeComma(this.plan.afterFixedTaxMap));
    let afterCityPlanTax = this.getNumber(this.removeComma(this.plan.afterCityPlanTaxMap));

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
  cal27() {
    let fixedTaxLand = this.getNumber(this.removeComma(this.plan.fixedTaxLandMap));
    let cityPlanTaxLand = this.getNumber(this.removeComma(this.plan.cityPlanTaxLandMap));
    let fixedTaxBuild = this.getNumber(this.removeComma(this.plan.fixedTaxBuildMap));
    let cityPlanTaxBuild = this.getNumber(this.removeComma(this.plan.cityPlanTaxBuildMap));
    let burdenDays = this.getNumber(this.removeComma(this.plan.details[4].burdenDaysMap));

    let price = 0;
    if(fixedTaxLand > 0 || cityPlanTaxLand > 0 || fixedTaxBuild > 0 || cityPlanTaxBuild > 0 || burdenDays > 0){
      price = Math.floor((fixedTaxLand + cityPlanTaxLand + fixedTaxBuild + cityPlanTaxBuild) / 365 * burdenDays);
    }
    this.plan.details[4].priceMap = this.numberFormat(price);
  }

  /**
   * 土地原価.その他合計
   * 土地原価合計
   * 建物原価.近隣保障費等
   * 建物原価.その他合計
   * 建物原価合計
   * その他費用.その他合計
   */
  total(from: number, to: number)
  {
    let ret = 0;
    for (let i = from; i <= to; i++) {
      let price = this.getNumber(this.removeComma(this.plan.details[i].priceMap));
      ret += price;
    }
    return Math.floor(ret);
  }

  /**
   * その他費用.土地固都税.金額(税抜)
   */
  cal35() {
    let afterFixedTax = this.getNumber(this.removeComma(this.plan.afterFixedTaxMap));
    let afterCityPlanTax = this.getNumber(this.removeComma(this.plan.afterCityPlanTaxMap));
    let complePriceMonth = this.getNumber(this.removeComma(this.plan.details[23].complePriceMonthMap));

    let price = 0;
    if(afterFixedTax > 0 && afterCityPlanTax > 0 && complePriceMonth > 0){
      price = Math.floor((afterFixedTax + afterCityPlanTax) / 12 * complePriceMonth);
    }
    this.plan.details[23].priceMap = this.numberFormat(price);
  }

  /**
   * その他費用.既存建物関係費.固都税.金額(税抜)
   */
  cal36() {
    let fixedTaxBuild = this.getNumber(this.removeComma(this.plan.fixedTaxBuildMap));
    let cityPlanTaxBuild = this.getNumber(this.removeComma(this.plan.cityPlanTaxBuildMap));
    let dismantlingMonth = this.getNumber(this.removeComma(this.plan.details[24].dismantlingMonthMap));

    let price = 0;
    if(fixedTaxBuild > 0 && cityPlanTaxBuild > 0 && dismantlingMonth > 0){
      price = Math.floor((fixedTaxBuild + cityPlanTaxBuild) / 12 * dismantlingMonth);
    }
    this.plan.details[24].priceMap = this.numberFormat(price);
  }

  /**
   * その他費用.既存建物関係費.取得税
   * その他費用.既存建物関係費.登録免許税
   */
  cal37(num: number) {
    let ret = 0;
    let buildValuation = this.getNumber(this.removeComma(this.plan.buildValuationMap));
    
    if(buildValuation > 0){
      ret = Math.floor(buildValuation * num);
    }
    return ret;
  }

  /**
   * 竣工前地代.地代
   * 保証金(解体費用).取得～竣工
   */
  cal41() {
    let rent = this.removeComma(this.plan.details[32].rentMap);
    let totalMonths = this.removeComma(this.plan.details[33].totalMonthsMap);
    
    let price = 0;
    if(rent !== '' && totalMonths !== ''){
      price = this.getNumber(rent) * this.getNumber(totalMonths);
    }
    this.plan.details[32].priceMap = this.numberFormat(price);
    this.plan.details[32].rentMap = this.numberFormat(rent);
  }

  /**
   * 融資手数料
   */
  cal43() {
    let landLoan = this.removeComma(this.plan.landLoanMap);
    let commissionRate = this.removeComma(this.plan.details[36].commissionRateMap);

    let price = 0;
    if(landLoan !== '' && commissionRate !== ''){
      price = Math.floor(this.getNumber(landLoan) * this.getNumber(commissionRate) / 100);
    }
    this.plan.details[36].priceMap = this.numberFormat(price);
  }

  /**
   * 抵当権設定費用
   */
  cal44() {
    let landLoan = this.removeComma(this.plan.landLoanMap);

    if(landLoan !== ''){
      let price = Math.floor(this.getNumber(landLoan) * 0.004);
      this.plan.details[37].priceMap = this.numberFormat(price);
    }
  }

  /**
   * その他費用合計
   */
  cal45() {
    let ret = this.total(23, 38) + this.cal37(0.03) + this.cal37(0.02) + this.changeHang(this.plan.taxationMap, 0.015) + this.changeHang(this.plan.taxationMap, 0.02);
    return Math.floor(ret);
  }

  /**
   * 土地関係金利
   */
  cal46() {
    let ret = 0;
    let landLoan = this.getNumber(this.removeComma(this.plan.landLoanMap));
    let landInterest = this.getNumber(this.removeComma(this.plan.landInterestMap));
    let landPeriod = this.getNumber(this.removeComma(this.plan.landPeriodMap));

    if(landLoan > 0 && landInterest > 0 && landPeriod > 0){
      ret = landLoan * landInterest / 12 * landPeriod / 100;
    }
    return Math.floor(ret);
  }

  /**
   * 建物関係金利
   */
  cal47() {
    let ret = 0;
    let buildLoan = this.getNumber(this.removeComma(this.plan.buildLoanMap));
    let buildInterest = this.getNumber(this.removeComma(this.plan.buildInterestMap));
    let buildPeriod = this.getNumber(this.removeComma(this.plan.buildPeriodMap));

    if(buildLoan > 0 && buildInterest > 0 && buildPeriod > 0){
      ret = buildLoan * buildInterest / 12 * buildPeriod / 100;
    }
    return Math.floor(ret);
  }

  /**
   * 金利合計
   */
  cal48() {
    let ret = this.cal46() + this.cal47();
    return Math.floor(ret);
  }
  
  /**
   * PJ原価
   */
  cal49() {
    let ret = this.total(0, 22) + this.cal45() + this.cal48();
    return Math.floor(ret);
  }

  /**
   * 単価・坪
   */
  cal50(pos: number) {
    let ret = 0;
    let price = this.getNumber(this.removeComma(this.plan.details[pos].priceMap));
    let totalArea = this.getNumber(this.removeComma(this.plan.totalAreaMap));
    if(price > 0 && totalArea > 0){
      ret = Math.floor(price / ((Math.floor(totalArea * (0.3025 * 100))) / 100));
    }
    return ret;
  }

  /**
   * 賃料
   */
  cal51(pos: number) {
    let ret = 0;
    let space = this.getNumber(this.removeComma(this.plan.rentdetails[pos].spaceMap));
    let rentUnitPrice = this.getNumber(this.removeComma(this.plan.rentdetails[pos].rentUnitPriceMap));
    
    if(space > 0 && rentUnitPrice > 0){
      ret = Math.floor(space * (0.3025 * 100)) / 100;
      ret = Math.floor(rentUnitPrice) * ret;
    }
    return Math.floor(ret);
  }

  /**
   * 敷金
   */
  cal52(pos: number) {
    let ret = 0;
    let space = this.getNumber(this.removeComma(this.plan.rentdetails[pos].spaceMap));
    let rentUnitPrice = this.getNumber(this.removeComma(this.plan.rentdetails[pos].rentUnitPriceMap));
    let securityDeposit = this.getNumber(this.removeComma(this.plan.rentdetails[pos].securityDepositMap));
    
    if(space > 0 && rentUnitPrice > 0 && securityDeposit > 0){
      ret = Math.floor(space * (0.3025 * 100)) / 100;
      ret = rentUnitPrice * securityDeposit * ret;
    }
    return Math.floor(ret);
  }

  /**
   * 駐車場 台数
   */
  cal53_1(){
    let ret = 0;
    let parkingIndoor = this.getNumber(this.removeComma(this.plan.parkingIndoorMap));
    if(parkingIndoor > 0){
      ret = Math.floor(parkingIndoor);
    }
    this.plan.rentdetails[15].spaceMap = this.numberFormat(ret);
    return ret;
  }
  
  /**
   * 駐車場.賃料
   * 駐輪場.賃料
   * バイク置き場.賃料
   * 自販機.賃料
   */
  cal53(pos: number) {
    let ret = 0;
    let space = this.getNumber(this.removeComma(this.plan.rentdetails[pos].spaceMap));
    let rentUnitPrice = this.getNumber(this.removeComma(this.plan.rentdetails[pos].rentUnitPriceMap));

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
  cal54(pos: number) {
    let ret = 0;
    let space = this.getNumber(this.removeComma(this.plan.rentdetails[pos].spaceMap));
    let rentUnitPrice = this.getNumber(this.removeComma(this.plan.rentdetails[pos].rentUnitPriceMap));
    let securityDeposit = this.getNumber(this.removeComma(this.plan.rentdetails[pos].securityDepositMap));

    if(space > 0 && rentUnitPrice > 0 && securityDeposit > 0){
      ret = Math.floor(space) * rentUnitPrice * securityDeposit;
    }
    return Math.floor(ret);
  }

  /**
   * 面積.合計
   */
  cal61() {
    let ret = 0;

    let pos = 0;
    while(pos < 15){
      let space = this.getNumber(this.removeComma(this.plan.rentdetails[pos].spaceMap));
      ret += space;
      pos++;
    }
    return Math.floor(ret);
  }
  
  /**
   * 賃料.合計
   */
  cal62() {
    let ret = 0;

    let pos = 0;
    while(pos < 15) {
      ret += this.cal51(pos);
      pos++;
    }
    for (let i = 15; i <= 18; i++) {
      ret += this.cal53(i);
    }
    return Math.floor(ret);
  }

  /**
   * 敷金.合計
   */
  cal63() {
    let ret = 0;

    let pos = 0;
    while(pos < 15) {
      ret += this.cal52(pos);
      pos++;
    }
    for (let i = 15; i <= 18; i++) {
      ret += this.cal54(i);
    }
    return Math.floor(ret);
  }

  /**
   * 年間賃料
   */
  cal64() {
    let ret = this.cal62() * 12;
    return Math.floor(ret);
  }

  /**
   * 共益費(月間)
   */
  cal65() {
    let ret = 0;
    let commonFee = this.getNumber(this.removeComma(this.plan.rent.commonFeeMap));
    let totalUnits = this.getNumber(this.removeComma(this.plan.totalUnitsMap));

    if(commonFee > 0 && totalUnits > 0){
      ret = commonFee * totalUnits;
    }
    return ret;
  }

  /**
   * 共益費(年間)
   */
  cal66() {
    let ret = this.cal65() * 12;
    return Math.floor(ret);
  }

  /**
   * その他収入(年間)
   */
  cal67() {
    let ret = 0;
    let monthlyOtherIncome = this.getNumber(this.removeComma(this.plan.rent.monthlyOtherIncomeMap)); 
    ret = Math.floor(monthlyOtherIncome * 12);
    return ret;
  }

  /**
   * 年間(税込み)
   */
  cal68() {
    let ret = 0;
    let commonFee = this.getNumber(this.removeComma(this.plan.rent.commonFeeMap));
    let totalUnits = this.getNumber(this.removeComma(this.plan.totalUnitsMap));
    let monthlyOtherIncome = this.getNumber(this.removeComma(this.plan.rent.monthlyOtherIncomeMap));
    
    ret = this.cal62() * 12 + commonFee * totalUnits * 12 + monthlyOtherIncome * 12;
    return Math.floor(ret);
  }

  /**
   * 年間収入(B)
   */
  cal69() {
    let ret = this.cal68() * this.getNumber(this.removeComma(this.plan.rent.occupancyRate)) / 100;
    return Math.floor(ret);
  }

  /**
   * NOI※(B)*(1-経費率)
   */
  cal70(name: string) {
    let ret = 0;
    if(name === '1') ret = this.getNumber(this.removeComma(this.plan.rent.expenseRatio1));
    else if(name === '2') ret = this.getNumber(this.removeComma(this.plan.rent.expenseRatio2));
    else if(name === '3') ret = this.getNumber(this.removeComma(this.plan.rent.expenseRatio3));
    else if(name === '4') ret = this.getNumber(this.removeComma(this.plan.rent.expenseRatio4));

    if(this.cal69() > 0 && ret > 0){
      ret = Math.floor(this.cal69() * (1 - (ret / 100)));
    }
    return ret;
  }

  /**
   * NOI利回り(%)※NOI/(A)
   */
  cal71(name: string) {
    let ret = 0;
    let jvRatio = this.getNumber(this.removeComma(this.plan.jvRatio));
    if(this.cal70(name) > 0 || jvRatio > 0){
      ret = Math.floor(this.cal70(name) / (((this.cal49() - this.cal46() - this.cal47()) * (jvRatio / 100)) + this.cal46() + this.cal47()) * 10000) / 100;
    }
    return ret;
  }

  /**
   * 売上金利(D)※NOI/(C)
   */
  cal72(name: string) {
    let ret = 0;
    let salesProfits = this.getNumber(this.removeComma(this.plan.rent.salesProfits));

    if(salesProfits > 0)
    {
      ret = Math.floor(Number(this.cal70(name)) / (salesProfits / 100));
    }
    return ret;
  }

  /**
   * 売却時利益(E)<br>※(D)-(A)
   */
  cal73(name: string) {
    let ret = 0;
    let jvRatio = this.getNumber(this.removeComma(this.plan.jvRatio));
    if(this.cal72(name) > 0  && this.cal49() > 0 && jvRatio > 0){
      ret = this.cal72(name) - (Math.floor((this.cal49() - this.cal46() - this.cal47()) * (jvRatio / 100)) + this.cal46() + this.cal47());
    }
    return ret;
  }

  /**
   * 利益率(%)<br>※(E)/(D)
   */
  cal74(name: string) {
    let ret = 0;
    if(this.cal72(name) > 0 && this.cal73(name) > 0){
      ret = Math.floor(this.cal73(name) / this.cal72(name) * 10000) / 100;
    }
    return ret;
  }

  /**
   * 売却金額
   */
  cal77(name: string) {
    let ret = 0;
    if(name === 'A') ret = this.getNumber(this.removeComma(this.plan.rent.profitsA));
    else if(name === 'B') ret = this.getNumber(this.removeComma(this.plan.rent.profitsB));
    else if(name === 'C') ret = this.getNumber(this.removeComma(this.plan.rent.profitsC));
    else if(name === 'D') ret = this.getNumber(this.removeComma(this.plan.rent.profitsD));

    if(this.cal69() > 0 && ret > 0){
      ret = Math.floor(this.cal69() / (ret / 100));
    }
    return ret;
  }

  /**
   * 販売経費小計
   */
  cal79(name: string) {
    let ret = 0;
    if(name === 'A'){
      ret = this.getNumber(this.removeComma(this.plan.rent.salesExpense1AMap))
              + this.getNumber(this.removeComma(this.plan.rent.salesExpense2AMap))
              + this.getNumber(this.removeComma(this.plan.rent.salesExpense3AMap));
    } else if(name === 'B'){
      ret = this.getNumber(this.removeComma(this.plan.rent.salesExpense1BMap))
              + this.getNumber(this.removeComma(this.plan.rent.salesExpense2BMap))
              + this.getNumber(this.removeComma(this.plan.rent.salesExpense3BMap));
    } else if(name === 'C'){
      ret = this.getNumber(this.removeComma(this.plan.rent.salesExpense1CMap))
              + this.getNumber(this.removeComma(this.plan.rent.salesExpense2CMap))
              + this.getNumber(this.removeComma(this.plan.rent.salesExpense3CMap));
    } else if(name === 'D'){
      ret = this.getNumber(this.removeComma(this.plan.rent.salesExpense1DMap))
              + this.getNumber(this.removeComma(this.plan.rent.salesExpense2DMap))
              + this.getNumber(this.removeComma(this.plan.rent.salesExpense3DMap));
    }
    return Math.floor(ret);
  }

  /**
   * 利益
   */
  cal80(name: string) {
    let ret = 0;
    let jvRatio = this.getNumber(this.removeComma(this.plan.jvRatio));
    if(this.cal77(name) > 0){
      ret = this.cal77(name) - (Math.floor((this.cal49() - this.cal46() - this.cal47()) * (jvRatio / 100)) + this.cal46() + this.cal47()) - this.cal79(name);
    }
    return ret;
  }

  /**
   * 利益率(%)
   */
  cal81(name: string) {
    let ret = 0;
    let occupancyRate = this.getNumber(this.removeComma(this.plan.rent.occupancyRate));
    let salesProfits = this.getNumber(this.removeComma(this.plan.rent.salesProfits));

    if(this.cal77(name) > 0) {
      if(occupancyRate > 0 && salesProfits > 0){
        ret = Math.floor((this.cal80(name) / this.cal77(name)) * 10000) / 100;
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
          me['pjCost'] = this.getPjCost(me);
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
  //20200805 S_Add
  /**
   * PJ原価（グリッド用）
   */
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
  //20200805 E_Add

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
