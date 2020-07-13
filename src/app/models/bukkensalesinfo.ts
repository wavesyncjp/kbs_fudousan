


import { DatePipe } from '@angular/common';
import { parse } from 'date-fns';
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
    //salesTradingPrice: string;
    salesTradingPrice: number;
    salesDecisionSchDay: string;
    //salesDecisionPrice: string;
    salesDecisionPrice: number;
    salesDecisionDay: string;
    /*
    salesFixedTax: string;
    salesFixedLandTax: string;
    salesFixedBuildingTax: string;
    salesFixedConsumptionTax: string;
    salesLiquidation1: string;
    salesLiquidation2: string;
    salesLiquidation3: string;
    salesLiquidation4: string;
    salesLiquidation5: string;
    salesBrokerageFee: string;
    salesLandArea: string;
    */
    salesFixedTax: number;
    salesFixedLandTax: number;
    salesFixedBuildingTax: number;
    salesFixedConsumptionTax: number;
    salesLiquidation1: number;
    salesLiquidation2: number;
    salesLiquidation3: number;
    salesLiquidation4: number;
    salesLiquidation5: number;
    salesBrokerageFee: number;
    salesLandArea: number;
    salesIntermediary: string;
    salesRemark: string;

    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;
    deleteUserId: number;
    
    salesContractDayMap: Date = null;
    salesContractSchDayMap: Date = null;
    salesDecisionSchDayMap: Date = null;
    salesDecisionDayMap: Date = null;
    
    // 20200713 S_Add
    salesTradingPriceMap: string;
    salesDecisionPriceMap: string;
    salesFixedTaxMap: string;
    salesFixedLandTaxMap: string;
    salesFixedBuildingTaxMap: string;
    salesFixedConsumptionTaxMap: string;
    salesLiquidation1Map: string;
    salesLiquidation2Map: string;
    salesLiquidation3Map: string;
    salesLiquidation4Map: string;
    salesLiquidation5Map: string;
    salesBrokerageFeeMap: string;
    salesLandAreaMap: string;
    // 20200713 E_Add

    public constructor(init?: Partial<Bukkensalesinfo>) {
        Object.assign(this, init);
    }

  public convert() {
        
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
        //カンマ// 20200713 S_Add
        this.salesTradingPriceMap = Converter.numberToString(this.salesTradingPrice);
        this.salesDecisionPriceMap = Converter.numberToString(this.salesDecisionPrice);
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
            
        this.salesContractDay = this.salesContractDayMap != null ? datePipe.transform(this.salesContractDayMap, 'yyyyMMdd') : null;
        this.salesContractSchDay = this.salesContractSchDayMap != null ? datePipe.transform(this.salesContractSchDayMap, 'yyyyMMdd') : null;
        this.salesDecisionSchDay = this.salesDecisionSchDayMap != null ? datePipe.transform(this.salesDecisionSchDayMap, 'yyyyMMdd') : null;
        this.salesDecisionDay = this.salesDecisionDayMap != null ? datePipe.transform(this.salesDecisionDayMap, 'yyyyMMdd') : null;

        //カンマ
        this.salesTradingPrice = Converter.stringToNumber(this.salesTradingPriceMap);
        this.salesDecisionPrice = Converter.stringToNumber(this.salesDecisionPriceMap);
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
        
        
    }
}

