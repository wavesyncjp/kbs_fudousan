import { Contractdetailinfo } from './contractdetailinfo';
import { DatePipe } from '@angular/common';
import { parse } from 'date-fns';
import { ContractFile } from './mapattach';
import { ContractSellerInfo } from './contractsellerinfo';


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
        if (this.deliveryFixedDay) {
            this.deliveryFixedDayMap = parse(this.deliveryFixedDay, 'yyyyMMdd', new Date());
        }
        if (this.vacationDay) {
            this.vacationDayMap = parse(this.vacationDay, 'yyyyMMdd', new Date());
        }
        if (this.contractDay) {
            this.contractDayMap = parse(this.contractDay, 'yyyyMMdd', new Date());
        }
        if (this.acquisitionConfirmDay) {
            this.acquisitionConfirmDayMap = parse(this.acquisitionConfirmDay, 'yyyyMMdd', new Date());
        }
        if (this.startScheduledDay) {
            this.startScheduledDayMap = parse(this.startScheduledDay, 'yyyyMMdd', new Date());
        }
        if (this.prioritySalesAgreementDay) {
            this.prioritySalesAgreementDayMap = parse(this.prioritySalesAgreementDay, 'yyyyMMdd', new Date());
        }
        if (this.finishScheduledDay) {
            this.finishScheduledDayMap = parse(this.finishScheduledDay, 'yyyyMMdd', new Date());
        }
        if (this.deliveryDay) {
            this.deliveryDayMap = parse(this.deliveryDay, 'yyyyMMdd', new Date());
        }
        if (this.decisionDay) {
            this.decisionDayMap = parse(this.decisionDay, 'yyyyMMdd', new Date());
        }
        if (this.settlementDay) {
            this.settlementDayMap = parse(this.settlementDay, 'yyyyMMdd', new Date());
        }
        if (this.settlementDayFin) {
            this.settlementDayFinMap = parse(this.settlementDayFin, 'yyyyMMdd', new Date());
        }
        if (this.deposit1Day) {
            this.deposit1DayMap = parse(this.deposit1Day, 'yyyyMMdd', new Date());
        }
        if (this.deposit2Day) {
            this.deposit2DayMap = parse(this.deposit2Day, 'yyyyMMdd', new Date());
        }
        if (this.earnestPriceDay) {
            this.earnestPriceDayMap = parse(this.earnestPriceDay, 'yyyyMMdd', new Date());
        }
        if (this.canncellDay) {
            this.canncellDayMap = parse(this.canncellDay, 'yyyyMMdd', new Date());
        }
        if (this.retainageDay) {
            this.retainageDayMap = parse(this.retainageDay, 'yyyyMMdd', new Date());
        }
        //20200828 S_Add
        if (this.contractStaff !== null && emps != null) {
            this.contractStaffMap = emps.filter(me => this.contractStaff.split(',').indexOf(me.userId) >= 0).map(me => {return {userId: me.userId, userName: me.userName}});
        }
        //20200828 E_Add
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

        this.deliveryFixedDay = this.deliveryFixedDayMap != null ? datePipe.transform(this.deliveryFixedDayMap, 'yyyyMMdd') : null;
        this.vacationDay = this.vacationDayMap != null ? datePipe.transform(this.vacationDayMap, 'yyyyMMdd') : null;
        this.contractDay = this.contractDayMap != null ? datePipe.transform(this.contractDayMap, 'yyyyMMdd') : null;
        // tslint:disable-next-line:max-line-length
        this.acquisitionConfirmDay = this.acquisitionConfirmDayMap != null ? datePipe.transform(this.acquisitionConfirmDayMap, 'yyyyMMdd') : null;
        this.startScheduledDay = this.startScheduledDayMap != null ? datePipe.transform(this.startScheduledDayMap, 'yyyyMMdd') : null;
        // tslint:disable-next-line:max-line-length
        this.prioritySalesAgreementDay = this.prioritySalesAgreementDayMap != null ? datePipe.transform(this.prioritySalesAgreementDayMap, 'yyyyMMdd') : null;
        this.finishScheduledDay = this.finishScheduledDayMap != null ? datePipe.transform(this.finishScheduledDayMap, 'yyyyMMdd') : null;
        this.deliveryDay = this.deliveryDayMap != null ? datePipe.transform(this.deliveryDayMap, 'yyyyMMdd') : null;
        //20200212
        this.decisionDay = this.decisionDayMap != null ? datePipe.transform(this.decisionDayMap, 'yyyyMMdd') : null;
        this.settlementDay = this.settlementDayMap != null ? datePipe.transform(this.settlementDayMap, 'yyyyMMdd') : null;
        this.settlementDayFin = this.settlementDayFinMap != null ? datePipe.transform(this.settlementDayFinMap, 'yyyyMMdd') : null;
        this.deposit1Day = this.deposit1DayMap != null ? datePipe.transform(this.deposit1DayMap, 'yyyyMMdd') : null;
        this.deposit2Day = this.deposit2DayMap != null ? datePipe.transform(this.deposit2DayMap, 'yyyyMMdd') : null;
        this.earnestPriceDay = this.earnestPriceDayMap != null ? datePipe.transform(this.earnestPriceDayMap, 'yyyyMMdd') : null;
        this.canncellDay = this.canncellDayMap != null ? datePipe.transform(this.canncellDayMap, 'yyyyMMdd') : null;
        this.retainageDay = this.retainageDayMap != null ? datePipe.transform(this.retainageDayMap, 'yyyyMMdd') : null;
        
        //20200828 E_Add
        if(isJoin) {
            this.contractStaff = this.contractStaffMap.map(me => me['userId']).join(',');
        }
        //20200828 E_Add
    }
}
