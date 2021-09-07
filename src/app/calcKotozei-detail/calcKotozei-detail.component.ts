import { Component, Inject } from '@angular/core';
import { Locationinfo } from '../models/locationinfo';
import { Router, ROUTER_CONFIGURATION } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { Code } from '../models/bukken';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { Contractinfo } from '../models/contractinfo';
import { Templandinfo } from '../models/templandinfo';
import { Converter } from '../utils/converter';
import { parse } from 'date-fns';

@Component({
  selector: 'app-location-detail',
  templateUrl: './calcKotozei-detail.component.html',
  styleUrls: ['./calcKotozei-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class CalcKotozeiDetailComponent extends BaseComponent {

  public data: Templandinfo;
  public sharingStartDayBuyerMap: Date;
  public sharingEndDayBuyerMap: Date;
  public sharingDayBuyerCnt: number;
  public oldFixedTaxMap: string;
  public oldFixedLandTaxMap: string;
  public oldFixedBuildingTaxMap: string;
  public oldFixedBuildingTaxOnlyTaxMap: string;
  public reducedChk: string = '1';

  constructor(public router: Router,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public dialogRef: MatDialogRef<Contractinfo>,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              @Inject(MAT_DIALOG_DATA) public contract: Contractinfo) {
      super(router, service,dialog);

      this.data = new Templandinfo();
      this.data.locations = [];
  }

  ngOnInit() {
    super.ngOnInit();
    const funcs = [];

    funcs.push(this.service.getCodes(['007', '035', '036']));
    funcs.push(this.service.getContract(this.contract.pid));

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
      this.data = new Templandinfo(values[1].land as Templandinfo);
      this.convertData();
    });
  }

  /**
   * データ編集
   */
  convertData() {
    // 所在地情報を絞り込み
    const locs = [];
    this.data.locations.forEach(loc => {
      const newLoc = new Locationinfo(loc as Locationinfo);
      const lst = this.contract.details.filter(dt => dt.locationInfoPid === loc.pid && dt.contractDataType === '01');
      if (lst.length > 0) {
        newLoc.convert();
        if(newLoc.reducedChk != null && newLoc.reducedChk.length > 0) this.reducedChk = newLoc.reducedChk;// 軽減有無
        locs.push(newLoc);
      }
    });
    this.data.locations = locs;

    // 初期値設定
    if(this.contract.sharingStartDay == null || this.contract.sharingStartDay.length == 0) {
      const date = new Date();
      this.contract.sharingStartDayYYYY = String(date.getFullYear());
      this.contract.sharingStartDayMMDD = '0101';
    }
    this.contract.sharingEndDayMap = Converter.stringToDate(this.contract.sharingEndDay, 'yyyyMMdd');
    
    // 分担期間（買主）（開始）
    if(this.contract.sharingEndDayMap != null)
    {
      const dt = this.contract.sharingEndDayMap;
      // 1日後
      dt.setDate(dt.getDate() + 1);
      this.sharingStartDayBuyerMap = dt;
      this.contract.sharingEndDayMap = Converter.stringToDate(this.contract.sharingEndDay, 'yyyyMMdd');// 元に戻す
    }

    this.oldFixedTaxMap = this.contract.fixedTaxMap;
    this.oldFixedLandTaxMap = this.contract.fixedLandTaxMap;
    this.oldFixedBuildingTaxMap = this.contract.fixedBuildingTaxMap;
    this.oldFixedBuildingTaxOnlyTaxMap = this.contract.fixedBuildingTaxOnlyTaxMap;
    this.changeValue('reducedChk');
  }

  /**
   * チェックボックス変更
   * @param event チェックイベント
   * @param item ：所在地情報
   * @param name ：変更属性
   */
  /*
  changeCheckboxLoc(event, item: Locationinfo, name: string) {
    // 軽減有無
    if(name === 'reducedChk') {
      item.reducedChk = (event.checked ? '1' : '0');
    }
  }
  */

  /**
   * 値変更イベント
   * @param item ：所在地情報
   * @param name 変更属性
   */
  changeValueLoc(item: Locationinfo, name: string) {
    // 評価額
    if(name === 'valuation') {
      item.valuation = Converter.stringToNumber(item.valuationMap);
      if(item.valuation != null && item.valuation > 0) {
        // 固定資産税が未設定の場合
        item.propertyTax = Converter.stringToNumber(item.propertyTaxMap);
        if(item.propertyTax == null || item.propertyTax == 0) {
          item.propertyTax = Math.floor(item.valuation * 0.014);// 小数点以下切り捨て
          item.propertyTaxMap = Converter.numberToString(item.propertyTax);
        }
        // 都市計画税が未設定の場合
        item.cityPlanningTax = Converter.stringToNumber(item.cityPlanningTaxMap);
        if(item.cityPlanningTax == null || item.cityPlanningTax == 0) {
          item.cityPlanningTax = item.valuation * 0.003;
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
    let sharingStartDayMap: Date;
    // 分担期間開始日
    if(name === 'sharingStartDay') {
      if(this.contract.sharingStartDayYYYY != null && this.contract.sharingStartDayYYYY.length > 0) {
        this.contract.sharingStartDay = this.contract.sharingStartDayYYYY.concat(this.contract.sharingStartDayMMDD);
        // 分担期間（買主）（終了）
        if(this.contract.sharingStartDay.length == 8) {
          const dt = parse(this.contract.sharingStartDay, 'yyyyMMdd', new Date());
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
      if(this.contract.sharingEndDayMap != null)
      {
        this.contract.sharingEndDay = Converter.dateToString(this.contract.sharingEndDayMap, 'yyyyMMdd', this.datepipe);
        const dt = this.contract.sharingEndDayMap;
        // 1日後
        dt.setDate(dt.getDate() + 1);
        this.sharingStartDayBuyerMap = dt;
        this.contract.sharingEndDayMap = Converter.stringToDate(this.contract.sharingEndDay, 'yyyyMMdd');// 元に戻す
      }
      else this.sharingStartDayBuyerMap = null;
    }
    // 20210906 S_Add
    // 軽減有無
    else if(name === 'reducedChk') {
      const locs = [];
      // 所在地情報の軽減有無をすべて更新
      this.data.locations.forEach(location => {
        const loc = new Locationinfo(location as Locationinfo);
        loc.reducedChk = this.reducedChk;
        locs.push(loc);
      });
      this.data.locations = locs;
      return;
    }
    else if(name === 'fixedLandTax' || name === 'fixedBuildingTax') {
      this.contract.fixedLandTax = Converter.stringToNumber(this.contract.fixedLandTaxMap);
      this.contract.fixedBuildingTax = Converter.stringToNumber(this.contract.fixedBuildingTaxMap);
      
      // 固都税清算金=固都税清算金（土地）+固都税清算金（建物）+建物分消費税
      this.contract.fixedTax = this.contract.fixedLandTax + this.contract.fixedBuildingTax + this.contract.fixedBuildingTaxOnlyTax;
      this.contract.fixedTaxMap = Converter.numberToString(this.contract.fixedTax);
      return;
    }
    // 20210906 E_Add
    sharingStartDayMap = parse(this.contract.sharingStartDay, 'yyyyMMdd', new Date());

    if(this.sharingStartDayBuyerMap != null && this.sharingEndDayBuyerMap != null) {
      this.sharingDayBuyerCnt = (this.sharingEndDayBuyerMap.getTime() - this.sharingStartDayBuyerMap.getTime()) / 86400000;
      // 分担期間（買主）の日数が0より大きい場合
      if(this.sharingDayBuyerCnt > 0) {
        // 1年の日数
        let sharingYearDayCnt = (this.contract.sharingEndDayMap.getTime() - sharingStartDayMap.getTime()) / 86400000;
        
        // 所在地情報から合計数を取得する
        let totalPropertyTaxLand = 0;         // 合計固定資産税（土地）
        let totalCityPlanningTaxLand = 0;     // 合計都市計画税（土地）
        let totalPropertyTaxBuilding = 0;     // 合計固定資産税（建物）
        let totalCityPlanningTaxBuilding = 0; // 合計都市計画税（建物）
        this.data.locations.forEach(location => {
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
        let calcFixedLandTax = (totalPropertyTaxLand + totalCityPlanningTaxLand) * this.sharingDayBuyerCnt / sharingYearDayCnt;
        calcFixedLandTax = Math.floor(calcFixedLandTax);// 小数点以下切り捨て
        // 自動計算後固都税清算金（建物）=(合計固定資産税（建物）+合計都市計画税（建物）)*分担期間（買主）の日数/1年の日数
        let calcFixedBuildingTax = (totalPropertyTaxBuilding + totalCityPlanningTaxBuilding) * this.sharingDayBuyerCnt / sharingYearDayCnt;
        calcFixedBuildingTax = Math.floor(calcFixedBuildingTax);// 小数点以下切り捨て

        // 建物分消費税
        this.contract.fixedBuildingTaxOnlyTax = Converter.stringToNumber(this.contract.fixedBuildingTaxOnlyTaxMap);

        // 固都税清算金（土地）が未設定の場合
        this.contract.fixedLandTax = Converter.stringToNumber(this.contract.fixedLandTaxMap);
        if(this.contract.fixedLandTax == null || this.contract.fixedLandTax == 0) {
          this.contract.fixedLandTax = calcFixedLandTax;
          this.contract.fixedLandTaxMap = Converter.numberToString(this.contract.fixedLandTax);
        }
        // 固都税清算金（建物）が未設定の場合
        this.contract.fixedBuildingTax = Converter.stringToNumber(this.contract.fixedBuildingTaxMap);
        if(this.contract.fixedBuildingTax == null || this.contract.fixedBuildingTax == 0) {
          this.contract.fixedBuildingTax = calcFixedBuildingTax + this.contract.fixedBuildingTaxOnlyTax;
          this.contract.fixedBuildingTaxMap = Converter.numberToString(this.contract.fixedBuildingTax);
        }
        
        // 固都税清算金=固都税清算金（土地）+固都税清算金（建物）+建物分消費税
        this.contract.fixedTax = this.contract.fixedLandTax + this.contract.fixedBuildingTax + this.contract.fixedBuildingTaxOnlyTax;
        this.contract.fixedTaxMap = Converter.numberToString(this.contract.fixedTax);
      }
    }
  }
  
  /**
   * 登録
   */
  save() {
    // 所在地情報を更新
    this.data.locations.forEach(location => {
      const loc = new Locationinfo(location as Locationinfo);
      loc.convertForSave(this.service.loginUser.userId, this.datepipe);
      this.service.saveLocation(loc);
    });

    this.contract.convertForSave(this.service.loginUser.userId, this.datepipe, true);
    this.service.saveContract(this.contract);

    this.dialogRef.close({data: this.contract});
  }
  
  /**
   * キャンセル
   */
  cancel() {
    this.spinner.hide();
    this.contract.fixedTaxMap = this.oldFixedTaxMap;
    this.contract.fixedLandTaxMap = this.oldFixedLandTaxMap;
    this.contract.fixedBuildingTaxMap = this.oldFixedBuildingTaxMap;
    this.contract.fixedBuildingTaxOnlyTaxMap = this.oldFixedBuildingTaxOnlyTaxMap;
    this.dialogRef.close({data: this.contract});
  }
}
