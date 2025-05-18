import { DatePipe } from '@angular/common';
import { Converter } from '../utils/converter';
import { EvictionInfoAttach } from './evictioninfoattach';
import { EvictionDepositInfo } from './evictiondeposittinfo';

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
    deposit1PayedFlg: string;// 20250418 Add
    depositType2: string;
    deposit2: number;
    depositPayedDate2: string;
    deposit2PayedFlg: string;// 20250418 Add
    remainingType: string;
    remainingFee: number;
    remainingPayedDate: string;
    remainingPayedFlg: string;// 20250418 Add
    getAgreementDate: string;
    attachmentAgreementDate: string;
    acquiredAgreementFlg: string;

    // 20231010 S_Add
    successionDeposit: number;
    returnDepositType: string;// 20231027 Add
    returnDeposit: number;
    returnDepositDate: string;
    roomRentExemptionStartDate: string;
    // 20231010 E_Add
    agreementCancellationDate: string;// 20231016 Add

    // 20240402 S_Add
    returnDepositFlg: string;
    evictionDepositType1: string;
    evictionDepositType2: string;
    evictionDepositType3: string;
    evictionDepositType4: string;
    evictionDepositType5: string;
    evictionDepositType6: string;
    evictionDepositType7: string;
    depositType4: string;
    deposit4: number;
    depositPayedDate4: string;
    deposit4PayedFlg: string;// 20250418 Add
    depositType5: string;
    deposit5: number;
    depositPayedDate5: string;
    deposit5PayedFlg: string;// 20250418 Add
    depositType6: string;
    deposit6: number;
    depositPayedDate6: string;
    deposit6PayedFlg: string;// 20250418 Add
    depositType7: string;
    deposit7: number;
    depositPayedDate7: string;
    deposit7PayedFlg: string;// 20250418 Add
    // 20240402 E_Add
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
    // 20231027 S_Add
    statusMap: string;// 登録状態
    msgMap: string;// NGのメッセージ
    // 20231027 E_Add

    evictionFiles: EvictionInfoAttach[];
    evictionInfoAttachCountMap: number;// 20250418 Add
    depositsMap: EvictionDepositInfo[] = [];// 20240402
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

        this.convertDeposits();// 20240402 Add
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


        // 20240402 S_Add
        let depositsMapTemp: EvictionDepositInfo[] = [];

        for (var i = 0; i < this.depositsMap.length; i++) {
            depositsMapTemp.push(this.depositsMap[i]);
        }

        for (var i = this.depositsMap.length; i < 7; i++) {
            depositsMapTemp.push(new EvictionDepositInfo());
        }

        for (var i = 1; i <= depositsMapTemp.length; i++) {
            var dep = depositsMapTemp[i - 1];
            dep.depositPayedDate = Converter.dateToString(dep.depositPayedDateMap, 'yyyyMMdd', datePipe);
            dep.deposit = Converter.stringToNumber(dep.depositMap);

            switch (i) {
                case 1:
                    this.evictionDepositType1 = dep.evictionDepositType;
                    this.depositType1 = dep.depositType;
                    this.deposit1 = dep.deposit;
                    this.depositPayedDate1 = dep.depositPayedDate;
                    this.deposit1PayedFlg = dep.depositPayedFlg;// 20250418 Add
                    break;
                case 2:
                    this.evictionDepositType2 = dep.evictionDepositType;
                    this.depositType2 = dep.depositType;
                    this.deposit2 = dep.deposit;
                    this.depositPayedDate2 = dep.depositPayedDate;
                    this.deposit2PayedFlg = dep.depositPayedFlg;// 20250418 Add
                    break;
                case 3:
                    this.evictionDepositType3 = dep.evictionDepositType;
                    this.remainingType = dep.depositType;
                    this.remainingFee = dep.deposit;
                    this.remainingPayedDate = dep.depositPayedDate;
                    this.remainingPayedFlg = dep.depositPayedFlg;// 20250418 Add
                    break;
                case 4:
                    this.evictionDepositType4 = dep.evictionDepositType;
                    this.depositType4 = dep.depositType;
                    this.deposit4 = dep.deposit;
                    this.depositPayedDate4 = dep.depositPayedDate;
                    this.deposit4PayedFlg = dep.depositPayedFlg;// 20250418 Add
                    break;
                case 5:
                    this.evictionDepositType5 = dep.evictionDepositType;
                    this.depositType5 = dep.depositType;
                    this.deposit5 = dep.deposit;
                    this.depositPayedDate5 = dep.depositPayedDate;
                    this.deposit5PayedFlg = dep.depositPayedFlg;// 20250418 Add
                    break;
                case 6:
                    this.evictionDepositType6 = dep.evictionDepositType;
                    this.depositType6 = dep.depositType;
                    this.deposit6 = dep.deposit;
                    this.depositPayedDate6 = dep.depositPayedDate;
                    this.deposit6PayedFlg = dep.depositPayedFlg;// 20250418 Add
                    break;
                case 7:
                    this.evictionDepositType7 = dep.evictionDepositType;
                    this.depositType7 = dep.depositType;
                    this.deposit7 = dep.deposit;
                    this.depositPayedDate7 = dep.depositPayedDate;
                    this.deposit7PayedFlg = dep.depositPayedFlg;// 20250418 Add
                    break;
            }
        }
        // 20240402 E_Add
    }

    // 20240402 S_Add
    public convertDeposits() {
        this.depositsMap = [];

        for (var i = 1; i <= 7; i++) {
            var dep = new EvictionDepositInfo();

            switch (i) {
                case 1:
                    dep.evictionDepositType = this.evictionDepositType1;
                    dep.depositType = this.depositType1;
                    dep.deposit = this.deposit1;
                    dep.depositPayedDate = this.depositPayedDate1;
                    dep.depositPayedFlg = this.deposit1PayedFlg;// 20250418 Add
                    break;
                case 2:
                    dep.evictionDepositType = this.evictionDepositType2;
                    dep.depositType = this.depositType2;
                    dep.deposit = this.deposit2;
                    dep.depositPayedDate = this.depositPayedDate2;
                    dep.depositPayedFlg = this.deposit2PayedFlg;// 20250418 Add
                    break;
                case 3:
                    dep.evictionDepositType = this.evictionDepositType3;
                    dep.depositType = this.remainingType;
                    dep.deposit = this.remainingFee;
                    dep.depositPayedDate = this.remainingPayedDate;
                    dep.depositPayedFlg = this.remainingPayedFlg;// 20250418 Add
                    break;
                case 4:
                    dep.evictionDepositType = this.evictionDepositType4;
                    dep.depositType = this.depositType4;
                    dep.deposit = this.deposit4;
                    dep.depositPayedDate = this.depositPayedDate4;
                    dep.depositPayedFlg = this.deposit4PayedFlg;// 20250418 Add
                    break;
                case 5:
                    dep.evictionDepositType = this.evictionDepositType5;
                    dep.depositType = this.depositType5;
                    dep.deposit = this.deposit5;
                    dep.depositPayedDate = this.depositPayedDate5;
                    dep.depositPayedFlg = this.deposit5PayedFlg;// 20250418 Add
                    break;
                case 6:
                    dep.evictionDepositType = this.evictionDepositType6;
                    dep.depositType = this.depositType6;
                    dep.deposit = this.deposit6;
                    dep.depositPayedDate = this.depositPayedDate6;
                    dep.depositPayedFlg = this.deposit6PayedFlg;// 20250418 Add
                    break;
                case 7:
                    dep.evictionDepositType = this.evictionDepositType7;
                    dep.depositType = this.depositType7;
                    dep.deposit = this.deposit7;
                    dep.depositPayedDate = this.depositPayedDate7;
                    dep.depositPayedFlg = this.deposit7PayedFlg;// 20250418 Add
                    break;
            }
            this.depositsMap.push(dep);
        }

        for (var i = 6; i > 0; i--) {
            let dep = this.depositsMap[i];
            if ((dep.evictionDepositType == null || dep.evictionDepositType == "" || dep.evictionDepositType == "0")
                && (dep.depositType == null || dep.depositType == "" || dep.depositType == "0")
                && (dep.deposit == null || dep.deposit == 0)
                && (dep.depositPayedDate == null || dep.depositPayedDate == "")
                && (dep.depositPayedFlg == null || dep.depositPayedFlg == "")// 20250418 Add
            ) {
                this.depositsMap.splice(i, 1);
            }
            else {
                break;
            }
        }

        for (var i = 0; i < this.depositsMap.length; i++) {
            //カレンダー
            this.depositsMap[i].depositPayedDateMap = Converter.stringToDate(this.depositsMap[i].depositPayedDate, 'yyyyMMdd');
            //数字
            this.depositsMap[i].depositMap = Converter.numberToString(this.depositsMap[i].deposit);
        }
    }
    // 20240402 E_Add
}
