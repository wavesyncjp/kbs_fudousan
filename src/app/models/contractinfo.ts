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
    contractStaff: string;
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
    tradingTaxPrice: number;// 20201124 Add
    setlementPrice: number;
    deposit1: number;
    deposit1Day: string;
    deposit1DayChk: string;
    deposit2: number;
    deposit2Day: string;
    deposit2DayChk: string;
    // 20210510 S_Add
    deposit3: number;
    deposit3Day: string;
    deposit3DayChk: string;
    deposit4: number;
    deposit4Day: string;
    deposit4DayChk: string;
    // 20210510 E_Add
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
    decisionPrice:number;
    decisionDay: string;
    decisionDayChk: string;
    settlementDay: string;
    settlementDayFin: string;
    settlementAfter: string = '1か月';
    retainage: number;
    retainageDay: string;
    retainageDayChk: string;// 20210728 Add
    supplierName: string;
    bank: string;
    branchName: string;
    accountType: string;
    accountName: string;
    bankName: string;
    //20200828 S_Add
    intermediaryName: string;
    intermediaryAddress: string;
    intermediaryPrice: number;
    intermediaryPricePayDay: string;// 20201218 Add
    outsourcingName: string;
    outsourcingAddress: string;
    outsourcingPrice: number;
    outsourcingPricePayDay: string;// 20201218 Add
    //20200828 E_Add
    canncellDay: string;
    canncellDayChk: string;
    canncell: string;
    remarks: string;
    attachFilePath: string;
    attachFileName: string;
    siteArea: number;
    siteAvailableArea: number;
    structure: string;
    scale: string;
    totalFloorArea: number;
    acquisitionConfirmDay: string;
    startScheduledDay: string;
    prioritySalesAgreementDay: string;
    finishScheduledDay: string;
    deliveryDay: string;
    dependType: string;
    
    deposit1DayMap: Date = null;
    deposit2DayMap: Date = null;
    // 20210510 S_Add
    deposit3DayMap: Date = null;
    deposit4DayMap: Date = null;
    // 20210510 E_Add
    earnestPriceDayMap: Date = null;
    deliveryFixedDayMap: Date = null;
    vacationDayMap: Date = null;
    contractDayMap: Date = null;
    decisionDayMap: Date = null;
    settlementDayMap: Date = null;
    settlementDayFinMap: Date = null;
    retainageDayMap: Date = null;
    // 20201218 S_Add
    intermediaryPricePayDayMap: Date = null;
    outsourcingPricePayDayMap: Date = null;
    // 20201218 E_Add
    canncellDayMap: Date = null;
    acquisitionConfirmDayMap: Date = null;
    startScheduledDayMap: Date = null;
    prioritySalesAgreementDayMap: Date = null;
    finishScheduledDayMap: Date = null;
    deliveryDayMap: Date = null;
    
    // 20200709 S_Add
    tradingPriceMap: string = "";
    tradingLandPriceMap: string = "";
    tradingBuildingPriceMap: string = "";
    tradingLeasePriceMap: string = "";
    tradingTaxPriceMap: string = "";// 20201124 Add
    setlementPriceMap: string = "";
    deposit1Map: string = "";
    deposit2Map: string = "";
    // 20210510 S_Add
    deposit3Map: string = "";
    deposit4Map: string = "";
    // 20210510 E_Add
    earnestPriceMap: string = "";
    tradingBalanceMap: string = "";
    prioritySalesAreaMap: string = "";
    prioritySalesFloorMap: string = "";
    prioritySalesPlanPriceMap: string = "";
    fixedTaxMap: string = "";
    decisionPriceMap: string = "";
    retainageMap: string = "";
    //20200828 S_Add
    intermediaryPriceMap: string = "";
    outsourcingPriceMap: string = "";
    //20200828 E_Add
    siteAreaMap: string = "";
    siteAvailableAreaMap: string = "";
    totalFloorAreaMap: string = "";
    // 20200709 E_Add
   
    details: Contractdetailinfo[] = [];
    contractFiles: ContractFile[];
    sellers: ContractSellerInfo[];
    locations = []; // 所有地（保存しない）
    contractStaffMap = [];//20200828 Add

    createUserId: number;
    updateUserId: number;

    public constructor(init?: Partial<Contractinfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    //20200828 S_Update
    /*
    public convert() {
    */
    public convert(emps: any[]) {
    //20200828 E_Update
        // 20200709 S_Add
        //カレンダー
        this.deposit1DayMap = Converter.stringToDate(this.deposit1Day,'yyyyMMdd');
        this.deposit2DayMap = Converter.stringToDate(this.deposit2Day,'yyyyMMdd');
        // 20210510 S_Add
        this.deposit3DayMap = Converter.stringToDate(this.deposit3Day,'yyyyMMdd');
        this.deposit4DayMap = Converter.stringToDate(this.deposit4Day,'yyyyMMdd');
        // 20210510 E_Add
        this.earnestPriceDayMap = Converter.stringToDate(this.earnestPriceDay,'yyyyMMdd');
        this.deliveryFixedDayMap = Converter.stringToDate(this.deliveryFixedDay, 'yyyyMMdd');
        this.vacationDayMap = Converter.stringToDate(this.vacationDay,'yyyyMMdd');
        this.contractDayMap = Converter.stringToDate(this.contractDay,'yyyyMMdd');
        this.decisionDayMap = Converter.stringToDate(this.decisionDay,'yyyyMMdd');
        this.settlementDayMap = Converter.stringToDate(this.settlementDay,'yyyyMMdd');
        this.settlementDayFinMap = Converter.stringToDate(this.settlementDayFin,'yyyyMMdd');
        this.retainageDayMap = Converter.stringToDate(this.retainageDay,'yyyyMMdd');
        // 20201218 S_Add
        this.intermediaryPricePayDayMap = Converter.stringToDate(this.intermediaryPricePayDay,'yyyyMMdd');
        this.outsourcingPricePayDayMap = Converter.stringToDate(this.outsourcingPricePayDay,'yyyyMMdd');
        // 20201218 E_Add
        this.canncellDayMap = Converter.stringToDate(this.canncellDay,'yyyyMMdd');
        this.acquisitionConfirmDayMap = Converter.stringToDate(this.acquisitionConfirmDay,'yyyyMMdd');
        this.startScheduledDayMap = Converter.stringToDate(this.startScheduledDay,'yyyyMMdd');
        this.prioritySalesAgreementDayMap = Converter.stringToDate(this.prioritySalesAgreementDay,'yyyyMMdd');
        this.finishScheduledDayMap = Converter.stringToDate(this.finishScheduledDay,'yyyyMMdd');
        this.deliveryDayMap = Converter.stringToDate(this.deliveryDay,'yyyyMMdd');
        //カンマ
        this.tradingPriceMap = Converter.numberToString(this.tradingPrice);
        this.tradingLandPriceMap = Converter.numberToString(this.tradingLandPrice);
        this.tradingBuildingPriceMap = Converter.numberToString(this.tradingBuildingPrice);
        this.tradingLeasePriceMap = Converter.numberToString(this.tradingLeasePrice);
        this.tradingTaxPriceMap = Converter.numberToString(this.tradingTaxPrice);// 20201124 Add
        this.setlementPriceMap = Converter.numberToString(this.setlementPrice);
        this.deposit1Map = Converter.numberToString(this.deposit1);
        this.deposit2Map = Converter.numberToString(this.deposit2);
        // 20210510 S_Add
        this.deposit3Map = Converter.numberToString(this.deposit3);
        this.deposit4Map = Converter.numberToString(this.deposit4);
        // 20210510 E_Add
        this.earnestPriceMap = Converter.numberToString(this.earnestPrice);
        this.tradingBalanceMap = Converter.numberToString(this.tradingBalance);
        this.prioritySalesAreaMap = Converter.numberToString(this.prioritySalesArea);
        this.prioritySalesFloorMap = Converter.numberToString(this.prioritySalesFloor);
        this.prioritySalesPlanPriceMap = Converter.numberToString(this.prioritySalesPlanPrice);
        this.fixedTaxMap = Converter.numberToString(this.fixedTax);
        this.decisionPriceMap = Converter.numberToString(this.decisionPrice);
        this.retainageMap = Converter.numberToString(this.retainage);
        //20200828 S_Add
        this.intermediaryPriceMap = Converter.numberToString(this.intermediaryPrice);
        this.outsourcingPriceMap = Converter.numberToString(this.outsourcingPrice);
        //20200828 E_Add
        this.siteAreaMap = Converter.numberToString(this.siteArea);
        this.siteAvailableAreaMap = Converter.numberToString(this.siteAvailableArea);
        this.totalFloorAreaMap = Converter.numberToString(this.totalFloorArea);
        // 20200709 E_Add
        
        //20200828 S_Add
        if (this.contractStaff !== null && emps != null) {
            this.contractStaffMap = emps.filter(me => this.contractStaff.split(',').indexOf(me.userId) >= 0).map(me => {return {userId: me.userId, userName: me.userName}});
        }
        //20200828 E_Add

        //詳細情報
        this.details.forEach((detail) => {
            detail.contractHaveMap = Converter.numberToString(detail.contractHave);
        });
    }

    //20200828 S_Update
    /*
    public convertForSave(userId: number, datePipe: DatePipe) {
    */
    public convertForSave(userId: number, datePipe: DatePipe, isJoin: boolean = false) {
    //20200828 E_Update
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        // 20200709 S_Add
        //カレンダー
        this.deposit1Day = Converter.dateToString(this.deposit1DayMap,'yyyyMMdd',datePipe);
        this.deposit2Day = Converter.dateToString(this.deposit2DayMap,'yyyyMMdd',datePipe);
        // 20210510 S_Add
        this.deposit3Day = Converter.dateToString(this.deposit3DayMap,'yyyyMMdd',datePipe);
        this.deposit4Day = Converter.dateToString(this.deposit4DayMap,'yyyyMMdd',datePipe);
        // 20210510 E_Add
        this.earnestPriceDay = Converter.dateToString(this.earnestPriceDayMap,'yyyyMMdd',datePipe);
        this.deliveryFixedDay = Converter.dateToString(this.deliveryFixedDayMap,'yyyyMMdd',datePipe);
        this.vacationDay = Converter.dateToString(this.vacationDayMap,'yyyyMMdd',datePipe);
        this.contractDay = Converter.dateToString(this.contractDayMap,'yyyyMMdd',datePipe);
        this.decisionDay = Converter.dateToString(this.decisionDayMap,'yyyyMMdd',datePipe);
        this.settlementDay = Converter.dateToString(this.settlementDayMap,'yyyyMMdd',datePipe);
        this.settlementDayFin = Converter.dateToString(this.settlementDayFinMap,'yyyyMMdd',datePipe);
        this.retainageDay = Converter.dateToString(this.retainageDayMap,'yyyyMMdd',datePipe);
        // 20201218 S_Add
        this.intermediaryPricePayDay = Converter.dateToString(this.intermediaryPricePayDayMap,'yyyyMMdd',datePipe);
        this.outsourcingPricePayDay = Converter.dateToString(this.outsourcingPricePayDayMap,'yyyyMMdd',datePipe);
        // 20201218 E_Add
        this.canncellDay = Converter.dateToString(this.canncellDayMap,'yyyyMMdd',datePipe);
        this.acquisitionConfirmDay = Converter.dateToString(this.acquisitionConfirmDayMap,'yyyyMMdd',datePipe);
        this.startScheduledDay = Converter.dateToString(this.startScheduledDayMap,'yyyyMMdd',datePipe);
        this.prioritySalesAgreementDay = Converter.dateToString(this.prioritySalesAgreementDayMap,'yyyyMMdd',datePipe);
        this.finishScheduledDay = Converter.dateToString(this.finishScheduledDayMap,'yyyyMMdd',datePipe);
        this.deliveryDay = Converter.dateToString(this.deliveryDayMap,'yyyyMMdd',datePipe);
        //カンマ
        this.tradingPrice = Converter.stringToNumber(this.tradingPriceMap);
        this.tradingLandPrice = Converter.stringToNumber(this.tradingLandPriceMap);
        this.tradingBuildingPrice = Converter.stringToNumber(this.tradingBuildingPriceMap);
        this.tradingLeasePrice = Converter.stringToNumber(this.tradingLeasePriceMap);
        this.tradingTaxPrice = Converter.stringToNumber(this.tradingTaxPriceMap);// 20201124 Add
        this.setlementPrice = Converter.stringToNumber(this.setlementPriceMap);
        this.deposit1 = Converter.stringToNumber(this.deposit1Map);
        this.deposit2 = Converter.stringToNumber(this.deposit2Map);
        // 20210510 S_Add
        this.deposit3 = Converter.stringToNumber(this.deposit3Map);
        this.deposit4 = Converter.stringToNumber(this.deposit4Map);
        // 20210510 E_Add
        this.earnestPrice = Converter.stringToNumber(this.earnestPriceMap);
        this.tradingBalance = Converter.stringToNumber(this.tradingBalanceMap);
        this.prioritySalesArea = Converter.stringToNumber(this.prioritySalesAreaMap);
        this.prioritySalesFloor = Converter.stringToNumber(this.prioritySalesFloorMap);
        this.prioritySalesPlanPrice = Converter.stringToNumber(this.prioritySalesPlanPriceMap);
        this.fixedTax = Converter.stringToNumber(this.fixedTaxMap);
        this.decisionPrice = Converter.stringToNumber(this.decisionPriceMap);
        this.retainage = Converter.stringToNumber(this.retainageMap);
        //20200828 S_Add
        this.intermediaryPrice = Converter.stringToNumber(this.intermediaryPriceMap);
        this.outsourcingPrice = Converter.stringToNumber(this.outsourcingPriceMap);
        //20200828 E_Add
        this.siteArea = Converter.stringToNumber(this.siteAreaMap);
        this.siteAvailableArea = Converter.stringToNumber(this.siteAvailableAreaMap);
        this.totalFloorArea = Converter.stringToNumber(this.totalFloorAreaMap);
        // 20200709 E_Add
        
        //20200828 E_Add
        if(isJoin) {
            this.contractStaff = this.contractStaffMap.map(me => me['userId']).join(',');
        }
        //20200828 E_Add

        //詳細情報
        this.details.forEach((detail) => {
            detail.contractHave = Converter.stringToNumber(detail.contractHaveMap);
        });
    }
}
