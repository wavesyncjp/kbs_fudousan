import { Contractdetailinfo } from './contractdetailinfo';
import { DatePipe } from '@angular/common';
import { ContractFile } from './mapattach';
import { ContractSellerInfo } from './contractsellerinfo';
import { Converter } from '../utils/converter';

export class Contractinfo {
    pid: number;
    tempLandInfoPid: number;
    contractNow: string;
    contractNumber = '';
    contractFormNumber: number;
    contractType: string;
    promptDecideFlg: number;
    promptDecideContent: string;
    indivisibleFlg: number;
    thirdPartyFlg: number;
    equiExchangeFlg: number;
    tradingType: string;
    tradingPrice: number;
    tradingLandPrice: number;
    tradingBuildingPrice: number;
    tradingLeasePrice: number;
    setlementPrice: number;
    deposit1: number;
    deposit1Day: string;
    deposit1DayChk: string;
    deposit2: number;
    deposit2Day: string;
    deposit2DayChk: string;
    earnestPrice: number;
    earnestPriceDay: string;
    earnestPriceDayChk: string;
    tradingBalance: number;
    prioritySalesArea: number;
    prioritySalesFloor: number;
    prioritySalesPlanPrice: number;
    fixedTax: number;
    deliveryFixedDay: string;
    vacationDay: string;
    contractDay: string;
    attachFilePath: string;
    attachFileName: string;
    siteArea: number;
    totalFloorArea: number;
    siteAvailableArea: number;
    structure: string;
    scale: string;
    acquisitionConfirmDay: string;
    startScheduledDay: string;
    prioritySalesAgreementDay: string;
    finishScheduledDay: string;
    deliveryDay: string;
    dependType: string;
    decisionPrice:number;
    decisionDay: string;
    decisionDayChk: string;
    settlementDay: string;
    settlementDayFin: string;
    settlementAfter: string;
    retainage: number;
    retainageDay: string;
    canncellDay: string;
    canncellDayChk: string;
    canncell: string;
    remarks: string;
    contractStaff: string;
    supplierName: string;
    bank: string;
    branchName: string;
    accountType: string;
    accountName: string;
    bankName: string;

    deliveryFixedDayMap: Date = null;
    vacationDayMap: Date = null;
    contractDayMap: Date = null;
    acquisitionConfirmDayMap: Date = null;
    startScheduledDayMap: Date = null;
    prioritySalesAgreementDayMap: Date = null;
    finishScheduledDayMap: Date = null;
    deliveryDayMap: Date = null;
    decisionDayMap: Date = null;
    settlementDayMap: Date = null;
    settlementDayFinMap: Date = null;
    deposit1DayMap: Date = null;
    deposit2DayMap: Date = null;
    earnestPriceDayMap: Date = null;
    canncellDayMap: Date = null;
    retainageDayMap: Date = null;
    
    // 20200709 S_Add
    tradingPriceMap: string = "";
    tradingLandPriceMap: string = "";
    tradingBuildingPriceMap: string = "";
    tradingLeasePriceMap: string = "";
    setlementPriceMap: string = "";
    deposit1Map: string = "";
    deposit2Map: string = "";
    earnestPriceMap: string = "";
    tradingBalanceMap: string = "";
    fixedTaxMap: string = "";
    decisionPriceMap: string = "";
    retainageMap: string = "";
    prioritySalesPlanPriceMap: string = "";
    prioritySalesAreaMap: string = "";
    siteAreaMap: string = "";
    totalFloorAreaMap: string = "";
    siteAvailableAreaMap: string = "";
    prioritySalesFloorMap: string = "";
    // 20200709 E_Add
   
    details: Contractdetailinfo[] = [];
    contractFiles: ContractFile[];
    sellers: ContractSellerInfo[];
    locations = []; // 所有地（保存しない）

    createUserId: number;
    updateUserId: number;

    public constructor(init?: Partial<Contractinfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert() {
        // 20200709 S_Add
        //カレンダー
        this.deliveryFixedDayMap = Converter.stringToDate(this.deliveryFixedDay, 'yyyyMMdd');
        this.vacationDayMap = Converter.stringToDate(this.vacationDay,'yyyyMMdd');
        this.contractDayMap = Converter.stringToDate(this.contractDay,'yyyyMMdd');
        this.acquisitionConfirmDayMap = Converter.stringToDate(this.acquisitionConfirmDay,'yyyyMMdd');
        this.startScheduledDayMap = Converter.stringToDate(this.startScheduledDay,'yyyyMMdd');
        this.prioritySalesAgreementDayMap = Converter.stringToDate(this.prioritySalesAgreementDay,'yyyyMMdd');
        this.finishScheduledDayMap = Converter.stringToDate(this.finishScheduledDay,'yyyyMMdd');
        this.deliveryDayMap = Converter.stringToDate(this.deliveryDay,'yyyyMMdd');
        this.decisionDayMap = Converter.stringToDate(this.decisionDay,'yyyyMMdd');
        this.settlementDayMap = Converter.stringToDate(this.settlementDay,'yyyyMMdd');
        this.settlementDayFinMap = Converter.stringToDate(this.settlementDayFin,'yyyyMMdd');
        this.deposit1DayMap = Converter.stringToDate(this.deposit1Day,'yyyyMMdd');
        this.deposit2DayMap = Converter.stringToDate(this.deposit2Day,'yyyyMMdd');
        this.earnestPriceDayMap = Converter.stringToDate(this.earnestPriceDay,'yyyyMMdd');
        this.canncellDayMap = Converter.stringToDate(this.canncellDay,'yyyyMMdd');
        this.retainageDayMap = Converter.stringToDate(this.retainageDay,'yyyyMMdd');
        //カンマ
        this.tradingPriceMap = Converter.numberToString(this.tradingPrice);
        this.tradingLandPriceMap = Converter.numberToString(this.tradingLandPrice);
        this.tradingBuildingPriceMap = Converter.numberToString(this.tradingBuildingPrice);
        this.tradingLeasePriceMap = Converter.numberToString(this.tradingLeasePrice);
        this.setlementPriceMap = Converter.numberToString(this.setlementPrice);
        this.deposit1Map = Converter.numberToString(this.deposit1);
        this.deposit2Map = Converter.numberToString(this.deposit2);
        this.earnestPriceMap = Converter.numberToString(this.earnestPrice);
        this.tradingBalanceMap = Converter.numberToString(this.tradingBalance);
        this.fixedTaxMap = Converter.numberToString(this.fixedTax);
        this.decisionPriceMap = Converter.numberToString(this.decisionPrice);
        this.retainageMap = Converter.numberToString(this.retainage);
        this.prioritySalesPlanPriceMap = Converter.numberToString(this.prioritySalesPlanPrice);
        this.prioritySalesAreaMap = Converter.numberToString(this.prioritySalesArea);
        this.siteAreaMap = Converter.numberToString(this.siteArea);
        this.totalFloorAreaMap = Converter.numberToString(this.totalFloorArea);
        this.siteAvailableAreaMap = Converter.numberToString(this.siteAvailableArea);
        this.prioritySalesFloorMap = Converter.numberToString(this.prioritySalesFloor);
        // 20200709 E_Add
    }

    public convertForSave(userId: number, datePipe: DatePipe) {
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        // 20200709 S_Add
        //カレンダー
        this.deliveryFixedDay = Converter.dateToString(this.deliveryFixedDayMap,'yyyyMMdd',datePipe);
        this.vacationDay = Converter.dateToString(this.vacationDayMap,'yyyyMMdd',datePipe);
        this.contractDay = Converter.dateToString(this.contractDayMap,'yyyyMMdd',datePipe);
        this.acquisitionConfirmDay = Converter.dateToString(this.acquisitionConfirmDayMap,'yyyyMMdd',datePipe);
        this.startScheduledDay = Converter.dateToString(this.startScheduledDayMap,'yyyyMMdd',datePipe);
        this.prioritySalesAgreementDay = Converter.dateToString(this.prioritySalesAgreementDayMap,'yyyyMMdd',datePipe);
        this.finishScheduledDay = Converter.dateToString(this.finishScheduledDayMap,'yyyyMMdd',datePipe);
        this.deliveryDay = Converter.dateToString(this.deliveryDayMap,'yyyyMMdd',datePipe);
        this.decisionDay = Converter.dateToString(this.decisionDayMap,'yyyyMMdd',datePipe);
        this.settlementDay = Converter.dateToString(this.settlementDayMap,'yyyyMMdd',datePipe);
        this.settlementDayFin = Converter.dateToString(this.settlementDayFinMap,'yyyyMMdd',datePipe);
        this.deposit1Day = Converter.dateToString(this.deposit1DayMap,'yyyyMMdd',datePipe);
        this.deposit2Day = Converter.dateToString(this.deposit2DayMap,'yyyyMMdd',datePipe);
        this.earnestPriceDay = Converter.dateToString(this.earnestPriceDayMap,'yyyyMMdd',datePipe);
        this.canncellDay = Converter.dateToString(this.canncellDayMap,'yyyyMMdd',datePipe);
        this.retainageDay = Converter.dateToString(this.retainageDayMap,'yyyyMMdd',datePipe);
        //カンマ
        this.tradingPrice = Converter.stringToNumber(this.tradingPriceMap);
        this.tradingLandPrice = Converter.stringToNumber(this.tradingLandPriceMap);
        this.tradingBuildingPrice = Converter.stringToNumber(this.tradingBuildingPriceMap);
        this.tradingLeasePrice = Converter.stringToNumber(this.tradingLeasePriceMap);
        this.setlementPrice = Converter.stringToNumber(this.setlementPriceMap);
        this.deposit1 = Converter.stringToNumber(this.deposit1Map);
        this.deposit2 = Converter.stringToNumber(this.deposit2Map);
        this.earnestPrice = Converter.stringToNumber(this.earnestPriceMap);
        this.tradingBalance = Converter.stringToNumber(this.tradingBalanceMap);
        this.fixedTax = Converter.stringToNumber(this.fixedTaxMap);
        this.decisionPrice = Converter.stringToNumber(this.decisionPriceMap);
        this.retainage = Converter.stringToNumber(this.retainageMap);
        this.prioritySalesPlanPrice = Converter.stringToNumber(this.prioritySalesPlanPriceMap);
        this.prioritySalesArea = Converter.stringToNumber(this.prioritySalesAreaMap);
        this.siteArea = Converter.stringToNumber(this.siteAreaMap);
        this.totalFloorArea = Converter.stringToNumber(this.totalFloorAreaMap);
        this.siteAvailableArea = Converter.stringToNumber(this.siteAvailableAreaMap);
        this.prioritySalesFloor = Converter.stringToNumber(this.prioritySalesFloorMap);
       // 20200709 E_Add
    }
}
