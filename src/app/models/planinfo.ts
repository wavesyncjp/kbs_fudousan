import { Contractdetailinfo } from './contractdetailinfo';
import { Templandinfo } from './templandinfo';
import { Locationinfo } from './locationinfo';
import { SharerInfo } from './sharer-info';

import { DatePipe } from '@angular/common';
import {Plandetail} from  './plandetail';
import { Planrentroll } from '../models/Planrentroll';
import { Planrentrolldetail } from '../models/Planrentrolldetail';
import { parse } from 'date-fns';

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
    floorAreaRate: number;
    coverageRate: number;
    digestionVolume: number;
    lentable: number;
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
    landInterest: string;
    landLoan: string;
    landPeriod: string;
    buildInterest: string;
    buildLoan: string;
    buildPeriod: string;
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
    landEvaluationMap: String;
    taxationMap: String;
    taxationCityMap: String;
    buildValuationMap: String;
    fixedTaxLandMap: String;
    cityPlanTaxLandMap: String;
    fixedTaxBuildMap: String;
    cityPlanTaxBuildMap: String;
    afterTaxationMap: String;
    afterTaxationCityMap: String;
    afterFixedTaxMap: String;
    afterCityPlanTaxMap: String;
    // 20200518 E_Add
    
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
        if (this.createDay) {
            this.createDayMap = parse(this.createDay, 'yyyyMMdd', new Date());
        }
        if (this.startDay) {
            this.startDayMap = parse(this.startDay, 'yyyyMMdd', new Date());
        }
        if (this.upperWingDay) {
            this.upperWingDayMap = parse(this.upperWingDay, 'yyyyMMdd', new Date());
        }
        if (this.completionDay) {
            this.completionDayMap = parse(this.completionDay, 'yyyyMMdd', new Date());
        }
        if (this.scheduledDay) {
            this.scheduledDayMap = parse(this.scheduledDay, 'yyyyMMdd', new Date());
        }

        // 20200518 S_Add
        // 金額を表示する際にカンマ区切りで表示する用に設定
        if (this.landEvaluation) {
            this.landEvaluationMap = Number(this.landEvaluation).toLocaleString();
        }
        if (this.taxation) {
            this.taxationMap = Number(this.taxation).toLocaleString();
        }
        if (this.taxationCity) {
            this.taxationCityMap = Number(this.taxationCity).toLocaleString();
        }
        if (this.buildValuation) {
            this.buildValuationMap = Number(this.buildValuation).toLocaleString();
        }
        if (this.fixedTaxLand) {
            this.fixedTaxLandMap = Number(this.fixedTaxLand).toLocaleString();
        }
        if (this.cityPlanTaxLand) {
            this.cityPlanTaxLandMap = Number(this.cityPlanTaxLand).toLocaleString();
        }
        if (this.fixedTaxBuild) {
            this.fixedTaxBuildMap = Number(this.fixedTaxBuild).toLocaleString();
        }
        if (this.cityPlanTaxBuild) {
            this.cityPlanTaxBuildMap = Number(this.cityPlanTaxBuild).toLocaleString();
        }
        if (this.afterTaxation) {
            this.afterTaxationMap = Number(this.afterTaxation).toLocaleString();
        }
        if (this.afterTaxationCity) {
            this.afterTaxationCityMap = Number(this.afterTaxationCity).toLocaleString();
        }
        if (this.afterFixedTax) {
            this.afterFixedTaxMap = Number(this.afterFixedTax).toLocaleString();
        }
        if (this.afterCityPlanTax) {
            this.afterCityPlanTaxMap = Number(this.afterCityPlanTax).toLocaleString();
        }

        this.details.forEach((detail) => {
            if (detail.price) {
                detail.price = Number(detail.price).toLocaleString();
                detail.routePrice = Number(detail.routePrice).toLocaleString();
                detail.unitPrice = Number(detail.unitPrice).toLocaleString();
                detail.priceTax = Number(detail.priceTax).toLocaleString();
            }
        });
        // 20200518 E_Add
    }

    public convertForSave(userId: number , datePipe: DatePipe) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        //20200408_hirano_S
        this.createDay = this.createDayMap != null ? datePipe.transform(this.createDayMap, 'yyyyMMdd') : null;
        this.startDay = this.startDayMap != null ? datePipe.transform(this.startDayMap, 'yyyyMMdd') : null;
        this.upperWingDay = this.upperWingDayMap != null ? datePipe.transform(this.upperWingDayMap, 'yyyyMMdd') : null;
        this.completionDay = this.completionDayMap != null ? datePipe.transform(this.completionDayMap, 'yyyyMMdd') : null;
        this.scheduledDay = this.scheduledDayMap != null ? datePipe.transform(this.scheduledDayMap, 'yyyyMMdd') : null;
        //20200408_hirano_E

        // 20200518 S_Add
        // 登録の際はカンマを外すように設定
        this.landEvaluation = this.landEvaluationMap != null ? +this.landEvaluationMap.replace(/,/g, "").trim() : null;
        this.taxation = this.taxationMap != null ? +this.taxationMap.replace(/,/g, "").trim() : null;
        this.taxationCity = this.taxationCityMap != null ? +this.taxationCityMap.replace(/,/g, "").trim() : null;
        this.buildValuation = this.buildValuationMap != null ? +this.buildValuationMap.replace(/,/g, "").trim() : null;
        this.fixedTaxLand = this.fixedTaxLandMap != null ? +this.fixedTaxLandMap.replace(/,/g, "").trim() : null;
        this.cityPlanTaxLand = this.cityPlanTaxLandMap != null ? +this.cityPlanTaxLandMap.replace(/,/g, "").trim() : null;
        this.fixedTaxBuild = this.fixedTaxBuildMap != null ? +this.fixedTaxBuildMap.replace(/,/g, "").trim() : null;
        this.cityPlanTaxBuild = this.cityPlanTaxBuildMap != null ? +this.cityPlanTaxBuildMap.replace(/,/g, "").trim() : null;
        this.afterTaxation = this.afterTaxationMap != null ? +this.afterTaxationMap.replace(/,/g, "").trim() : null;
        this.afterTaxationCity = this.afterTaxationCityMap != null ? +this.afterTaxationCityMap.replace(/,/g, "").trim() : null;
        this.afterFixedTax = this.afterFixedTaxMap != null ? +this.afterFixedTaxMap.replace(/,/g, "").trim() : null;
        this.afterCityPlanTax = this.afterCityPlanTaxMap != null ? +this.afterCityPlanTaxMap.replace(/,/g, "").trim() : null;

        this.details.forEach((detail) => {
            detail.price = detail.price != null ? detail.price.replace(/,/g, "").trim() : null;
            detail.routePrice = detail.routePrice != null ? detail.routePrice.replace(/,/g, "").trim() : null;
            detail.unitPrice = detail.unitPrice != null ? detail.unitPrice.replace(/,/g, "").trim() : null;
            detail.priceTax = detail.priceTax != null ? detail.priceTax.replace(/,/g, "").trim() : null;
        });
        // 20200518 E_Add
    }
}




