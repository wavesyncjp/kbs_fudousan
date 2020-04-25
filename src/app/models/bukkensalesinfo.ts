


import { DatePipe } from '@angular/common';

import { parse } from 'date-fns';

export class Bukkensalesinfo {

    pid: number;
    tempLandInfoPid: number;
    salesType: string;
    salesName: string;
    salesLocation: string;
    salesAddress: string;
    salesContractDay: string;
    salesContractSchDay: string;
    salesTradingPrice: string;
    salesDecisionSchDay: string;
    salesDecisionPrice: string;
    salesDecisionDay: string;
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
        
        
    }
}




