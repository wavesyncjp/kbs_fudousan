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
import { RentalContract } from '../models/rentalcontract';

@Component({
  selector: 'app-location-detail',
  templateUrl: './calRentalSettlement-detail.component.html',
  styleUrls: ['./calRentalSettlement-detail.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class CalRentalSettlementDetailComponent extends BaseComponent {

  public data: Templandinfo;
  public contract: Contractinfo;
  public renContracts: RentalContract[];

  constructor(public router: Router,
    public service: BackendService,
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<Contractinfo>,
    public dialog: MatDialog,
    public datepipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public req: any) {
    super(router, service, dialog);

    this.contract = req.contract;
    this.data = req.land;
  }

  ngOnInit() {
    super.ngOnInit();
    const funcs = [];

    // 20240221 S_Update
    // this.contract.decisionDayBeginMonthMap = this.contract.decisionDayMap;
    // 買主収益期間開始日が存在した場合
    if (this.contract.buyerRevenueStartDay != null && this.contract.buyerRevenueStartDay != '') {
      this.contract.decisionDayBeginMonthMap = Converter.stringToDate(this.contract.buyerRevenueStartDay, 'yyyyMMdd');
    }
    else {
      this.contract.decisionDayBeginMonthMap = this.contract.decisionDayMap;
    }
    // 20240221 E_Update

    if (this.contract.pid > 0) {
      //賃貸契約取得(計算用)を取得
      let cond = {
        searchFor: 'getRentalContractsForCalc'
        , contractInfoPid: this.contract.pid
      };
      funcs.push(this.service.commonSearch(cond));

      Promise.all(funcs).then(values => {
        this.renContracts = values[0];
        this.convertData();
      });
    }
    else {
      this.renContracts = [];
      this.convertData();
    }

  }

  /**
   * データ編集
   */
  convertData() {
    this.renContracts.forEach(item => {
      item.depositSumMap = this.getNumber(item.deposit) + this.getNumber(item.securityDeposit);
      item.feeSumMap = this.getNumber(item.managementFee) + this.getNumber(item.condoFee);
      item.taxSumMap = this.getNumber(item.rentPriceTax) + this.getNumber(item.managementFeeTax) + this.getNumber(item.condoFeeTax);
    });

    // 20240221 S_Update
    // this.contract.decisionDayEndMonthMap = this.getEndOfMonth(this.contract.decisionDayBeginMonthMap);
    // 買主収益期間開始日と買主収益期間終了日が存在していない場合
    if ((this.contract.buyerRevenueStartDay == null || this.contract.buyerRevenueStartDay == '') && (this.contract.buyerRevenueEndDay == null || this.contract.buyerRevenueEndDay == '')) {
      this.contract.decisionDayEndMonthMap = this.getEndOfMonth(this.contract.decisionDayBeginMonthMap);
    }
    else {
      this.contract.decisionDayEndMonthMap = Converter.stringToDate(this.contract.buyerRevenueEndDay, 'yyyyMMdd');
    }
    // 20240221 E_Update

    this.calcForRentPrice();
  }

  calcForRentPrice() {
    let days = this.differenceInDays(this.contract.decisionDayBeginMonthMap, this.contract.decisionDayEndMonthMap);

    this.contract.rentPriceNoPayTaxMap = Converter.numberToString(this.renContracts.filter(a => a.taxSumMap == 0).reduce((a, currentValue) => a + this.getNumber(currentValue.rentPrice), 0) * days);
    this.contract.rentPricePayTaxMap = Converter.numberToString(this.renContracts.filter(a => a.taxSumMap > 0).reduce((a, currentValue) => a + this.getNumber(currentValue.rentPrice), 0) * days);
    this.contract.rentPriceTaxMap = Converter.numberToString(this.renContracts.filter(a => a.taxSumMap > 0).reduce((a, currentValue) => a + currentValue.taxSumMap, 0) * days);
  }

  getEndOfMonth(date) {
    if (date != null) {
      const year = date.getFullYear();
      const month = date.getMonth();

      const nextMonthDate = new Date(year, month + 1, 0);

      return nextMonthDate;
    }
    return null;
  }

  differenceInDays(date1, date2) {
    if (date1 == null || date2 == null) {
      return 0;
    }
    const utcDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utcDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

    if (utcDate1 > utcDate2) {
      return 0;
    }

    const diffInMs = Math.abs(utcDate2 - utcDate1);
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }

  /**
   * 数値にカンマを付ける作業
   */
  changeNumeric(val) {
    val = this.numberFormat(val);
    return val;
  }

  /**
   * 登録
   */
  save() {

    // 20240226 S_Add
    this.convertForSave();
    this.contract.convertForSave(this.service.loginUser.userId, this.datepipe, true);
    // 20240226 E_Add

    this.contract.rentalSettlementMap = Converter.numberToString(Converter.stringToNumber(this.contract.rentPriceNoPayTaxMap)
      + Converter.stringToNumber(this.contract.rentPricePayTaxMap)
      + Converter.stringToNumber(this.contract.rentPriceTaxMap)
    );

    let depositSum = this.renContracts.reduce((a, currentValue) => a + currentValue.depositSumMap, 0);
    this.contract.successionDepositMap = Converter.numberToString(depositSum);
    // 20240221 S_Add
    this.contract.buyerRevenueStartDay = Converter.dateToString(this.contract.decisionDayBeginMonthMap, 'yyyyMMdd', this.datepipe);
    this.contract.buyerRevenueEndDay = Converter.dateToString(this.contract.decisionDayEndMonthMap, 'yyyyMMdd', this.datepipe);
    // 20240221 E_Add

    // 20240226 S_Add
    this.service.saveContract(this.contract);
    // 20240226 E_Add

    this.dialogRef.close({ data: this.contract });
  }


  /**
   * キャンセル
   */
  cancel() {
    this.spinner.hide();
    this.dialogRef.close({ data: this.contract });
  }

  // 20240226 S_Add  
  /**
   * 登録の為の変換
   */
  convertForSave() {
    const addList = [];
    this.data.locations.forEach(loc => {
      //契約データ構成
      let lst = [];
      if (!this.isBlank(loc.contractDetail.contractDataType)) {
        loc.contractDetail.locationInfoPid = loc.pid;
        lst.push(loc.contractDetail);
        //不可分、低地両方チェック
        if (loc.contractDetail.contractDataType === '03' && loc.contractDetail02 === '02') {
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
      if (detailList.length > 0) {
        //削除
        if (lst.length === 0) {
          detailList.forEach(me => {
            me.deleteUserId = this.service.loginUser.userId;
          });
        }
        else {
          //上書き
          if (detailList.length === lst.length) {
            for (let index = 0; index < detailList.length; index++) {
              detailList[index] = lst[index];
            }
          }
          else {
            detailList[0] = lst[0]; //1件目
            //1件削除
            if (detailList.length > lst.length) {
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
  // 20240226 E_Add  
}
