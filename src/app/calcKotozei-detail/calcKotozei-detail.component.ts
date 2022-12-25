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
import { Contractdetailinfo } from '../models/contractdetailinfo';
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
  public contract: Contractinfo;
  public locations: Locationinfo[];

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
              @Inject(MAT_DIALOG_DATA) public req: any) {
      super(router, service,dialog);

      this.contract = req.contract;
      this.data = req.land;
      //this.data = new Templandinfo();
      //this.data.locations = [];
  }

  ngOnInit() {
    super.ngOnInit();
    const funcs = [];

    funcs.push(this.service.getCodes(['007', '035', '036']));
//    funcs.push(this.service.getContract(this.contract.pid));

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
      //this.data = new Templandinfo(values[1].land as Templandinfo);
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
      //const lst = this.contract.details.filter(dt => dt.locationInfoPid === loc.pid && dt.contractDataType === '01');
      //if (lst.length > 0) {
      if (loc.contractDetail.contractDataType  === '01') {
        newLoc.convert();
        if(newLoc.reducedChk != null && newLoc.reducedChk.length > 0) this.reducedChk = newLoc.reducedChk;// 軽減有無
        locs.push(newLoc);
      }
    });
    //this.data.locations = locs;
    this.locations = locs;

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
    // 20220521 S_Update
    /*
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
    */
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
    // 20220521 E_Update
    this.changeValue('changeValueLoc');// 20220603 Add
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
    let isRecalculationFixed = false;// 20220517 Add
    let sharingStartDayMap: Date;
    // 分担期間開始日
    if(name === 'sharingStartDay') {
      if(this.contract.sharingStartDayYYYY != null && this.contract.sharingStartDayYYYY.length > 0) {
        // 20220517 S_Add
        if(this.contract.sharingStartDay != this.contract.sharingStartDayYYYY.concat(this.contract.sharingStartDayMMDD)) {
          isRecalculationFixed = true;
        }
        // 20220517 E_Add
        
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
        // 20220517 S_Add
        if(this.contract.sharingEndDay != Converter.dateToString(this.contract.sharingEndDayMap, 'yyyyMMdd', this.datepipe)) {
          isRecalculationFixed = true;
        }
        // 20220517 E_Add

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
      //this.data.locations.forEach(location => {
      this.locations.forEach(location => {
        const loc = new Locationinfo(location as Locationinfo);
        loc.reducedChk = this.reducedChk;
        locs.push(loc);
      });
      //this.data.locations = locs;
      this.locations = locs;
      return;
    }
    // 固都税清算金（土地）もしくは、固都税清算金（建物）
    else if(name === 'fixedLandTax' || name === 'fixedBuildingTax') {
      this.contract.fixedLandTax = Converter.stringToNumber(this.contract.fixedLandTaxMap);
      this.contract.fixedBuildingTax = Converter.stringToNumber(this.contract.fixedBuildingTaxMap);
      
      // 固都税清算金=固都税清算金（土地）+固都税清算金（建物）+建物分消費税
      this.contract.fixedTax = this.contract.fixedLandTax + this.contract.fixedBuildingTax + this.contract.fixedBuildingTaxOnlyTax;
      this.contract.fixedTaxMap = Converter.numberToString(this.contract.fixedTax);
      return;
    }
    // 20210906 E_Add
    // 20220603 S_Add
    // 謄本情報の変更もしくは、建物分消費税
    else if(name === 'changeValueLoc' || name === 'fixedBuildingTaxOnlyTax') {
      isRecalculationFixed = true;
    }
    // 20220603 E_Add
    sharingStartDayMap = parse(this.contract.sharingStartDay, 'yyyyMMdd', new Date());

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
        //this.data.locations.forEach(location => {
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
        let calcFixedLandTax = (totalPropertyTaxLand + totalCityPlanningTaxLand) * this.sharingDayBuyerCnt / sharingYearDayCnt;
        calcFixedLandTax = Math.floor(calcFixedLandTax);// 小数点以下切り捨て
        // 自動計算後固都税清算金（建物）=(合計固定資産税（建物）+合計都市計画税（建物）)*分担期間（買主）の日数/1年の日数
        let calcFixedBuildingTax = (totalPropertyTaxBuilding + totalCityPlanningTaxBuilding) * this.sharingDayBuyerCnt / sharingYearDayCnt;
        calcFixedBuildingTax = Math.floor(calcFixedBuildingTax);// 小数点以下切り捨て

        // 建物分消費税
        this.contract.fixedBuildingTaxOnlyTax = Converter.stringToNumber(this.contract.fixedBuildingTaxOnlyTaxMap);

        // 20220603 S_Add
        // 【ノート】
        // 再計算対象の場合、固都税清算金を初期化する

        if(isRecalculationFixed) {
          // 固都税清算金（土地）を初期化
          this.contract.fixedLandTaxMap = null;
          this.contract.fixedLandTax = null;
          // 固都税清算金（建物）を初期化
          this.contract.fixedBuildingTaxMap = null;
          this.contract.fixedBuildingTax = null;
        }
        // 20220603 E_Add

        // 固都税清算金（土地）が未設定の場合
        this.contract.fixedLandTax = Converter.stringToNumber(this.contract.fixedLandTaxMap);
        if(this.contract.fixedLandTax == null || this.contract.fixedLandTax == 0) {
          this.contract.fixedLandTax = calcFixedLandTax;
          this.contract.fixedLandTaxMap = Converter.numberToString(this.contract.fixedLandTax);
        }
        // 固都税清算金（建物）が未設定の場合
        this.contract.fixedBuildingTax = Converter.stringToNumber(this.contract.fixedBuildingTaxMap);
        if(this.contract.fixedBuildingTax == null || this.contract.fixedBuildingTax == 0) {
          // 20221122 S_Update
          // this.contract.fixedBuildingTax = calcFixedBuildingTax + this.contract.fixedBuildingTaxOnlyTax;
          this.contract.fixedBuildingTax = calcFixedBuildingTax;
          // 20221122 E_Update
          this.contract.fixedBuildingTaxMap = Converter.numberToString(this.contract.fixedBuildingTax);
        }
        // 20220603 S_Delete
        /*
        // 20220517 S_Add
        // 【ノート】
        // 分担期間（売主）に変更があった場合、固都税清算金を初期化する

        if(isResetFixed) {
          // 固都税清算金（土地）を初期化
          this.contract.fixedLandTaxMap = null;
          this.contract.fixedLandTax = null;
          // 固都税清算金（建物）を初期化
          this.contract.fixedBuildingTaxMap = null;
          this.contract.fixedBuildingTax = null;
        }
        // 20220517 E_Add
        */
        // 20220603 E_Delete
        
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
    //this.data.locations.forEach(location => {
    this.locations.forEach(location => {
      const loc = new Locationinfo(location as Locationinfo);
      loc.convertForSave(this.service.loginUser.userId, this.datepipe);
      this.service.saveLocation(loc);
    });

    this.convertForSave();
    this.contract.convertForSave(this.service.loginUser.userId, this.datepipe, true);
    this.service.saveContract(this.contract);

    // 所在地情報を更新
    const locs = [];
    this.data.locations.forEach(loc => {
      let newLoc = new Locationinfo(loc as Locationinfo);
      const lst = this.locations.filter(dt => dt.pid === loc.pid);
      if (lst.length > 0) {
        newLoc = lst[0];
      }
      locs.push(newLoc);
    });
    this.data.locations = locs;

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

  /**
   * 登録の為の変換
   */
  convertForSave() {
    const addList = [];
    this.data.locations.forEach(loc => {
      //契約データ構成
      let lst = [];
      if(!this.isBlank(loc.contractDetail.contractDataType)) {
        loc.contractDetail.locationInfoPid = loc.pid;
        lst.push(loc.contractDetail);
        //不可分、低地両方チェック
        if(loc.contractDetail.contractDataType === '03' && loc.contractDetail02 === '02') {
          let contract02 = JSON.parse(JSON.stringify(loc.contractDetail)) as Contractdetailinfo;
          contract02.pid = 0;
          contract02.contractDataType = '02';
          contract02.contractArea = null;
          contract02.contractHave = 0;
          lst.push(contract02);
        }
      }

      const detailList = this.contract.details.filter(detail => detail.locationInfoPid === loc.pid);
      //更新
      if(detailList.length > 0) {
        //削除
        if(lst.length === 0) {
          detailList.forEach(me => {
            me.deleteUserId = this.service.loginUser.userId;
          });
        }
        else {
          //上書き
          if(detailList.length === lst.length) {
            for(let index = 0 ; index < detailList.length; index++) {
              detailList[index] = lst[index];
            }
          }
          else {
            detailList[0] = lst[0]; //1件目
            //1件削除
            if(detailList.length > lst.length) {
              detailList[1].deleteUserId = this.service.loginUser.userId;
            }
            else {
              addList.push(lst[1]);
            }
          }
        }
        //上書き：End
      }
      //新規
      else {
        lst.forEach(data => {
          addList.push(data);
        });
      }
    });
    
    addList.forEach(data => {
      this.contract.details.push(data);
    });

    // 所有地 (仕入契約登記人情報登録のため)
    this.data.locations.forEach(loc => {
      if (loc.sharers.length > 0) {
        const val = {
          locationInfoPid: loc.pid,
          sharerInfoPid: loc.sharers.map(sr => sr.pid)
        };
        this.contract.locations.push(val);
      }
    });
  }
  // 20220330 S_Add
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
      // 20220521 S_Add
      // 都市計画税評価額に指定がある場合
      if(loc.cityValuation != null && loc.cityValuation > 0) {
        loc.cityPlanningTaxMap = null;// 都市計画税を初期化
        this.changeValueLoc(loc, 'cityValuation');
      }
      // 20220521 E_Add
      locs.push(loc);
    });
    this.locations = locs;

    // 固都税清算金（土地）と固都税清算金（建物）を再計算
    if(this.sharingStartDayBuyerMap != null && this.sharingEndDayBuyerMap != null) {
      this.contract.fixedLandTaxMap = null;// 固都税清算金（土地）を初期化
      this.contract.fixedBuildingTaxMap = null;// 固都税清算金（建物）を初期化
      this.changeValue('');
    }
  }
  // 20220330 E_Add
}
