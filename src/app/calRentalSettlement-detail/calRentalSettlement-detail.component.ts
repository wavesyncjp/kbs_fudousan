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

    this.contract.decisionDayBeginMonthMap = this.contract.decisionDayMap;

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

    this.contract.decisionDayEndMonthMap = this.getEndOfMonth(this.contract.decisionDayBeginMonthMap);

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
    this.contract.rentalSettlementMap = Converter.numberToString(Converter.stringToNumber(this.contract.rentPriceNoPayTaxMap)
      + Converter.stringToNumber(this.contract.rentPricePayTaxMap)
      + Converter.stringToNumber(this.contract.rentPriceTaxMap)
    );

    let depositSum = this.renContracts.reduce((a, currentValue) => a + currentValue.depositSumMap, 0);
    this.contract.successionDepositMap = Converter.numberToString(depositSum);

    this.dialogRef.close({ data: this.contract });
  }


  /**
   * キャンセル
   */
  cancel() {
    this.spinner.hide();
    this.dialogRef.close({ data: this.contract });
  }
}
