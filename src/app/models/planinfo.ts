import { DatePipe } from '@angular/common';
import {Plandetail} from  './plandetail';
import { Planrentroll } from '../models/Planrentroll';
import { Planrentrolldetail } from '../models/Planrentrolldetail';
import { parse } from 'date-fns';
import { Converter } from '../utils/converter';


export class Planinfo {

    pid: number;
    tempLandInfoPid: number;
    planNumber: string;
    planName = '';
    planStatus: string;
    createDay: string;
    depCode: string;
    userId: string;
    address: string;
    siteAreaBuy: number;
    siteAreaCheck: number;
    buildArea: number;
    entrance: number;
    parking: number;
    underArea: number;
    totalArea: number;
    salesArea: number;
    restrictedArea: string;
    floorAreaRate: string;
    coverageRate: number;
    structureScale: string;
    ground: number;
    underground: number;
    totalUnits: number;
    buysellUnits: number;
    parkingIndoor: number;
    parkingOutdoor: number;
    mechanical: number;
    landOwner: string;
    rightsRelationship: string;
    landContract: string;
    designOffice: string;
    construction: string;
    startDay: string;
    upperWingDay: string;
    completionDay: string;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;
    settlement: number;
    period : string;
    traffic : string;
    scheduledDay: string;
    groundType: string;
    jvRatio: number;
    residentialRate: number;
    landEvaluation: number;
    taxation: number;
    taxationCity: number;  
    buildValuation: number;
    fixedTaxLand: number;
    cityPlanTaxLand: number;
    fixedTaxBuild: number;
    landInterest: number;
    landLoan: number;
    landPeriod: number;
    buildInterest: number;
    buildLoan: number;
    buildPeriod: number;
    cityPlanTaxBuild: number;
    afterTaxation: number;
    afterTaxationCity: number;
    afterFixedTax: number;
    afterCityPlanTax: number;


    createDayMap: Date = null;
    startDayMap: Date = null;
    upperWingDayMap: Date = null;
    completionDayMap: Date = null;
    scheduledDayMap: Date = null;
    

    // 20200518 S_Add
    residentialRateMap: string;
    landEvaluationMap: string;
    taxationMap: string;
    taxationCityMap: string;
    buildValuationMap: string;
    fixedTaxLandMap: string;
    cityPlanTaxLandMap: string;
    fixedTaxBuildMap: string;
    cityPlanTaxBuildMap: string;
    afterTaxationMap: string;
    afterTaxationCityMap: string;
    afterFixedTaxMap: string;
    afterCityPlanTaxMap: string;
    // 20200518 E_Add
    siteAreaBuyMap: string;
    siteAreaCheckMap: string;
    buildAreaMap: string;
    entranceMap: string;
    underAreaMap: string;
    totalAreaMap: string;
    salesAreaMap: string;
    landInterestMap: string;
    landLoanMap: string;
    landPeriodMap: string;
    buildInterestMap: string;
    buildLoanMap: string;
    buildPeriodMap: string;
    parkingMap: string;
    
    details: Plandetail[];
    // 20200422 S_Update
//    rent: Planrentroll[];
    rent: Planrentroll;
    // 20200422 E_Update
    rentdetails: Planrentrolldetail[];

    public constructor(init?: Partial<Planinfo>) {
        Object.assign(this, init);
    }

    public convert() {
        this.createDayMap = Converter.stringToDate(this.createDay, 'yyyyMMdd');
        this.startDayMap = Converter.stringToDate(this.startDay, 'yyyyMMdd');
        this.upperWingDayMap = Converter.stringToDate(this.upperWingDay, 'yyyyMMdd');
        this.completionDayMap = Converter.stringToDate(this.completionDay, 'yyyyMMdd');
        this.scheduledDayMap = Converter.stringToDate(this.scheduledDay, 'yyyyMMdd');

        // 20200518 S_Add
        // 金額を表示する際にカンマ区切りで表示する用に設定
        this.residentialRateMap = Converter.numberToString(this.residentialRate);
        this.landEvaluationMap = Converter.numberToString(this.landEvaluation);
        this.taxationMap = Converter.numberToString(this.taxation);
        this.taxationCityMap = Converter.numberToString(this.taxationCity);
        this.buildValuationMap = Converter.numberToString(this.buildValuation);
        this.fixedTaxLandMap = Converter.numberToString(this.fixedTaxLand);
        this.cityPlanTaxLandMap = Converter.numberToString(this.cityPlanTaxLand);
        this.fixedTaxBuildMap = Converter.numberToString(this.fixedTaxBuild);
        this.cityPlanTaxBuildMap = Converter.numberToString(this.cityPlanTaxBuild);
        this.afterTaxationMap = Converter.numberToString(this.afterTaxation);
        this.afterTaxationCityMap = Converter.numberToString(this.afterTaxationCity);
        this.afterFixedTaxMap = Converter.numberToString(this.afterFixedTax);
        this.afterCityPlanTaxMap = Converter.numberToString(this.afterCityPlanTax);
        this.landLoanMap = Converter.numberToString(this.landLoan);
        this.buildLoanMap = Converter.numberToString(this.buildLoan);
        this.parkingMap = Converter.numberToString(this.parking);
        // 20200630 S_Add
        this.totalAreaMap = Converter.numberToString(this.totalArea);
        this.siteAreaBuyMap = Converter.numberToString(this.siteAreaBuy);
        this.siteAreaCheckMap = Converter.numberToString(this.siteAreaCheck);
        this.buildAreaMap = Converter.numberToString(this.buildArea);
        this.entranceMap = Converter.numberToString(this.entrance);
        this.underAreaMap = Converter.numberToString(this.underArea);
        this.salesAreaMap = Converter.numberToString(this.salesArea);

        // 20200630 E_Add

        this.details.forEach((detail) => {
            detail.priceMap = Converter.numberToString(detail.price);
            detail.routePriceMap = Converter.numberToString(detail.routePrice);
            detail.unitPriceMap = Converter.numberToString(detail.unitPrice);
            detail.priceTaxMap = Converter.numberToString(detail.priceTax);
            detail.valuationMap = Converter.numberToString(detail.valuation);
            detail.rentMap = Converter.numberToString(detail.rent);

        });

        this.rentdetails.forEach((detail) => {
            detail.rentUnitPriceMap = Converter.numberToString(detail.rentUnitPrice);
            detail.spaceMap = Converter.numberToString(detail.space);
            detail.securityDepositMap = Converter.numberToString(detail.securityDeposit);
        });
        
    
    }

    public convertForSave(userId: number , datePipe: DatePipe) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        //20200408_hirano_S
        this.createDay = Converter.dateToString(this.createDayMap,'yyyyMMdd',datePipe);
        this.startDay = Converter.dateToString(this.startDayMap,'yyyyMMdd',datePipe);
        this.upperWingDay = Converter.dateToString(this.upperWingDayMap,'yyyyMMdd',datePipe);
        this.completionDay = Converter.dateToString(this.completionDayMap,'yyyyMMdd',datePipe);
        this.scheduledDay = Converter.dateToString(this.scheduledDayMap,'yyyyMMdd',datePipe);
        //20200408_hirano_E

        // 20200518 S_Add
        // 登録の際はカンマを外すように設定
        this.residentialRate = Converter.stringToNumber(this.residentialRateMap);
        this.landEvaluation = Converter.stringToNumber(this.landEvaluationMap);
        this.taxation = Converter.stringToNumber(this.taxationMap);
        this.taxationCity = Converter.stringToNumber(this.taxationCityMap);
        this.buildValuation = Converter.stringToNumber(this.buildValuationMap);
        this.fixedTaxLand = Converter.stringToNumber(this.fixedTaxLandMap);
        this.cityPlanTaxLand = Converter.stringToNumber(this.cityPlanTaxLandMap);
        this.fixedTaxBuild = Converter.stringToNumber(this.fixedTaxBuildMap);
        this.cityPlanTaxBuild = Converter.stringToNumber(this.cityPlanTaxBuildMap);
        this.afterTaxation = Converter.stringToNumber(this.afterTaxationMap);
        this.afterTaxationCity = Converter.stringToNumber(this.afterTaxationCityMap);
        this.afterFixedTax = Converter.stringToNumber(this.afterFixedTaxMap);
        this.afterCityPlanTax = Converter.stringToNumber(this.afterCityPlanTaxMap);
        this.landLoan = Converter.stringToNumber(this.landLoanMap);
        this.buildLoan = Converter.stringToNumber(this.buildLoanMap);
        this.parking = Converter.stringToNumber(this.parkingMap);

        this.details.forEach((detail) => {
            detail.price = Converter.stringToNumber(detail.priceMap);
            detail.routePrice = Converter.stringToNumber(detail.routePriceMap);
            detail.unitPrice = Converter.stringToNumber(detail.unitPriceMap);
            detail.priceTax = Converter.stringToNumber(detail.priceTaxMap);
            detail.valuation = Converter.stringToNumber(detail.valuationMap);
            detail.rent = Converter.stringToNumber(detail.rentMap);
        });

        this.rentdetails.forEach((detail) => {
            detail.rentUnitPrice = Converter.stringToNumber(detail.rentUnitPriceMap);
            detail.space = Converter.stringToNumber(detail.spaceMap);
            detail.securityDeposit = Converter.stringToNumber(detail.securityDepositMap);
        });
        this.rent.salesExpense1A = Converter.stringToNumber(this.rent.salesExpense1AMap);
        this.rent.salesExpense1B = Converter.stringToNumber(this.rent.salesExpense1BMap);
        this.rent.salesExpense1C = Converter.stringToNumber(this.rent.salesExpense1CMap);
        this.rent.salesExpense1D = Converter.stringToNumber(this.rent.salesExpense1DMap);
        this.rent.salesExpense2A = Converter.stringToNumber(this.rent.salesExpense2AMap);
        this.rent.salesExpense2B = Converter.stringToNumber(this.rent.salesExpense2BMap);
        this.rent.salesExpense2C = Converter.stringToNumber(this.rent.salesExpense2CMap);
        this.rent.salesExpense2D = Converter.stringToNumber(this.rent.salesExpense2DMap);
        this.rent.salesExpense3A = Converter.stringToNumber(this.rent.salesExpense3AMap);
        this.rent.salesExpense3B = Converter.stringToNumber(this.rent.salesExpense3BMap);
        this.rent.salesExpense3C = Converter.stringToNumber(this.rent.salesExpense3CMap);
        this.rent.salesExpense3D = Converter.stringToNumber(this.rent.salesExpense3DMap);
        this.rent.tsuboUnitPriceA = Converter.stringToNumber(this.rent.tsuboUnitPriceAMap);
        this.rent.tsuboUnitPriceB = Converter.stringToNumber(this.rent.tsuboUnitPriceBMap);
        this.rent.tsuboUnitPriceC = Converter.stringToNumber(this.rent.tsuboUnitPriceCMap);
        this.rent.tsuboUnitPriceD = Converter.stringToNumber(this.rent.tsuboUnitPriceDMap);
        this.rent.monthlyOtherIncome = Converter.stringToNumber(this.rent.monthlyOtherIncomeMap);
        this.rent.commonFee = Converter.stringToNumber(this.rent.commonFeeMap);

        // 20200518 E_Add
        // 20200630 S_Add
        this.totalArea = Converter.stringToNumber(this.totalAreaMap);
        this.siteAreaBuy = Converter.stringToNumber(this.siteAreaBuyMap);
        this.siteAreaCheck = Converter.stringToNumber(this.siteAreaCheckMap);
        this.buildArea = Converter.stringToNumber(this.buildAreaMap);
        this.entrance = Converter.stringToNumber(this.entranceMap);
        this.underArea = Converter.stringToNumber(this.underAreaMap);
        this.salesArea = Converter.stringToNumber(this.salesAreaMap);
        // 20200630 E_Add
    }
}




