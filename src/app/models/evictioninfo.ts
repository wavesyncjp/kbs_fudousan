import { DatePipe } from '@angular/common';
import { Converter } from '../utils/converter';
import { EvictionInfoAttach } from './evictioninfoattach';

export class EvictionInfo {
    pid: number;
    rentalInfoPid: number;
    residentInfoPid: number;
    contractInfoPid: number;
    locationInfoPid: number;
    tempLandInfoPid: number;
    surrenderDate: string;
    surrenderScheduledDate: string;
    evictionFee: number;
    depositType1: string;
    deposit1: number;
    depositPayedDate1: string;
    depositType2: string;
    deposit2: number;
    depositPayedDate2: string;
    remainingType: string;
    remainingFee: number;
    remainingPayedDate: string;
    getAgreementDate: string;
    attachmentAgreementDate: string;
    acquiredAgreementFlg: string;

    // 20231010 S_Add
    successionDeposit: number;
    returnDeposit: number;
    returnDepositDate: string;
    roomRentExemptionStartDate: string;
    // 20231010 E_Add
    agreementCancellationDate: string;// 20231016 Add

    createUserId: number;
    updateUserId: number;

    // 開発用の例↓
    roomNo: string;
    borrowerName: string;

    surrenderDateMap: Date = null;
    surrenderScheduledDateMap: Date = null;
    evictionFeeMap: string;
    deposit1Map: string;
    depositPayedDate1Map: Date = null;
    deposit2Map: string;
    depositPayedDate2Map: Date = null;
    remainingFeeMap: string;
    remainingPayedDateMap: Date = null;
    getAgreementDateMap: Date = null;
    attachmentAgreementDateMap: Date = null;

    // 20231010 S_Add
    successionDepositMap: string;
    returnDepositMap: string;
    returnDepositDateMap: Date = null;
    roomRentExemptionStartDateMap: Date = null;
    // 20231010 E_Add
    agreementCancellationDateMap: Date = null;// 20231016 Add

    evictionFiles: EvictionInfoAttach[];
    // 開発用の例↑
    public constructor(init?: Partial<EvictionInfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert() {
        //カレンダー
        this.surrenderDateMap = Converter.stringToDate(this.surrenderDate, 'yyyyMMdd');
        this.surrenderScheduledDateMap = Converter.stringToDate(this.surrenderScheduledDate, 'yyyyMMdd');
        this.depositPayedDate1Map = Converter.stringToDate(this.depositPayedDate1, 'yyyyMMdd');
        this.depositPayedDate2Map = Converter.stringToDate(this.depositPayedDate2, 'yyyyMMdd');
        this.remainingPayedDateMap = Converter.stringToDate(this.remainingPayedDate, 'yyyyMMdd');
        this.getAgreementDateMap = Converter.stringToDate(this.getAgreementDate, 'yyyyMMdd');
        this.attachmentAgreementDateMap = Converter.stringToDate(this.attachmentAgreementDate, 'yyyyMMdd');
        // 20231010 S_Add
        this.returnDepositDateMap = Converter.stringToDate(this.returnDepositDate, 'yyyyMMdd');
        this.roomRentExemptionStartDateMap = Converter.stringToDate(this.roomRentExemptionStartDate, 'yyyyMMdd');
        // 20231010 E_Add

        // 20231016 S_Add
        this.agreementCancellationDateMap = Converter.stringToDate(this.agreementCancellationDate, 'yyyyMMdd');
        // 20231016 E_Add

        // 数字
        this.evictionFeeMap = Converter.numberToString(this.evictionFee);
        this.deposit1Map = Converter.numberToString(this.deposit1);
        this.deposit2Map = Converter.numberToString(this.deposit2);
        this.remainingFeeMap = Converter.numberToString(this.remainingFee);
        // 20231010 S_Add
        this.successionDepositMap = Converter.numberToString(this.successionDeposit);
        this.returnDepositMap = Converter.numberToString(this.returnDeposit);
        // 20231010 E_Add
    }

    public convertForSave(userId: number, datePipe: DatePipe, isJoin: boolean = false) {
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        //カレンダー
        this.surrenderDate = Converter.dateToString(this.surrenderDateMap, 'yyyyMMdd', datePipe);
        this.surrenderScheduledDate = Converter.dateToString(this.surrenderScheduledDateMap, 'yyyyMMdd', datePipe);
        this.depositPayedDate1 = Converter.dateToString(this.depositPayedDate1Map, 'yyyyMMdd', datePipe);
        this.depositPayedDate2 = Converter.dateToString(this.depositPayedDate2Map, 'yyyyMMdd', datePipe);
        this.remainingPayedDate = Converter.dateToString(this.remainingPayedDateMap, 'yyyyMMdd', datePipe);
        this.getAgreementDate = Converter.dateToString(this.getAgreementDateMap, 'yyyyMMdd', datePipe);
        this.attachmentAgreementDate = Converter.dateToString(this.attachmentAgreementDateMap, 'yyyyMMdd', datePipe);
        // 20231010 S_Add
        this.returnDepositDate = Converter.dateToString(this.returnDepositDateMap, 'yyyyMMdd', datePipe);
        this.roomRentExemptionStartDate = Converter.dateToString(this.roomRentExemptionStartDateMap, 'yyyyMMdd', datePipe);
        // 20231010 E_Add

        // 20231016 S_Add
        this.agreementCancellationDate = Converter.dateToString(this.agreementCancellationDateMap, 'yyyyMMdd', datePipe);
        // 20231016 E_Add

        // 数字
        this.evictionFee = Converter.stringToNumber(this.evictionFeeMap);
        this.deposit1 = Converter.stringToNumber(this.deposit1Map);
        this.deposit2 = Converter.stringToNumber(this.deposit2Map);
        this.remainingFee = Converter.stringToNumber(this.remainingFeeMap);
        // 20231010 S_Add
        this.successionDeposit = Converter.stringToNumber(this.successionDepositMap);
        this.returnDeposit = Converter.stringToNumber(this.returnDepositMap);
        // 20231010 E_Add
    }
}
