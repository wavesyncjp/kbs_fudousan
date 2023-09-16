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
    contractEndNotificationStartDate: string;
    contractEndNotificationEndDate: string;
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

    createUserId: number;
    updateUserId: number;
    deleteUserId: number;

    // 開発用の例↓
    roomNo: string;
    borrowerName: string;
    loanPeriodStartDateMap: Date = null;
    loanPeriodEndDateMap: Date = null;
    contractEndNotificationStartDateMap: Date = null;
    contractEndNotificationEndDateMap: Date = null;
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
    // 開発用の例↑
    public constructor(init?: Partial<RentalContract>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert() {
        //カレンダー
        this.loanPeriodStartDateMap = Converter.stringToDate(this.loanPeriodStartDate, 'yyyyMMdd');
        this.loanPeriodEndDateMap = Converter.stringToDate(this.loanPeriodEndDate, 'yyyyMMdd');
        this.contractEndNotificationStartDateMap = Converter.stringToDate(this.contractEndNotificationStartDate, 'yyyyMMdd');
        this.contractEndNotificationEndDateMap = Converter.stringToDate(this.contractEndNotificationEndDate, 'yyyyMMdd');
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
        this.keyMoneyMap = Converter.numberToString(this.keyMoney);
        this.depositMap = Converter.numberToString(this.deposit);
        this.parkingFeeMap = Converter.numberToString(this.parkingFee);
        this.parkingDepositMap = Converter.numberToString(this.parkingDeposit);
        this.InsuranceFeeMap = Converter.numberToString(this.InsuranceFee);
        this.roomRentGuaranteeFeeMap = Converter.numberToString(this.roomRentGuaranteeFee);
    }

    public convertForSave(userId: number, datePipe: DatePipe, isJoin: boolean = false) {
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        //カレンダー
        this.loanPeriodStartDate = Converter.dateToString(this.loanPeriodStartDateMap, 'yyyyMMdd', datePipe);
        this.loanPeriodEndDate = Converter.dateToString(this.loanPeriodEndDateMap, 'yyyyMMdd', datePipe);
        this.contractEndNotificationStartDate = Converter.dateToString(this.contractEndNotificationStartDateMap, 'yyyyMMdd', datePipe);
        this.contractEndNotificationEndDate = Converter.dateToString(this.contractEndNotificationEndDateMap, 'yyyyMMdd', datePipe);
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
        this.keyMoney = Converter.stringToNumber(this.keyMoneyMap);
        this.deposit = Converter.stringToNumber(this.depositMap);
        this.parkingFee = Converter.stringToNumber(this.parkingFeeMap);
        this.parkingDeposit = Converter.stringToNumber(this.parkingDepositMap);
        this.InsuranceFee = Converter.stringToNumber(this.InsuranceFeeMap);
        this.roomRentGuaranteeFee = Converter.stringToNumber(this.roomRentGuaranteeFeeMap);
    }
}
