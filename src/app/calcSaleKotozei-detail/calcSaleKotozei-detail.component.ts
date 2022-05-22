import { Component, Inject } from '@angular/core';
import { Locationinfo } from '../models/locationinfo';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { Code } from '../models/bukken';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { Converter } from '../utils/converter';
import { parse } from 'date-fns';
import { Bukkensalesinfo } from '../models/bukkensalesinfo';

@Component({
  selector: 'app-location-detail',
  templateUrl: './calcSaleKotozei-detail.component.html',
  styleUrls: ['./calcSaleKotozei-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})

export class CalcSaleKotozeiDetailComponent extends BaseComponent {

  public sale: Bukkensalesinfo;
  public locations: Locationinfo[];

  public sharingStartDayBuyerMap: Date;
  public sharingEndDayBuyerMap: Date;
  public sharingDayBuyerCnt: number;
  public oldSalesFixedTaxMap: string;
  public oldSalesFixedLandTaxMap: string;
  public oldSalesFixedBuildingTaxMap: string;
  public oldSalesFixedBuildingTaxOnlyTaxMap: string;
  public reducedChk: string = '1';

  constructor(public router: Router,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public dialogRef: MatDialogRef<Bukkensalesinfo>,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              @Inject(MAT_DIALOG_DATA) public req: any) {
      super(router, service,dialog);

      this.sale = req.sale;
  }

  ngOnInit() {
    super.ngOnInit();
    const funcs = [];

    funcs.push(this.service.getCodes(['007', '035', '036']));
    // 売却先所在地に設定がある場合、所在地情報レコードを習得する
    if (this.sale.salesLocation != null || this.sale.salesLocation.length > 0) {
      let cond = {
        clctPid: this.sale.salesLocation.split(',')
      };
      funcs.push(this.service.searchLocation(cond));
    }

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
      if (values.length > 1) {
        this.locations = values[1];
      }
      this.convertData();
    });
  }

  /**
   * データ編集
   */
  convertData() {
    // 軽減有無を設定する
    const locs = [];
    this.locations.forEach(loc => {
      const newLoc = new Locationinfo(loc as Locationinfo);
      newLoc.convert();
      if(newLoc.reducedChk != null && newLoc.reducedChk.length > 0) this.reducedChk = newLoc.reducedChk;// 軽減有無
      locs.push(newLoc);
    });
    this.locations = locs;

    // 初期値設定
    if(this.sale.sharingStartDay == null || this.sale.sharingStartDay.length == 0) {
      const date = new Date();
      this.sale.sharingStartDayYYYY = String(date.getFullYear());
      this.sale.sharingStartDayMMDD = '0101';
    }
    this.sale.sharingEndDayMap = Converter.stringToDate(this.sale.sharingEndDay, 'yyyyMMdd');
    
    // 分担期間（買主）（開始）
    if(this.sale.sharingEndDayMap != null)
    {
      const dt = this.sale.sharingEndDayMap;
      // 1日後
      dt.setDate(dt.getDate() + 1);
      this.sharingStartDayBuyerMap = dt;
      this.sale.sharingEndDayMap = Converter.stringToDate(this.sale.sharingEndDay, 'yyyyMMdd');// 元に戻す
    }

    this.oldSalesFixedTaxMap = this.sale.salesFixedTaxMap;
    this.oldSalesFixedLandTaxMap = this.sale.salesFixedLandTaxMap;
    this.oldSalesFixedBuildingTaxMap = this.sale.salesFixedBuildingTaxMap;
    this.oldSalesFixedBuildingTaxOnlyTaxMap = this.sale.salesFixedBuildingTaxOnlyTaxMap;
    this.changeValue('reducedChk');
  }

  /**
   * 値変更イベント
   * @param item ：所在地情報
   * @param name 変更属性
   */
  changeValueLoc(item: Locationinfo, name: string) {
    // 固定資産税評価額
    if(name === 'valuation') {
      item.valuation = Converter.stringToNumber(item.valuationMap);
      if(item.valuation != null && item.valuation > 0) {
        // 固定資産税が未設定の場合
        item.propertyTax = Converter.stringToNumber(item.propertyTaxMap);
        if(item.propertyTax == null || item.propertyTax == 0) {
          item.propertyTax = Math.floor(item.valuation * 0.014);// 小数点以下切り捨て
          item.propertyTaxMap = Converter.numberToString(item.propertyTax);
        }
      }
    }
    // 都市計画税評価額
    else if(name === 'cityValuation') {
      item.cityValuation = Converter.stringToNumber(item.cityValuationMap);
      if(item.cityValuation != null && item.cityValuation > 0) {
        // 都市計画税が未設定の場合
        item.cityPlanningTax = Converter.stringToNumber(item.cityPlanningTaxMap);
        if(item.cityPlanningTax == null || item.cityPlanningTax == 0) {
          item.cityPlanningTax = item.cityValuation * 0.003;
          // 区分が01：土地かつ、軽減有無が1:対象の場合
          if(item.locationType === '01' && item.reducedChk === '1') {
            item.cityPlanningTax = item.cityPlanningTax * 0.5;
          }
          item.cityPlanningTax = Math.floor(item.cityPlanningTax);// 小数点以下切り捨て
          item.cityPlanningTaxMap = Converter.numberToString(item.cityPlanningTax);
        }
      }
    }
  }

  /**
   * 数値にカンマを付ける作業
   */
  changeNumeric(val) {
    val = this.numberFormat(val);
    return val;
  }

  /**
   * 値変更イベント
   * @param name 変更属性
   */
  changeValue(name: string) {
    let isResetFixed = false;// 20220517 Add
    let sharingStartDayMap: Date;
    // 分担期間開始日
    if(name === 'sharingStartDay') {
      if(this.sale.sharingStartDayYYYY != null && this.sale.sharingStartDayYYYY.length > 0) 
      {
        if(this.sale.sharingStartDay != this.sale.sharingStartDayYYYY.concat(this.sale.sharingStartDayMMDD)) {
          isResetFixed = true;
        }

        this.sale.sharingStartDay = this.sale.sharingStartDayYYYY.concat(this.sale.sharingStartDayMMDD);
        // 分担期間（買主）（終了）
        if(this.sale.sharingStartDay.length == 8) {
          const dt = parse(this.sale.sharingStartDay, 'yyyyMMdd', new Date());
          // 1年後
          dt.setFullYear(dt.getFullYear() + 1);
          // 1日前
          dt.setDate(dt.getDate() - 1);
          this.sharingEndDayBuyerMap = dt;
        }
        else this.sharingEndDayBuyerMap = null;
      }
    }
    // 分担期間終了日
    else if(name === 'sharingEndDay') {
      // 分担期間（買主）（開始）
      if(this.sale.sharingEndDayMap != null)
      {
        if(this.sale.sharingEndDay != Converter.dateToString(this.sale.sharingEndDayMap, 'yyyyMMdd', this.datepipe)) {
          isResetFixed = true;
        }

        this.sale.sharingEndDay = Converter.dateToString(this.sale.sharingEndDayMap, 'yyyyMMdd', this.datepipe);
        const dt = this.sale.sharingEndDayMap;
        // 1日後
        dt.setDate(dt.getDate() + 1);
        this.sharingStartDayBuyerMap = dt;
        this.sale.sharingEndDayMap = Converter.stringToDate(this.sale.sharingEndDay, 'yyyyMMdd');// 元に戻す
      }
      else this.sharingStartDayBuyerMap = null;
    }
    // 軽減有無
    else if(name === 'reducedChk') {
      const locs = [];
      // 所在地情報の軽減有無をすべて更新
      this.locations.forEach(location => {
        const loc = new Locationinfo(location as Locationinfo);
        loc.reducedChk = this.reducedChk;
        locs.push(loc);
      });
      this.locations = locs;
      return;
    }
    else if(name === 'fixedLandTax' || name === 'fixedBuildingTax') {
      this.sale.salesFixedLandTax = Converter.stringToNumber(this.sale.salesFixedLandTaxMap);
      this.sale.salesFixedBuildingTax = Converter.stringToNumber(this.sale.salesFixedBuildingTaxMap);

      // 固都税清算金=固都税清算金（土地）+固都税清算金（建物）+建物分消費税
      this.sale.salesFixedTax = this.sale.salesFixedLandTax + this.sale.salesFixedBuildingTax + this.sale.salesFixedBuildingTaxOnlyTax;
      this.sale.salesFixedTaxMap = Converter.numberToString(this.sale.salesFixedTax);
      return;
    }
    sharingStartDayMap = parse(this.sale.sharingStartDay, 'yyyyMMdd', new Date());

    if(this.sharingStartDayBuyerMap != null && this.sharingEndDayBuyerMap != null) {
      this.sharingDayBuyerCnt = ((this.sharingEndDayBuyerMap.getTime() - this.sharingStartDayBuyerMap.getTime()) / 86400000) + 1;
      // 分担期間（買主）の日数が0より大きい場合
      if(this.sharingDayBuyerCnt > 0) {
        // 1年の日数
        let sharingYearDayCnt = ((this.sharingEndDayBuyerMap.getTime() - sharingStartDayMap.getTime()) / 86400000) + 1;

        // 所在地情報から合計数を取得する
        let totalPropertyTaxLand = 0;         // 合計固定資産税（土地）
        let totalCityPlanningTaxLand = 0;     // 合計都市計画税（土地）
        let totalPropertyTaxBuilding = 0;     // 合計固定資産税（建物）
        let totalCityPlanningTaxBuilding = 0; // 合計都市計画税（建物）

        this.locations.forEach(location => {
          const loc = new Locationinfo(location as Locationinfo);
          // 区分が01：土地の場合
          if(loc.locationType === '01') {
            totalPropertyTaxLand += Converter.stringToNumber(loc.propertyTaxMap);
            totalCityPlanningTaxLand += Converter.stringToNumber(loc.cityPlanningTaxMap);
          } else {
            totalPropertyTaxBuilding += Converter.stringToNumber(loc.propertyTaxMap);
            totalCityPlanningTaxBuilding += Converter.stringToNumber(loc.cityPlanningTaxMap);
          }
        });

        // 自動計算後固都税清算金（土地）=(合計固定資産税（土地）+合計都市計画税（土地）)*分担期間（買主）の日数/1年の日数
        let calcSalesFixedLandTax = (totalPropertyTaxLand + totalCityPlanningTaxLand) * this.sharingDayBuyerCnt / sharingYearDayCnt;
        calcSalesFixedLandTax = Math.floor(calcSalesFixedLandTax);// 小数点以下切り捨て
        // 自動計算後固都税清算金（建物）=(合計固定資産税（建物）+合計都市計画税（建物）)*分担期間（買主）の日数/1年の日数
        let calcSalesFixedBuildingTax = (totalPropertyTaxBuilding + totalCityPlanningTaxBuilding) * this.sharingDayBuyerCnt / sharingYearDayCnt;
        calcSalesFixedBuildingTax = Math.floor(calcSalesFixedBuildingTax);// 小数点以下切り捨て

        // 建物分消費税
        this.sale.salesFixedBuildingTaxOnlyTax = Converter.stringToNumber(this.sale.salesFixedBuildingTaxOnlyTaxMap);

        // 固都税清算金（土地）が未設定の場合
        this.sale.salesFixedLandTax = Converter.stringToNumber(this.sale.salesFixedLandTaxMap);
        if(this.sale.salesFixedLandTax == null || this.sale.salesFixedLandTax == 0) {
          this.sale.salesFixedLandTax = calcSalesFixedLandTax;
          this.sale.salesFixedLandTaxMap = Converter.numberToString(this.sale.salesFixedLandTax);
        }
        // 固都税清算金（建物）が未設定の場合
        this.sale.salesFixedBuildingTax = Converter.stringToNumber(this.sale.salesFixedBuildingTaxMap);
        if(this.sale.salesFixedBuildingTax == null || this.sale.salesFixedBuildingTax == 0) {
          this.sale.salesFixedBuildingTax = calcSalesFixedBuildingTax + this.sale.salesFixedBuildingTaxOnlyTax;
          this.sale.salesFixedBuildingTaxMap = Converter.numberToString(this.sale.salesFixedBuildingTax);
        }

        // 【ノート】
        // 分担期間（売主）に変更があった場合、固都税清算金を初期化する

        if(isResetFixed) {
          // 固都税清算金（土地）を初期化
          this.sale.salesFixedLandTaxMap = null;
          this.sale.salesFixedLandTax = null;
          // 固都税清算金（建物）を初期化
          this.sale.salesFixedBuildingTaxMap = null;
          this.sale.salesFixedBuildingTax = null;
        }

        // 固都税清算金=固都税清算金（土地）+固都税清算金（建物）+建物分消費税
        this.sale.salesFixedTax = this.sale.salesFixedLandTax + this.sale.salesFixedBuildingTax + this.sale.salesFixedBuildingTaxOnlyTax;
        this.sale.salesFixedTaxMap = Converter.numberToString(this.sale.salesFixedTax);
      }
    }
  }

  /**
   * 登録
   */
  save() {
    // 所在地情報を更新
    //this.data.locations.forEach(location => {
    this.locations.forEach(location => {
      const loc = new Locationinfo(location as Locationinfo);
      loc.convertForSave(this.service.loginUser.userId, this.datepipe);
      this.service.saveLocation(loc);
    });

    this.sale.convertForSave(this.service.loginUser.userId, this.datepipe, false);
    this.service.saveBukkenSale(this.sale);

    // 所在地情報を更新
    const locs = [];
    this.locations.forEach(loc => {
      let newLoc = new Locationinfo(loc as Locationinfo);
      const lst = this.locations.filter(dt => dt.pid === loc.pid);
      if (lst.length > 0) {
        newLoc = lst[0];
      }
      locs.push(newLoc);
    });
    this.locations = locs;

    this.dialogRef.close({data: this.sale});
  }
  
  /**
   * キャンセル
   */
  cancel() {
    this.spinner.hide();
    this.sale.salesFixedTaxMap = this.oldSalesFixedTaxMap;
    this.sale.salesFixedLandTaxMap = this.oldSalesFixedLandTaxMap;
    this.sale.salesFixedBuildingTaxMap = this.oldSalesFixedBuildingTaxMap;
    this.sale.salesFixedBuildingTaxOnlyTaxMap = this.oldSalesFixedBuildingTaxOnlyTaxMap;
    this.dialogRef.close({data: this.sale});
  }

  /**
   * 軽減有無の変更チェック
   */
  isChangeReducedChk(): boolean {
    let ret = false;
    this.locations.forEach(location => {
      const loc = new Locationinfo(location as Locationinfo);
      if(loc.reducedChk !== this.reducedChk) ret = true;
    });
    return ret;
  }

  /**
   * 値変更イベント（すべて変更）
   */
  changeValueAll() {
    // 軽減有無に変更がない場合、対象外
    if(!this.isChangeReducedChk()) return;

    // 軽減有無の値変更処理
    this.changeValue('reducedChk');

    // 固定資産税と都市計画税を再計算
    let locs = [];
    this.locations.forEach(location => {
      let loc = new Locationinfo(location as Locationinfo);
      loc.valuation = Converter.stringToNumber(loc.valuationMap);
      loc.cityValuation = Converter.stringToNumber(loc.cityValuationMap);// 20220521 Add
      // 固定資産税評価額に指定がある場合
      if(loc.valuation != null && loc.valuation > 0) {
        loc.propertyTaxMap = null;    // 固定資産税を初期化
        // loc.cityPlanningTaxMap = null;// 都市計画税を初期化 20220521 Delete
        this.changeValueLoc(loc, 'valuation');
      }

      // 都市計画税評価額に指定がある場合
      if(loc.cityValuation != null && loc.cityValuation > 0) {
        loc.cityPlanningTaxMap = null;// 都市計画税を初期化
        this.changeValueLoc(loc, 'cityValuation');
      }

      locs.push(loc);
    });
    this.locations = locs;

    // 固都税清算金（土地）と固都税清算金（建物）を再計算
    if(this.sharingStartDayBuyerMap != null && this.sharingEndDayBuyerMap != null) {
      this.sale.salesFixedLandTaxMap = null;// 固都税清算金（土地）を初期化
      this.sale.salesFixedBuildingTaxMap = null;// 固都税清算金（建物）を初期化
      this.changeValue('');
    }
  }
}
