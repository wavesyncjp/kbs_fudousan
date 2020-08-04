import { DatePipe } from '@angular/common';
import { Plandetail} from  './plandetail';
import { Planrentroll } from '../models/Planrentroll';
import { Planrentrolldetail } from '../models/Planrentrolldetail';
import { Converter } from '../utils/converter';

export class Planinfo {

    pid: number;
    tempLandInfoPid: number;
    planNumber: string;
    planName: string;
    planStatus: string;
    createDay: string;
    depCode: string;
    userId: string;
    settlement: number;
    period : string;
    address: string;
    traffic : string;
    siteAreaBuy: number;
    siteAreaCheck: number;
    buildArea: number;
    entrance: number;
    parking: number;
    underArea: number;
    totalArea: number;
    salesArea: number;
    groundType: string;
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
    scheduledDay: string;
    landContract: string;
    designOffice: string;
    construction: string;
    startDay: string;
    upperWingDay: string;
    completionDay: string;
    jvRatio: number;
    residentialRate: number;
    landEvaluation: number;
    taxation: number;
    taxationCity: number;
    buildValuation: number;
    fixedTaxLand: number;
    cityPlanTaxLand: number;
    fixedTaxBuild: number;
    cityPlanTaxBuild: number;
    afterTaxation: number;
    afterTaxationCity: number;
    afterFixedTax: number;
    afterCityPlanTax: number;
    landInterest: number;
    landLoan: number;
    landPeriod: number;
    buildInterest: number;
    buildLoan: number;
    buildPeriod: number;
    createUserId: number;
    createDate: Date;
    updateUserId: number;
    updateDate: Date;
    
    createDayMap: Date;
    scheduledDayMap: Date;
    startDayMap: Date;
    upperWingDayMap: Date;
    completionDayMap: Date;
    
    siteAreaBuyMap: string;
    siteAreaCheckMap: string;
    buildAreaMap: string;
    entranceMap: string;
    parkingMap: string;
    underAreaMap: string;
    totalAreaMap: string;
    salesAreaMap: string;
    groundMap: string;
    undergroundMap: string;
    totalUnitsMap: string;
    buysellUnitsMap: string;
    parkingIndoorMap: string;
    parkingOutdoorMap: string;
    mechanicalMap: string;
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
    landInterestMap: string;
    landLoanMap: string;
    landPeriodMap: string;
    buildInterestMap: string;
    buildLoanMap: string;
    buildPeriodMap: string;
    
    details: Plandetail[];
    rent: Planrentroll;
    rentdetails: Planrentrolldetail[];

    public constructor(init?: Partial<Planinfo>) {
        Object.assign(this, init);
    }

    public convert() {
        //日付
        this.createDayMap = Converter.stringToDate(this.createDay, 'yyyyMMdd');
        this.scheduledDayMap = Converter.stringToDate(this.scheduledDay, 'yyyyMMdd');
        this.startDayMap = Converter.stringToDate(this.startDay, 'yyyyMMdd');
        this.upperWingDayMap = Converter.stringToDate(this.upperWingDay, 'yyyyMMdd');
        this.completionDayMap = Converter.stringToDate(this.completionDay, 'yyyyMMdd');
        
        //数値
        this.siteAreaBuyMap = Converter.numberToString(this.siteAreaBuy);
        this.siteAreaCheckMap = Converter.numberToString(this.siteAreaCheck);
        this.buildAreaMap = Converter.numberToString(this.buildArea);
        this.entranceMap = Converter.numberToString(this.entrance);
        this.parkingMap = Converter.numberToString(this.parking);
        this.underAreaMap = Converter.numberToString(this.underArea);
        this.totalAreaMap = Converter.numberToString(this.totalArea);
        this.salesAreaMap = Converter.numberToString(this.salesArea);
        this.groundMap = Converter.numberToString(this.ground);
        this.undergroundMap = Converter.numberToString(this.underground);
        this.totalUnitsMap = Converter.numberToString(this.totalUnits);
        this.buysellUnitsMap = Converter.numberToString(this.buysellUnits);
        this.parkingIndoorMap = Converter.numberToString(this.parkingIndoor);
        this.parkingOutdoorMap = Converter.numberToString(this.parkingOutdoor);
        this.mechanicalMap = Converter.numberToString(this.mechanical);
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
        this.landInterestMap = Converter.numberToString(this.landInterest);
        this.landLoanMap = Converter.numberToString(this.landLoan);
        this.landPeriodMap = Converter.numberToString(this.landPeriod);
        this.buildInterestMap = Converter.numberToString(this.buildInterest);
        this.buildLoanMap = Converter.numberToString(this.buildLoan);
        this.buildPeriodMap = Converter.numberToString(this.buildPeriod);

        //レントロール情報
        this.rent.salesExpense1AMap = Converter.numberToString(this.rent.salesExpense1A);
        this.rent.salesExpense1BMap = Converter.numberToString(this.rent.salesExpense1B);
        this.rent.salesExpense1CMap = Converter.numberToString(this.rent.salesExpense1C);
        this.rent.salesExpense1DMap = Converter.numberToString(this.rent.salesExpense1D);
        this.rent.salesExpense2AMap = Converter.numberToString(this.rent.salesExpense2A);
        this.rent.salesExpense2BMap = Converter.numberToString(this.rent.salesExpense2B);
        this.rent.salesExpense2CMap = Converter.numberToString(this.rent.salesExpense2C);
        this.rent.salesExpense2DMap = Converter.numberToString(this.rent.salesExpense2D);
        this.rent.salesExpense3AMap = Converter.numberToString(this.rent.salesExpense3A);
        this.rent.salesExpense3BMap = Converter.numberToString(this.rent.salesExpense3B);
        this.rent.salesExpense3CMap = Converter.numberToString(this.rent.salesExpense3C);
        this.rent.salesExpense3DMap = Converter.numberToString(this.rent.salesExpense3D);
        this.rent.tsuboUnitPriceAMap = Converter.numberToString(this.rent.tsuboUnitPriceA);
        this.rent.tsuboUnitPriceBMap = Converter.numberToString(this.rent.tsuboUnitPriceB);
        this.rent.tsuboUnitPriceCMap = Converter.numberToString(this.rent.tsuboUnitPriceC);
        this.rent.tsuboUnitPriceDMap = Converter.numberToString(this.rent.tsuboUnitPriceD);
        this.rent.commonFeeMap = Converter.numberToString(this.rent.commonFee);
        this.rent.monthlyOtherIncomeMap = Converter.numberToString(this.rent.monthlyOtherIncome);

        //計画詳細情報
        this.details.forEach((detail) => {
            detail.routePriceMap = Converter.numberToString(detail.routePrice);
            detail.burdenDaysMap = Converter.numberToString(detail.burdenDays);
            detail.unitPriceMap = Converter.numberToString(detail.unitPrice);
            detail.complePriceMonthMap = Converter.numberToString(detail.complePriceMonth);
            detail.dismantlingMonthMap = Converter.numberToString(detail.dismantlingMonth);
            detail.valuationMap = Converter.numberToString(detail.valuation);
            detail.rentMap = Converter.numberToString(detail.rent);
            detail.totalMonthsMap = Converter.numberToString(detail.totalMonths);
            detail.commissionRateMap = Converter.numberToString(detail.commissionRate);
            detail.priceMap = Converter.numberToString(detail.price);
            detail.priceTaxMap = Converter.numberToString(detail.priceTax);
        });

        //レントロール詳細情報
        this.rentdetails.forEach((detail) => {
            detail.spaceMap = Converter.numberToString(detail.space);
            detail.rentUnitPriceMap = Converter.numberToString(detail.rentUnitPrice);
            detail.securityDepositMap = Converter.numberToString(detail.securityDeposit);
        });
    }

    public convertForSave(userId: number , datePipe: DatePipe) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

        //日付
        this.createDay = Converter.dateToString(this.createDayMap, 'yyyyMMdd', datePipe);
        this.scheduledDay = Converter.dateToString(this.scheduledDayMap, 'yyyyMMdd', datePipe);
        this.startDay = Converter.dateToString(this.startDayMap, 'yyyyMMdd', datePipe);
        this.upperWingDay = Converter.dateToString(this.upperWingDayMap, 'yyyyMMdd', datePipe);
        this.completionDay = Converter.dateToString(this.completionDayMap, 'yyyyMMdd', datePipe);

        //数値
        this.siteAreaBuy = Converter.stringToNumber(this.siteAreaBuyMap);
        this.siteAreaCheck = Converter.stringToNumber(this.siteAreaCheckMap);
        this.buildArea = Converter.stringToNumber(this.buildAreaMap);
        this.entrance = Converter.stringToNumber(this.entranceMap);
        this.parking = Converter.stringToNumber(this.parkingMap);
        this.underArea = Converter.stringToNumber(this.underAreaMap);
        this.totalArea = Converter.stringToNumber(this.totalAreaMap);
        this.salesArea = Converter.stringToNumber(this.salesAreaMap);
        this.ground = Converter.stringToNumber(this.groundMap);
        this.underground = Converter.stringToNumber(this.undergroundMap);
        this.totalUnits = Converter.stringToNumber(this.totalUnitsMap);
        this.buysellUnits = Converter.stringToNumber(this.buysellUnitsMap);
        this.parkingIndoor = Converter.stringToNumber(this.parkingIndoorMap);
        this.parkingOutdoor = Converter.stringToNumber(this.parkingOutdoorMap);
        this.mechanical = Converter.stringToNumber(this.mechanicalMap);
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
        this.landInterest = Converter.stringToNumber(this.landInterestMap);
        this.landLoan = Converter.stringToNumber(this.landLoanMap);
        this.landPeriod = Converter.stringToNumber(this.landPeriodMap);
        this.buildInterest = Converter.stringToNumber(this.buildInterestMap);
        this.buildLoan = Converter.stringToNumber(this.buildLoanMap);
        this.buildPeriod = Converter.stringToNumber(this.buildPeriodMap);

        //レントロール情報
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
        this.rent.commonFee = Converter.stringToNumber(this.rent.commonFeeMap);
        this.rent.monthlyOtherIncome = Converter.stringToNumber(this.rent.monthlyOtherIncomeMap);

        //計画詳細情報
        this.details.forEach((detail) => {
            detail.routePrice = Converter.stringToNumber(detail.routePriceMap);
            detail.burdenDays = Converter.stringToNumber(detail.burdenDaysMap);
            detail.unitPrice = Converter.stringToNumber(detail.unitPriceMap);
            detail.complePriceMonth = Converter.stringToNumber(detail.complePriceMonthMap);
            detail.dismantlingMonth = Converter.stringToNumber(detail.dismantlingMonthMap);
            detail.valuation = Converter.stringToNumber(detail.valuationMap);
            detail.rent = Converter.stringToNumber(detail.rentMap);
            detail.totalMonths = Converter.stringToNumber(detail.totalMonthsMap);
            detail.commissionRate = Converter.stringToNumber(detail.commissionRateMap);
            detail.price = Converter.stringToNumber(detail.priceMap);
            detail.priceTax = Converter.stringToNumber(detail.priceTaxMap);
        });

        //レントロール詳細情報
        this.rentdetails.forEach((detail) => {
            detail.space = Converter.stringToNumber(detail.spaceMap);
            detail.rentUnitPrice = Converter.stringToNumber(detail.rentUnitPriceMap);
            detail.securityDeposit = Converter.stringToNumber(detail.securityDepositMap);
        });
    }
}
