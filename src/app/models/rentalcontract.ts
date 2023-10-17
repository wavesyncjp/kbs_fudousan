import { DatePipe } from '@angular/common';
import { Converter } from '../utils/converter';

export class RentalContract {
    pid: number;
    rentalInfoPid: number;
    residentInfoPid: number;
    contractInfoPid: number;
    locationInfoPid: number;
    tempLandInfoPid: number;
    banktransferName: string;
    banktransferNameKana: string;
    loanPeriodStartDate: string;
    loanPeriodEndDate: string;
    // 20231016 S_Delete
    // contractEndNotificationStartDate: string;
    // contractEndNotificationEndDate: string;
    // 20231016 E_Delete
    // 20231016 S_Add
    agreementDate: string;
    borrowerAddress: string;
    borrowerTel: string;
    contractEndNotification: string;
    residentName: string;
    residentTel: string;
    keyExchangeFee: number;
    updateFee: number;
    securityDepositConvertedFlg: string;
    // 20231016 E_Add

    paymentMethod: string;
    usance: string;
    paymentDay: number;
    rentPrice: number;
    rentPriceTax: number;
    condoFee: number;
    condoFeeTax: number;
    managementFee: number;
    managementFeeTax: number;
    attachedFacilityFee: number;
    keyMoney: number;
    deposit: number;
    depositConvertedFlg: string;
    parkingFee: number;
    parkingDeposit: number;
    parkingDepositConvertedFlg: string;
    InsuranceFee: number;
    roomRentGuaranteeFee: number;
    roomRentGuaranteeFeeConvertedFlg: string;
    roomRentExemptionStartDate: string;
    contractMethod: string;
    receiveCode: string;
    // 20231010 S_Add
    floorNumber: string;
    roomExtent: number;
    roomType: string;
    usePurpose: string;
    otherExpenses: number;
    securityDeposit: number;
    amortization: number;
    // 20231010 E_Add
    createUserId: number;
    updateUserId: number;

    // 開発用の例↓
    roomNo: string;
    borrowerName: string;
    // 20231010 S_Update
    // loanPeriodStartDateMap: Date = null;
    // loanPeriodEndDateMap: Date = null;
    loanPeriodStartDateMap: String = null;
    loanPeriodEndDateMap: String = null;
    // 20231010 S_Update
    // 20231016 S_Delete
    // contractEndNotificationStartDateMap: Date = null;
    // contractEndNotificationEndDateMap: Date = null;
    // 20231016 E_Delete

    // 20231016 S_Add
    agreementDateMap: String = null;
    keyExchangeFeeMap: string;
    // 20231016 E_Add

    paymentDayMap: string;
    rentPriceMap: string;
    rentPriceTaxMap: string;
    condoFeeMap: string;
    condoFeeTaxMap: string;
    managementFeeMap: string;
    managementFeeTaxMap: string;
    attachedFacilityFeeMap: string;
    keyMoneyMap: string;
    depositMap: string;
    parkingFeeMap: string;
    parkingDepositMap: string;
    InsuranceFeeMap: string;
    roomRentGuaranteeFeeMap: string;
    roomRentExemptionStartDateMap: Date = null;
    locationInfoPidForSearch: number;

    // 20231010 S_Add
    roomExtentMap: string;
    otherExpensesMap: string;
    securityDepositMap: string;
    amortizationMap: string;
    rentPriceRefMap: string;
    ownershipRelocationDateDbMap: string;
    // 20231010 E_Add
    statusMap: string;// 登録状態
    msgMap: string;// NGのメッセージ

    // 開発用の例↑
    public constructor(init?: Partial<RentalContract>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert() {
        //カレンダー
        // 20231010 S_Update
        // this.loanPeriodStartDateMap = Converter.stringToDate(this.loanPeriodStartDate, 'yyyyMMdd');
        // this.loanPeriodEndDateMap = Converter.stringToDate(this.loanPeriodEndDate, 'yyyyMMdd');
        this.loanPeriodStartDateMap = this.addSlash(this.loanPeriodStartDate);
        this.loanPeriodEndDateMap = this.addSlash(this.loanPeriodEndDate);
        // 20231010 E_Update
        // 20231016 S_Delete
        // this.contractEndNotificationStartDateMap = Converter.stringToDate(this.contractEndNotificationStartDate, 'yyyyMMdd');
        // this.contractEndNotificationEndDateMap = Converter.stringToDate(this.contractEndNotificationEndDate, 'yyyyMMdd');
        // 20231016 E_Delete
        // 20231016 S_Add
        this.agreementDateMap = this.addSlash(this.agreementDate);
        // 20231016 E_Add

        this.roomRentExemptionStartDateMap = Converter.stringToDate(this.roomRentExemptionStartDate, 'yyyyMMdd');

        // 数字
        this.paymentDayMap = Converter.numberToString(this.paymentDay);
        this.rentPriceMap = Converter.numberToString(this.rentPrice);
        this.rentPriceTaxMap = Converter.numberToString(this.rentPriceTax);
        this.condoFeeMap = Converter.numberToString(this.condoFee);
        this.condoFeeTaxMap = Converter.numberToString(this.condoFeeTax);
        this.managementFeeMap = Converter.numberToString(this.managementFee);
        this.managementFeeTaxMap = Converter.numberToString(this.managementFeeTax);
        this.attachedFacilityFeeMap = Converter.numberToString(this.attachedFacilityFee);
        // 20231010 S_Add
        this.otherExpensesMap = Converter.numberToString(this.otherExpenses);
        this.securityDepositMap = Converter.numberToString(this.securityDeposit);
        this.amortizationMap = Converter.numberToString(this.amortization);
        this.roomExtentMap = Converter.numberToString(this.roomExtent);
        // 20231010 E_Add
        this.keyMoneyMap = Converter.numberToString(this.keyMoney);
        this.depositMap = Converter.numberToString(this.deposit);
        this.parkingFeeMap = Converter.numberToString(this.parkingFee);
        this.parkingDepositMap = Converter.numberToString(this.parkingDeposit);
        this.InsuranceFeeMap = Converter.numberToString(this.InsuranceFee);
        this.roomRentGuaranteeFeeMap = Converter.numberToString(this.roomRentGuaranteeFee);

        // 20231016 S_Add
        this.keyExchangeFeeMap = Converter.numberToString(this.keyExchangeFee);
        // 20231016 E_Add
    }

    public convertForSave(userId: number, datePipe: DatePipe, isJoin: boolean = false) {
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        //カレンダー
        // 20231010 S_Update
        // this.loanPeriodStartDate = Converter.dateToString(this.loanPeriodStartDateMap, 'yyyyMMdd', datePipe);
        // this.loanPeriodEndDate = Converter.dateToString(this.loanPeriodEndDateMap, 'yyyyMMdd', datePipe);
        this.loanPeriodStartDate = this.loanPeriodStartDateMap != null ? this.loanPeriodStartDateMap.replace(/\//g, '') : this.loanPeriodStartDate;
        this.loanPeriodEndDate = this.loanPeriodEndDateMap != null ? this.loanPeriodEndDateMap.replace(/\//g, '') : this.loanPeriodEndDate;
        // 20231010 E_Update
        // 20231016 S_Delete
        // this.contractEndNotificationStartDate = Converter.dateToString(this.contractEndNotificationStartDateMap, 'yyyyMMdd', datePipe);
        // this.contractEndNotificationEndDate = Converter.dateToString(this.contractEndNotificationEndDateMap, 'yyyyMMdd', datePipe);
        // 20231016 E_Delete
        // 20231016 S_Add
        this.agreementDate = this.agreementDateMap != null ? this.agreementDateMap.replace(/\//g, '') : this.agreementDate;
        // 20231016 E_Add

        this.roomRentExemptionStartDate = Converter.dateToString(this.roomRentExemptionStartDateMap, 'yyyyMMdd', datePipe);

        // 数字
        this.paymentDay = Converter.stringToNumber(this.paymentDayMap);
        this.rentPrice = Converter.stringToNumber(this.rentPriceMap);
        this.rentPriceTax = Converter.stringToNumber(this.rentPriceTaxMap);
        this.condoFee = Converter.stringToNumber(this.condoFeeMap);
        this.condoFeeTax = Converter.stringToNumber(this.condoFeeTaxMap);
        this.managementFee = Converter.stringToNumber(this.managementFeeMap);
        this.managementFeeTax = Converter.stringToNumber(this.managementFeeTaxMap);
        this.attachedFacilityFee = Converter.stringToNumber(this.attachedFacilityFeeMap);
        // 20231010 S_Add
        this.otherExpenses = Converter.stringToNumber(this.otherExpensesMap);
        this.securityDeposit = Converter.stringToNumber(this.securityDepositMap);
        this.amortization = Converter.stringToNumber(this.amortizationMap);
        this.roomExtent = Converter.stringToNumber(this.roomExtentMap);
        // 20231010 E_Add
        this.keyMoney = Converter.stringToNumber(this.keyMoneyMap);
        this.deposit = Converter.stringToNumber(this.depositMap);
        this.parkingFee = Converter.stringToNumber(this.parkingFeeMap);
        this.parkingDeposit = Converter.stringToNumber(this.parkingDepositMap);
        this.InsuranceFee = Converter.stringToNumber(this.InsuranceFeeMap);
        this.roomRentGuaranteeFee = Converter.stringToNumber(this.roomRentGuaranteeFeeMap);

        // 20231016 S_Add
        this.keyExchangeFee = Converter.stringToNumber(this.keyExchangeFeeMap);
        // 20231016 E_Add
    }

    // 20231010 S_Add
    addSlash(day: String) {
        if (day == null || day === '' || day.length < 8) return day;
        return `${day.substring(0, 4)}/${day.substring(4, 6)}/${day.substring(6)}`
    }
    // 20231010 E_Add
}
