import { DatePipe } from '@angular/common';
import { Converter } from '../utils/converter';

export class Bukkensalesinfo {

    pid: number;
    tempLandInfoPid: number;
    salesType: string;
    salesName: string;
    salesLocation: string;
    salesAddress: string;
    salesContractDay: string;
    salesContractSchDay: string;
    salesTradingPrice: number;
    salesDecisionSchDay: string;
    salesDecisionPrice: number;
    salesDecisionDay: string;
    // 20201124 S_Add
    salesTradingLandPrice: number;
    salesTradingBuildingPrice: number;
    salesTradingLeasePrice: number;
    salesTradingTaxPrice: number;
    salesDeposit1: number;
    salesDeposit1Day: string;
    salesDeposit2: number;
    salesDeposit2Day: string;
    salesEarnestPrice: number;
    salesEarnestPriceDay: string;
    // 20201124 E_Add
    // 20201218 S_Add
    salesRetainage: number;
    salesRetainageDay: string;
    // 20201218 E_Add
    salesFixedTax: number;
    salesFixedLandTax: number;
    salesFixedBuildingTax: number;
    salesFixedConsumptionTax: number;
    salesLiquidation1: number;
    salesLiquidation2: number;
    salesLiquidation3: number;
    salesLiquidation4: number;
    salesLiquidation5: number;
    bankPid: string;// 20200904 Add
    salesBrokerageFee: number;
    salesBrokerageFeePayDay: string;// 20201218 Add
    salesLandArea: number;
    salesIntermediary: string;
    salesIntermediaryAddress: string;//20200828 Add
    // 20201124 S_Add
    salesOutsourcingName: string;
    salesOutsourcingAddress: string;
    salesOutsourcingPrice: number;
    // 20201124 E_Add
    salesOutsourcingPricePayDay: string;// 20201218 Add
    salesRemark: string;
    contractFormNumber: string;// 20210319 Add

    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;
    deleteUserId: number;
    
    salesContractDayMap: Date = null;
    salesContractSchDayMap: Date = null;
    salesDecisionSchDayMap: Date = null;
    salesDecisionDayMap: Date = null;
    // 20201124 S_Add
    salesDeposit1DayMap: Date = null;
    salesDeposit2DayMap: Date = null;
    salesEarnestPriceDayMap: Date = null;
    // 20201124 E_Add
    // 20201218 S_Add
    salesRetainageDayMap: Date = null;
    salesBrokerageFeePayDayMap: Date = null;
    salesOutsourcingPricePayDayMap: Date = null;
    // 20201218 E_Add
    
    // 20200713 S_Add
    salesTradingPriceMap: string = "";
    salesDecisionPriceMap: string = "";
    // 20201124 S_Add
    salesTradingLandPriceMap: string = "";
    salesTradingBuildingPriceMap: string = "";
    salesTradingLeasePriceMap: string = "";
    salesTradingTaxPriceMap: string = "";
    salesDeposit1Map: string = "";
    salesDeposit2Map: string = "";
    salesEarnestPriceMap: string = "";
    // 20201124 E_Add
    salesRetainageMap: string = "";// 20201218 Add
    salesFixedTaxMap: string = "";
    salesFixedLandTaxMap: string = "";
    salesFixedBuildingTaxMap: string = "";
    salesFixedConsumptionTaxMap: string = "";
    salesLiquidation1Map: string = "";
    salesLiquidation2Map: string = "";
    salesLiquidation3Map: string = "";
    salesLiquidation4Map: string = "";
    salesLiquidation5Map: string = "";
    salesBrokerageFeeMap: string = "";
    salesLandAreaMap: string = "";
    salesOutsourcingPriceMap: string = "";// 20201124 Add
    // 20200713 E_Add

    salesLocationMap = [];// 20201224 Add
    salesLocationStr: string = "";

    public constructor(init?: Partial<Bukkensalesinfo>) {
        Object.assign(this, init);
    }

    public convert() {
        //カレンダー
        this.salesContractDayMap = Converter.stringToDate(this.salesContractDay, 'yyyyMMdd');
        this.salesContractSchDayMap = Converter.stringToDate(this.salesContractSchDay, 'yyyyMMdd');
        this.salesDecisionSchDayMap = Converter.stringToDate(this.salesDecisionSchDay, 'yyyyMMdd');
        this.salesDecisionDayMap = Converter.stringToDate(this.salesDecisionDay, 'yyyyMMdd');
        // 20201124 S_Add
        this.salesDeposit1DayMap = Converter.stringToDate(this.salesDeposit1Day, 'yyyyMMdd');
        this.salesDeposit2DayMap = Converter.stringToDate(this.salesDeposit2Day, 'yyyyMMdd');
        this.salesEarnestPriceDayMap = Converter.stringToDate(this.salesEarnestPriceDay, 'yyyyMMdd');
        // 20201124 E_Add
        // 20201218 S_Add
        this.salesRetainageDayMap = Converter.stringToDate(this.salesRetainageDay, 'yyyyMMdd');
        this.salesBrokerageFeePayDayMap = Converter.stringToDate(this.salesBrokerageFeePayDay, 'yyyyMMdd');
        this.salesOutsourcingPricePayDayMap = Converter.stringToDate(this.salesOutsourcingPricePayDay, 'yyyyMMdd');
        // 20201218 E_Add
        /*
        if (this.salesContractDay) {
            this.salesContractDayMap = parse(this.salesContractDay, 'yyyyMMdd', new Date());
        }
        if (this.salesContractSchDay) {
            this.salesContractSchDayMap = parse(this.salesContractSchDay, 'yyyyMMdd', new Date());
        }

        if (this.salesDecisionSchDay) {
            this.salesDecisionSchDayMap = parse(this.salesDecisionSchDay, 'yyyyMMdd', new Date());
        }
        if (this.salesDecisionDay) {
            this.salesDecisionDayMap = parse(this.salesDecisionDay, 'yyyyMMdd', new Date());
        }
        */
        //カンマ
        // 20200713 S_Add
        this.salesTradingPriceMap = Converter.numberToString(this.salesTradingPrice);
        this.salesDecisionPriceMap = Converter.numberToString(this.salesDecisionPrice);
        this.salesRetainageMap = Converter.numberToString(this.salesRetainage);// 20201218 Add
        this.salesFixedTaxMap = Converter.numberToString(this.salesFixedTax);
        this.salesFixedLandTaxMap = Converter.numberToString(this.salesFixedLandTax);
        this.salesFixedBuildingTaxMap = Converter.numberToString(this.salesFixedBuildingTax);
        this.salesFixedConsumptionTaxMap = Converter.numberToString(this.salesFixedConsumptionTax);
        this.salesLiquidation1Map = Converter.numberToString(this.salesLiquidation1);
        this.salesLiquidation2Map = Converter.numberToString(this.salesLiquidation2);
        this.salesLiquidation3Map = Converter.numberToString(this.salesLiquidation3);
        this.salesLiquidation4Map = Converter.numberToString(this.salesLiquidation4);
        this.salesLiquidation5Map = Converter.numberToString(this.salesLiquidation5);
        this.salesBrokerageFeeMap = Converter.numberToString(this.salesBrokerageFee);
        this.salesLandAreaMap = Converter.numberToString(this.salesLandArea);
        // 20200713 E_Add
        // 20201124 S_Add
        this.salesTradingLandPriceMap = Converter.numberToString(this.salesTradingLandPrice);
        this.salesTradingBuildingPriceMap = Converter.numberToString(this.salesTradingBuildingPrice);
        this.salesTradingLeasePriceMap = Converter.numberToString(this.salesTradingLeasePrice);
        this.salesTradingTaxPriceMap = Converter.numberToString(this.salesTradingTaxPrice);
        this.salesDeposit1Map = Converter.numberToString(this.salesDeposit1);
        this.salesDeposit2Map = Converter.numberToString(this.salesDeposit2);
        this.salesEarnestPriceMap = Converter.numberToString(this.salesEarnestPrice);
        this.salesOutsourcingPriceMap = Converter.numberToString(this.salesOutsourcingPrice);
        // 20201124 E_Add
    }

    public convertForSave(userId: number , datePipe: DatePipe, isDelete: boolean) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

        if(isDelete) {
            this.deleteUserId = userId;
        }
        
        //カレンダー
        this.salesContractDay = Converter.dateToString(this.salesContractDayMap, 'yyyyMMdd', datePipe);
        this.salesContractSchDay = Converter.dateToString(this.salesContractSchDayMap, 'yyyyMMdd', datePipe);
        this.salesDecisionSchDay = Converter.dateToString(this.salesDecisionSchDayMap, 'yyyyMMdd', datePipe);
        this.salesDecisionDay = Converter.dateToString(this.salesDecisionDayMap, 'yyyyMMdd', datePipe);
        // 20201124 S_Add
        this.salesDeposit1Day = Converter.dateToString(this.salesDeposit1DayMap, 'yyyyMMdd', datePipe);
        this.salesDeposit2Day = Converter.dateToString(this.salesDeposit2DayMap, 'yyyyMMdd', datePipe);
        this.salesEarnestPriceDay = Converter.dateToString(this.salesEarnestPriceDayMap, 'yyyyMMdd', datePipe);
        // 20201124 E_Add
        // 20201218 S_Add
        this.salesRetainageDay = Converter.dateToString(this.salesRetainageDayMap, 'yyyyMMdd', datePipe);
        this.salesBrokerageFeePayDay = Converter.dateToString(this.salesBrokerageFeePayDayMap, 'yyyyMMdd', datePipe);
        this.salesOutsourcingPricePayDay = Converter.dateToString(this.salesOutsourcingPricePayDayMap, 'yyyyMMdd', datePipe);
        // 20201218 E_Add
        /*
        this.salesContractDay = this.salesContractDayMap != null ? datePipe.transform(this.salesContractDayMap, 'yyyyMMdd') : null;
        this.salesContractSchDay = this.salesContractSchDayMap != null ? datePipe.transform(this.salesContractSchDayMap, 'yyyyMMdd') : null;
        this.salesDecisionSchDay = this.salesDecisionSchDayMap != null ? datePipe.transform(this.salesDecisionSchDayMap, 'yyyyMMdd') : null;
        this.salesDecisionDay = this.salesDecisionDayMap != null ? datePipe.transform(this.salesDecisionDayMap, 'yyyyMMdd') : null;
        */
        //カンマ
        this.salesTradingPrice = Converter.stringToNumber(this.salesTradingPriceMap);
        this.salesDecisionPrice = Converter.stringToNumber(this.salesDecisionPriceMap);
        this.salesRetainage = Converter.stringToNumber(this.salesRetainageMap);// 20201218 Add
        this.salesFixedTax = Converter.stringToNumber(this.salesFixedTaxMap);
        this.salesFixedLandTax = Converter.stringToNumber(this.salesFixedLandTaxMap);
        this.salesFixedBuildingTax = Converter.stringToNumber(this.salesFixedBuildingTaxMap);
        this.salesFixedConsumptionTax = Converter.stringToNumber(this.salesFixedConsumptionTaxMap);
        this.salesLiquidation1 = Converter.stringToNumber(this.salesLiquidation1Map);
        this.salesLiquidation2 = Converter.stringToNumber(this.salesLiquidation2Map);
        this.salesLiquidation3 = Converter.stringToNumber(this.salesLiquidation3Map);
        this.salesLiquidation4 = Converter.stringToNumber(this.salesLiquidation4Map);
        this.salesLiquidation5 = Converter.stringToNumber(this.salesLiquidation5Map);
        this.salesBrokerageFee = Converter.stringToNumber(this.salesBrokerageFeeMap);
        this.salesLandArea = Converter.stringToNumber(this.salesLandAreaMap);
        // 20201124 S_Add
        this.salesTradingLandPrice = Converter.stringToNumber(this.salesTradingLandPriceMap);
        this.salesTradingBuildingPrice = Converter.stringToNumber(this.salesTradingBuildingPriceMap);
        this.salesTradingLeasePrice = Converter.stringToNumber(this.salesTradingLeasePriceMap);
        this.salesTradingTaxPrice = Converter.stringToNumber(this.salesTradingTaxPriceMap);
        this.salesDeposit1 = Converter.stringToNumber(this.salesDeposit1Map);
        this.salesDeposit2 = Converter.stringToNumber(this.salesDeposit2Map);
        this.salesEarnestPrice = Converter.stringToNumber(this.salesEarnestPriceMap);
        this.salesOutsourcingPrice = Converter.stringToNumber(this.salesOutsourcingPriceMap);
        // 20201124 E_Add

        //20201225 S_Add
        this.salesLocation = this.salesLocationMap.map(me => me['codeDetail']).join(',');
        //20201225 E_Add
    }
}

