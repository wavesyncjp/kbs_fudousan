import { Contractdetailinfo } from './contractdetailinfo';
import { DatePipe } from '@angular/common';
import { ContractFile, ContractAttach } from './mapattach';
import { ContractSellerInfo } from './contractsellerinfo';
import { Converter } from '../utils/converter';
import { DepositInfo } from './depositinfo';

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
    // 20231010 S_Add
    rentalSettlement: number;
    successionDeposit: number;
    // 20231010 E_Add
    successionSecurityDeposit: number;// 20240327 Add
    prioritySalesArea: number;
    prioritySalesFloor: number;
    prioritySalesPlanPrice: number;
    fixedTax: number;
    // 20210805 S_Add
    fixedLandTax: number;
    fixedBuildingTax: number;
    // 20210805 E_Add
    // 20210904 S_Add
    fixedBuildingTaxOnlyTax: number;
    sharingStartDay: string;
    sharingEndDay: string;
    // 20210904 E_Add
    deliveryFixedDay: string;
    vacationDay: string;
    contractDay: string;
    decisionPrice: number;
    decisionDay: string;
    decisionDayChk: string;
    settlementDay: string;
    settlementDayFin: string;
    // 20211207 S_Update
    // settlementAfter: string = '1か月';
    settlementAfter: string = '2か月';
    // 20211207 E_Update
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
    // 20230418 S_Add
    canncellDayChkAgree: string;
    canncellDayChkApproval: string;
    // 20230418 E_Add
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
    // 20240221 S_Add
    buyerRevenueStartDay: string;
    buyerRevenueEndDay: string;
    // 20240221 S_Add

    deposit1DayMap: Date = null;
    deposit2DayMap: Date = null;
    // 20210510 S_Add
    deposit3DayMap: Date = null;
    deposit4DayMap: Date = null;
    // 20210510 E_Add
    earnestPriceDayMap: Date = null;
    // 20210904 S_Add
    sharingStartDayYYYY: string;
    sharingStartDayMMDD: string;
    sharingEndDayMap: Date = null;
    // 20210904 E_Add
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
    // 20231010 S_Add
    rentalSettlementMap: string = "";
    successionDepositMap: string = "";
    // 20231010 E_Add
    successionSecurityDepositMap: string = "";// 20240327 Add
    prioritySalesAreaMap: string = "";
    prioritySalesFloorMap: string = "";
    prioritySalesPlanPriceMap: string = "";
    fixedTaxMap: string = "";

    // 20230501 S_Add
    fixedTaxDay: string;
    fixedTaxDayMap: Date = null;
    fixedTaxDayChk: string;
    // 20230501 E_Add

    // 20210805 S_Add
    fixedLandTaxMap: string = "";
    fixedBuildingTaxMap: string = "";
    // 20210805 E_Add
    fixedBuildingTaxOnlyTaxMap: string = "";// 20210904 Add
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
    contractAttaches: ContractAttach[];// 20230227 Add
    sellers: ContractSellerInfo[];
    locations = []; // 所有地（保存しない）
    locationsChangedMap = []; // 20250616 Add 所有地 相続未登記保存のため
    contractStaffMap = [];//20200828 Add
    csvSelected: boolean; //20211107 Add

    createUserId: number;
    updateUserId: number;

    // 20231110 S_Add
    statusMap: string;// 登録状態
    msgMap: string;// NGのメッセージ
    // 20231110 E_Add

    // 20231128 S_Add
    deposit1Chk: string;
    deposit2Chk: string;
    deposit3Chk: string;
    deposit4Chk: string;
    deposit5: number;
    deposit5Day: string;
    deposit5DayChk: string;
    deposit5Chk: string;
    deposit6: number;
    deposit6Day: string;
    deposit6DayChk: string;
    deposit6Chk: string;
    deposit7: number;
    deposit7Day: string;
    deposit7DayChk: string;
    deposit7Chk: string;
    deposit8: number;
    deposit8Day: string;
    deposit8DayChk: string;
    deposit8Chk: string;
    deposit9: number;
    deposit9Day: string;
    deposit9DayChk: string;
    deposit9Chk: string;
    deposit10: number;
    deposit10Day: string;
    deposit10DayChk: string;
    deposit10Chk: string;

    depositsMap: DepositInfo[];
    // 20231128 E_Add

    // 20240123 S_Add
    rentPriceNoPayTaxMap: string = "";// 賃料精算金（非課税分）
    rentPricePayTaxMap: string = "";// 賃料精算金（課税分）
    rentPriceTaxMap: string = "";// 賃料精算金（消費税）
    decisionDayBeginMonthMap: Date = null;
    decisionDayEndMonthMap: Date = null;
    // 20240123 S_Add

    // 20240528 S_Add
    rentalSettlementNoPayTax: number;// 賃料精算金（非課税分）
    rentalSettlementPayTax: number;// 賃料精算金（課税分）
    rentalSettlementTax: number;// 賃料精算金（消費税）
    // 20240528 E_Add

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
        // 20231128 S_Delete
        // this.deposit1DayMap = Converter.stringToDate(this.deposit1Day, 'yyyyMMdd');
        // this.deposit2DayMap = Converter.stringToDate(this.deposit2Day, 'yyyyMMdd');
        // // 20210510 S_Add
        // this.deposit3DayMap = Converter.stringToDate(this.deposit3Day, 'yyyyMMdd');
        // this.deposit4DayMap = Converter.stringToDate(this.deposit4Day, 'yyyyMMdd');
        // // 20210510 E_Add
        // 20231128 E_Delete
        this.earnestPriceDayMap = Converter.stringToDate(this.earnestPriceDay, 'yyyyMMdd');
        this.fixedTaxDayMap = Converter.stringToDate(this.fixedTaxDay, 'yyyyMMdd');// 20230501 Add

        // 20210904 S_Add
        if (this.sharingStartDay != null && this.sharingStartDay.length == 8) {
            this.sharingStartDayYYYY = this.sharingStartDay.substring(0, 4);
            this.sharingStartDayMMDD = this.sharingStartDay.substring(4);
        }
        this.sharingEndDayMap = Converter.stringToDate(this.sharingEndDay, 'yyyyMMdd');
        // 20210904 E_Add
        this.deliveryFixedDayMap = Converter.stringToDate(this.deliveryFixedDay, 'yyyyMMdd');
        this.vacationDayMap = Converter.stringToDate(this.vacationDay, 'yyyyMMdd');
        this.contractDayMap = Converter.stringToDate(this.contractDay, 'yyyyMMdd');
        this.decisionDayMap = Converter.stringToDate(this.decisionDay, 'yyyyMMdd');
        this.settlementDayMap = Converter.stringToDate(this.settlementDay, 'yyyyMMdd');
        this.settlementDayFinMap = Converter.stringToDate(this.settlementDayFin, 'yyyyMMdd');
        this.retainageDayMap = Converter.stringToDate(this.retainageDay, 'yyyyMMdd');
        // 20201218 S_Add
        this.intermediaryPricePayDayMap = Converter.stringToDate(this.intermediaryPricePayDay, 'yyyyMMdd');
        this.outsourcingPricePayDayMap = Converter.stringToDate(this.outsourcingPricePayDay, 'yyyyMMdd');
        // 20201218 E_Add
        this.canncellDayMap = Converter.stringToDate(this.canncellDay, 'yyyyMMdd');
        this.acquisitionConfirmDayMap = Converter.stringToDate(this.acquisitionConfirmDay, 'yyyyMMdd');
        this.startScheduledDayMap = Converter.stringToDate(this.startScheduledDay, 'yyyyMMdd');
        this.prioritySalesAgreementDayMap = Converter.stringToDate(this.prioritySalesAgreementDay, 'yyyyMMdd');
        this.finishScheduledDayMap = Converter.stringToDate(this.finishScheduledDay, 'yyyyMMdd');
        this.deliveryDayMap = Converter.stringToDate(this.deliveryDay, 'yyyyMMdd');
        //カンマ
        this.tradingPriceMap = Converter.numberToString(this.tradingPrice);
        this.tradingLandPriceMap = Converter.numberToString(this.tradingLandPrice);
        this.tradingBuildingPriceMap = Converter.numberToString(this.tradingBuildingPrice);
        this.tradingLeasePriceMap = Converter.numberToString(this.tradingLeasePrice);
        this.tradingTaxPriceMap = Converter.numberToString(this.tradingTaxPrice);// 20201124 Add
        this.setlementPriceMap = Converter.numberToString(this.setlementPrice);
        // 20231128 S_Delete
        // this.deposit1Map = Converter.numberToString(this.deposit1);
        // this.deposit2Map = Converter.numberToString(this.deposit2);
        // // 20210510 S_Add
        // this.deposit3Map = Converter.numberToString(this.deposit3);
        // this.deposit4Map = Converter.numberToString(this.deposit4);
        // // 20210510 E_Add
        // 20231128 E_Delete
        this.earnestPriceMap = Converter.numberToString(this.earnestPrice);
        this.tradingBalanceMap = Converter.numberToString(this.tradingBalance);
        // 20231010 S_Add
        this.rentalSettlementMap = Converter.numberToString(this.rentalSettlement);
        this.successionDepositMap = Converter.numberToString(this.successionDeposit);
        // 20231010 E_Add
        this.successionSecurityDepositMap = Converter.numberToString(this.successionSecurityDeposit);// 20240327 Add
        this.prioritySalesAreaMap = Converter.numberToString(this.prioritySalesArea);
        this.prioritySalesFloorMap = Converter.numberToString(this.prioritySalesFloor);
        this.prioritySalesPlanPriceMap = Converter.numberToString(this.prioritySalesPlanPrice);
        this.fixedTaxMap = Converter.numberToString(this.fixedTax);
        // 20210805 S_Add
        this.fixedLandTaxMap = Converter.numberToString(this.fixedLandTax);
        this.fixedBuildingTaxMap = Converter.numberToString(this.fixedBuildingTax);
        // 20210805 E_Add
        this.fixedBuildingTaxOnlyTaxMap = Converter.numberToString(this.fixedBuildingTaxOnlyTax);// 20210904 Add
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
            this.contractStaffMap = emps.filter(me => this.contractStaff.split(',').indexOf(me.userId) >= 0).map(me => { return { userId: me.userId, userName: me.userName } });
        }
        //20200828 E_Add

        //詳細情報
        this.details.forEach((detail) => {
            detail.contractHaveMap = Converter.numberToString(detail.contractHave);
        });

        // 20230511 S_Add
        if (this.contractAttaches != null) {
            this.contractAttaches.forEach((contractAttach) => {
                contractAttach.attachFileDayMap = Converter.stringToDate(contractAttach.attachFileDay, 'yyyyMMdd');
            });
        }
        // 20230511 E_Add

        // 20231207 S_Update
        // // 20231128 S_Add
        // this.depositsMap = [];

        // for (var i = 1; i <= 10; i++) {
        //     var dep = new DepositInfo();

        //     switch (i) {
        //         case 1:
        //             dep.deposit = this.deposit1;
        //             dep.depositChk = this.deposit1Chk;
        //             dep.depositDay = this.deposit1Day;
        //             dep.depositDayChk = this.deposit1DayChk;
        //             break;
        //         case 2:
        //             dep.deposit = this.deposit2;
        //             dep.depositChk = this.deposit2Chk;
        //             dep.depositDay = this.deposit2Day;
        //             dep.depositDayChk = this.deposit2DayChk;
        //             break;
        //         case 3:
        //             dep.deposit = this.deposit3;
        //             dep.depositChk = this.deposit3Chk;
        //             dep.depositDay = this.deposit3Day;
        //             dep.depositDayChk = this.deposit3DayChk;
        //             break;
        //         case 4:
        //             dep.deposit = this.deposit4;
        //             dep.depositChk = this.deposit4Chk;
        //             dep.depositDay = this.deposit4Day;
        //             dep.depositDayChk = this.deposit4DayChk;
        //             break;
        //         case 5:
        //             dep.deposit = this.deposit5;
        //             dep.depositChk = this.deposit5Chk;
        //             dep.depositDay = this.deposit5Day;
        //             dep.depositDayChk = this.deposit5DayChk;
        //             break;
        //         case 6:
        //             dep.deposit = this.deposit6;
        //             dep.depositChk = this.deposit6Chk;
        //             dep.depositDay = this.deposit6Day;
        //             dep.depositDayChk = this.deposit6DayChk;
        //             break;
        //         case 7:
        //             dep.deposit = this.deposit7;
        //             dep.depositChk = this.deposit7Chk;
        //             dep.depositDay = this.deposit7Day;
        //             dep.depositDayChk = this.deposit7DayChk;
        //             break;
        //         case 8:
        //             dep.deposit = this.deposit8;
        //             dep.depositChk = this.deposit8Chk;
        //             dep.depositDay = this.deposit8Day;
        //             dep.depositDayChk = this.deposit8DayChk;
        //             break;
        //         case 9:
        //             dep.deposit = this.deposit9;
        //             dep.depositChk = this.deposit9Chk;
        //             dep.depositDay = this.deposit9Day;
        //             dep.depositDayChk = this.deposit9DayChk;
        //             break;
        //         case 10:
        //             dep.deposit = this.deposit10;
        //             dep.depositChk = this.deposit10Chk;
        //             dep.depositDay = this.deposit10Day;
        //             dep.depositDayChk = this.deposit10DayChk;
        //             break;
        //     }
        //     this.depositsMap.push(dep);
        // }

        // for (var i = 9; i > 0; i--) {
        //     let dep = this.depositsMap[i];
        //     if ((dep.deposit == null || dep.deposit == 0)
        //         && (dep.depositChk == null || dep.depositChk == "" || dep.depositChk == "0")
        //         && (dep.depositDay == null || dep.depositDay == "")
        //         && (dep.depositDayChk == null || dep.depositDayChk == "" || dep.depositDayChk == "0")
        //     ) {
        //         this.depositsMap.splice(i, 1);
        //     }
        //     else {
        //         break;
        //     }
        // }

        // for (var i = 0; i < this.depositsMap.length; i++) {
        //     //カレンダー
        //     this.depositsMap[i].depositDayMap = Converter.stringToDate(this.depositsMap[i].depositDay, 'yyyyMMdd');
        //     //数字
        //     this.depositsMap[i].depositMap = Converter.numberToString(this.depositsMap[i].deposit);
        // }
        // // 20231128 E_Add
        this.convertDeposits();
        // 20231207 E_Update
    }

    // 20231207 S_Add
    public convertDeposits() {
        this.depositsMap = [];

        for (var i = 1; i <= 10; i++) {
            var dep = new DepositInfo();

            switch (i) {
                case 1:
                    dep.deposit = this.deposit1;
                    dep.depositChk = this.deposit1Chk;
                    dep.depositDay = this.deposit1Day;
                    dep.depositDayChk = this.deposit1DayChk;
                    break;
                case 2:
                    dep.deposit = this.deposit2;
                    dep.depositChk = this.deposit2Chk;
                    dep.depositDay = this.deposit2Day;
                    dep.depositDayChk = this.deposit2DayChk;
                    break;
                case 3:
                    dep.deposit = this.deposit3;
                    dep.depositChk = this.deposit3Chk;
                    dep.depositDay = this.deposit3Day;
                    dep.depositDayChk = this.deposit3DayChk;
                    break;
                case 4:
                    dep.deposit = this.deposit4;
                    dep.depositChk = this.deposit4Chk;
                    dep.depositDay = this.deposit4Day;
                    dep.depositDayChk = this.deposit4DayChk;
                    break;
                case 5:
                    dep.deposit = this.deposit5;
                    dep.depositChk = this.deposit5Chk;
                    dep.depositDay = this.deposit5Day;
                    dep.depositDayChk = this.deposit5DayChk;
                    break;
                case 6:
                    dep.deposit = this.deposit6;
                    dep.depositChk = this.deposit6Chk;
                    dep.depositDay = this.deposit6Day;
                    dep.depositDayChk = this.deposit6DayChk;
                    break;
                case 7:
                    dep.deposit = this.deposit7;
                    dep.depositChk = this.deposit7Chk;
                    dep.depositDay = this.deposit7Day;
                    dep.depositDayChk = this.deposit7DayChk;
                    break;
                case 8:
                    dep.deposit = this.deposit8;
                    dep.depositChk = this.deposit8Chk;
                    dep.depositDay = this.deposit8Day;
                    dep.depositDayChk = this.deposit8DayChk;
                    break;
                case 9:
                    dep.deposit = this.deposit9;
                    dep.depositChk = this.deposit9Chk;
                    dep.depositDay = this.deposit9Day;
                    dep.depositDayChk = this.deposit9DayChk;
                    break;
                case 10:
                    dep.deposit = this.deposit10;
                    dep.depositChk = this.deposit10Chk;
                    dep.depositDay = this.deposit10Day;
                    dep.depositDayChk = this.deposit10DayChk;
                    break;
            }
            this.depositsMap.push(dep);
        }

        for (var i = 9; i > 0; i--) {
            let dep = this.depositsMap[i];
            if ((dep.deposit == null || dep.deposit == 0)
                && (dep.depositChk == null || dep.depositChk == "" || dep.depositChk == "0")
                && (dep.depositDay == null || dep.depositDay == "")
                && (dep.depositDayChk == null || dep.depositDayChk == "" || dep.depositDayChk == "0")
            ) {
                this.depositsMap.splice(i, 1);
            }
            else {
                break;
            }
        }

        for (var i = 0; i < this.depositsMap.length; i++) {
            //カレンダー
            this.depositsMap[i].depositDayMap = Converter.stringToDate(this.depositsMap[i].depositDay, 'yyyyMMdd');
            //数字
            this.depositsMap[i].depositMap = Converter.numberToString(this.depositsMap[i].deposit);
        }
    }
    // 20231207 E_Add

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
        // 20231128 S_Delete
        // this.deposit1Day = Converter.dateToString(this.deposit1DayMap, 'yyyyMMdd', datePipe);
        // this.deposit2Day = Converter.dateToString(this.deposit2DayMap, 'yyyyMMdd', datePipe);
        // // 20210510 S_Add
        // this.deposit3Day = Converter.dateToString(this.deposit3DayMap, 'yyyyMMdd', datePipe);
        // this.deposit4Day = Converter.dateToString(this.deposit4DayMap, 'yyyyMMdd', datePipe);
        // // 20210510 E_Add
        // 20231128 E_Delete
        this.earnestPriceDay = Converter.dateToString(this.earnestPriceDayMap, 'yyyyMMdd', datePipe);
        this.fixedTaxDay = Converter.dateToString(this.fixedTaxDayMap, 'yyyyMMdd', datePipe);// 20230501 Add
        // 20210904 S_Add
        if (this.sharingStartDayYYYY != null && this.sharingStartDayMMDD != null) {
            this.sharingStartDay = this.sharingStartDayYYYY.concat(this.sharingStartDayMMDD);
        }
        this.sharingEndDay = Converter.dateToString(this.sharingEndDayMap, 'yyyyMMdd', datePipe);
        // 20210904 E_Add
        this.deliveryFixedDay = Converter.dateToString(this.deliveryFixedDayMap, 'yyyyMMdd', datePipe);
        this.vacationDay = Converter.dateToString(this.vacationDayMap, 'yyyyMMdd', datePipe);
        this.contractDay = Converter.dateToString(this.contractDayMap, 'yyyyMMdd', datePipe);
        this.decisionDay = Converter.dateToString(this.decisionDayMap, 'yyyyMMdd', datePipe);
        this.settlementDay = Converter.dateToString(this.settlementDayMap, 'yyyyMMdd', datePipe);
        this.settlementDayFin = Converter.dateToString(this.settlementDayFinMap, 'yyyyMMdd', datePipe);
        this.retainageDay = Converter.dateToString(this.retainageDayMap, 'yyyyMMdd', datePipe);
        // 20201218 S_Add
        this.intermediaryPricePayDay = Converter.dateToString(this.intermediaryPricePayDayMap, 'yyyyMMdd', datePipe);
        this.outsourcingPricePayDay = Converter.dateToString(this.outsourcingPricePayDayMap, 'yyyyMMdd', datePipe);
        // 20201218 E_Add
        this.canncellDay = Converter.dateToString(this.canncellDayMap, 'yyyyMMdd', datePipe);
        this.acquisitionConfirmDay = Converter.dateToString(this.acquisitionConfirmDayMap, 'yyyyMMdd', datePipe);
        this.startScheduledDay = Converter.dateToString(this.startScheduledDayMap, 'yyyyMMdd', datePipe);
        this.prioritySalesAgreementDay = Converter.dateToString(this.prioritySalesAgreementDayMap, 'yyyyMMdd', datePipe);
        this.finishScheduledDay = Converter.dateToString(this.finishScheduledDayMap, 'yyyyMMdd', datePipe);
        this.deliveryDay = Converter.dateToString(this.deliveryDayMap, 'yyyyMMdd', datePipe);
        //カンマ
        this.tradingPrice = Converter.stringToNumber(this.tradingPriceMap);
        this.tradingLandPrice = Converter.stringToNumber(this.tradingLandPriceMap);
        this.tradingBuildingPrice = Converter.stringToNumber(this.tradingBuildingPriceMap);
        this.tradingLeasePrice = Converter.stringToNumber(this.tradingLeasePriceMap);
        this.tradingTaxPrice = Converter.stringToNumber(this.tradingTaxPriceMap);// 20201124 Add
        this.setlementPrice = Converter.stringToNumber(this.setlementPriceMap);
        // 20231128 S_Delete
        // this.deposit1 = Converter.stringToNumber(this.deposit1Map);
        // this.deposit2 = Converter.stringToNumber(this.deposit2Map);
        // // 20210510 S_Add
        // this.deposit3 = Converter.stringToNumber(this.deposit3Map);
        // this.deposit4 = Converter.stringToNumber(this.deposit4Map);
        // // 20210510 E_Add
        // 20231128 E_Delete
        this.earnestPrice = Converter.stringToNumber(this.earnestPriceMap);
        this.tradingBalance = Converter.stringToNumber(this.tradingBalanceMap);
        // 20231010 S_Add
        this.rentalSettlement = Converter.stringToNumber(this.rentalSettlementMap);
        this.successionDeposit = Converter.stringToNumber(this.successionDepositMap);
        // 20231010 E_Add
        this.successionSecurityDeposit = Converter.stringToNumber(this.successionSecurityDepositMap);// 20240327 Add
        this.prioritySalesArea = Converter.stringToNumber(this.prioritySalesAreaMap);
        this.prioritySalesFloor = Converter.stringToNumber(this.prioritySalesFloorMap);
        this.prioritySalesPlanPrice = Converter.stringToNumber(this.prioritySalesPlanPriceMap);
        this.fixedTax = Converter.stringToNumber(this.fixedTaxMap);
        // 20210805 S_Add
        this.fixedLandTax = Converter.stringToNumber(this.fixedLandTaxMap);
        this.fixedBuildingTax = Converter.stringToNumber(this.fixedBuildingTaxMap);
        // 20210805 E_Add
        this.fixedBuildingTaxOnlyTax = Converter.stringToNumber(this.fixedBuildingTaxOnlyTaxMap);// 20210904 Add
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
        if (isJoin) {
            this.contractStaff = this.contractStaffMap.map(me => me['userId']).join(',');
        }
        //20200828 E_Add

        //詳細情報
        this.details.forEach((detail) => {
            detail.contractHave = Converter.stringToNumber(detail.contractHaveMap);
        });
        // 20230511 S_Add
        if (this.contractAttaches != null) {
            this.contractAttaches.forEach((contractAttach) => {
                contractAttach.attachFileDay = Converter.dateToString(contractAttach.attachFileDayMap, 'yyyyMMdd', datePipe);
            });
        }
        // 20230511 E_Add
        // 20231128 S_Add
        let depositsMapTemp: DepositInfo[] = [];

        for (var i = 0; i < this.depositsMap.length; i++) {
            depositsMapTemp.push(this.depositsMap[i]);
        }

        for (var i = this.depositsMap.length; i < 10; i++) {
            depositsMapTemp.push(new DepositInfo());
        }

        for (var i = 1; i <= depositsMapTemp.length; i++) {
            var dep = depositsMapTemp[i - 1];
            dep.depositDay = Converter.dateToString(dep.depositDayMap, 'yyyyMMdd', datePipe);
            dep.deposit = Converter.stringToNumber(dep.depositMap);

            switch (i) {
                case 1:
                    this.deposit1 = dep.deposit;
                    this.deposit1Chk = dep.depositChk;
                    this.deposit1Day = dep.depositDay;
                    this.deposit1DayChk = dep.depositDayChk;
                    break;
                case 2:
                    this.deposit2 = dep.deposit;
                    this.deposit2Chk = dep.depositChk;
                    this.deposit2Day = dep.depositDay;
                    this.deposit2DayChk = dep.depositDayChk;
                    break;
                case 3:
                    this.deposit3 = dep.deposit;
                    this.deposit3Chk = dep.depositChk;
                    this.deposit3Day = dep.depositDay;
                    this.deposit3DayChk = dep.depositDayChk;
                    break;
                case 4:
                    this.deposit4 = dep.deposit;
                    this.deposit4Chk = dep.depositChk;
                    this.deposit4Day = dep.depositDay;
                    this.deposit4DayChk = dep.depositDayChk;
                    break;
                case 5:
                    this.deposit5 = dep.deposit;
                    this.deposit5Chk = dep.depositChk;
                    this.deposit5Day = dep.depositDay;
                    this.deposit5DayChk = dep.depositDayChk;
                    break;
                case 6:
                    this.deposit6 = dep.deposit;
                    this.deposit6Chk = dep.depositChk;
                    this.deposit6Day = dep.depositDay;
                    this.deposit6DayChk = dep.depositDayChk;
                    break;
                case 7:
                    this.deposit7 = dep.deposit;
                    this.deposit7Chk = dep.depositChk;
                    this.deposit7Day = dep.depositDay;
                    this.deposit7DayChk = dep.depositDayChk;
                    break;
                case 8:
                    this.deposit8 = dep.deposit;
                    this.deposit8Chk = dep.depositChk;
                    this.deposit8Day = dep.depositDay;
                    this.deposit8DayChk = dep.depositDayChk;
                    break;
                case 9:
                    this.deposit9 = dep.deposit;
                    this.deposit9Chk = dep.depositChk;
                    this.deposit9Day = dep.depositDay;
                    this.deposit9DayChk = dep.depositDayChk;
                    break;
                case 10:
                    this.deposit10 = dep.deposit;
                    this.deposit10Chk = dep.depositChk;
                    this.deposit10Day = dep.depositDay;
                    this.deposit10DayChk = dep.depositDayChk;
                    break;
            }
        }
        // 20231128 E_Add
    }
}
