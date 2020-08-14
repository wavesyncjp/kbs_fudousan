import { DatePipe } from '@angular/common';
import { Paycontractdetailinfo } from './paycontractdetailinfo';
import { Converter } from '../utils/converter';

export class Paycontractinfo {

    pid: number;
    tempLandInfoPid: number;
    depCode: string;
    userId: number;
    supplierName: string;
    bank: string;
    branchName: string;
    accountType: string;
    accountName: string;
    bankName: string;
    contractPrice: number;
    contractTax: number;
    contractPriceTax: number;
    contractDay: string;
    contractFixDay: string;
    taxEffectiveDay: string;
    remarks: string;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;
    tax: String;

    contractDayMap: Date = null;
    contractFixDayMap: Date = null;
    taxEffectiveDayMap: Date = null;

    contractPriceMap: string = "";
    contractTaxMap: string = "";
    contractPriceTaxMap: string = "";

    details: Paycontractdetailinfo[];

    public constructor(init?: Partial<Paycontractinfo>) {
        Object.assign(this, init);
    }

    public convert() {
        //カレンダー
        this.contractDayMap = Converter.stringToDate(this.contractDay, 'yyyyMMdd');
        this.contractFixDayMap = Converter.stringToDate(this.contractFixDay, 'yyyyMMdd');
        this.taxEffectiveDayMap = Converter.stringToDate(this.taxEffectiveDay, 'yyyyMMdd');
        /*
        if (this.contractDay) {
            this.contractDayMap = parse(this.contractDay, 'yyyyMMdd', new Date());
        }
        if (this.contractFixDay) {
            this.contractFixDayMap = parse(this.contractFixDay, 'yyyyMMdd', new Date());
        }
        if (this.taxEffectiveDay) {
            this.taxEffectiveDayMap = parse(this.taxEffectiveDay, 'yyyyMMdd', new Date());
        }
        */

        this.details.forEach((detail) => {
            //カレンダー
            detail.closingDayMap = Converter.stringToDate(detail.closingDay, 'yyyyMMdd');
            detail.contractDayMap = Converter.stringToDate(detail.contractDay, 'yyyyMMdd');
            detail.contractFixDayMap = Converter.stringToDate(detail.contractFixDay, 'yyyyMMdd');
            /*
            if (detail.closingDay) {
                detail.closingDayMap = parse(detail.closingDay, 'yyyyMMdd', new Date());
            }
            if (detail.contractDay) {
                detail.contractDayMap = parse(detail.contractDay, 'yyyyMMdd', new Date());
            }
            if (detail.contractFixDay) {
                detail.contractFixDayMap = parse(detail.contractFixDay, 'yyyyMMdd', new Date());
            }
            */
            //カンマ
            detail.payPriceMap = Converter.numberToString(detail.payPrice);
            detail.payTaxMap = Converter.numberToString(detail.payTax);
            detail.payPriceTaxMap = Converter.numberToString(detail.payPriceTax);
        });
        //カンマ
        this.contractPriceMap = Converter.numberToString(this.contractPrice);
        this.contractTaxMap = Converter.numberToString(this.contractTax);
        this.contractPriceTaxMap = Converter.numberToString(this.contractPriceTax);
    }

    public convertForSave(userId: number, datePipe: DatePipe) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

        //カレンダー
        this.contractDay = Converter.dateToString(this.contractDayMap,'yyyyMMdd',datePipe);
        this.contractFixDay = Converter.dateToString(this.contractFixDayMap,'yyyyMMdd',datePipe);
        this.taxEffectiveDay = Converter.dateToString(this.taxEffectiveDayMap,'yyyyMMdd',datePipe);
        /*
        this.contractDay = this.contractDay != null ? datePipe.transform(this.contractDayMap, 'yyyyMMdd') : null;
        this.contractFixDay = this.contractFixDayMap != null ? datePipe.transform(this.contractFixDayMap, 'yyyyMMdd') : null;
        this.taxEffectiveDay = this.taxEffectiveDayMap != null ? datePipe.transform(this.taxEffectiveDayMap, 'yyyyMMdd') : null;
        */
        this.details.forEach((detail) => {
            //カレンダー
            detail.closingDay = Converter.dateToString(detail.closingDayMap,'yyyyMMdd',datePipe);
            detail.contractDay = Converter.dateToString(detail.contractDayMap,'yyyyMMdd',datePipe);
            detail.contractFixDay = Converter.dateToString(detail.contractFixDayMap,'yyyyMMdd',datePipe);
            /*
            detail.closingDay = detail.closingDayMap != null ? datePipe.transform(detail.closingDayMap, 'yyyyMMdd') : null;
            detail.contractDay = detail.contractDayMap != null ? datePipe.transform(detail.contractDayMap, 'yyyyMMdd') : null;
            detail.contractFixDay = detail.contractFixDayMap != null ? datePipe.transform(detail.contractFixDayMap, 'yyyyMMdd') : null;
            */
            //カンマ
            detail.payPrice = Converter.stringToNumber(detail.payPriceMap);
            detail.payTax = Converter.stringToNumber(detail.payTaxMap);
            detail.payPriceTax = Converter.stringToNumber(detail.payPriceTaxMap);
        });
        //カンマ
        this.contractPrice = Converter.stringToNumber(this.contractPriceMap);
        this.contractTax = Converter.stringToNumber(this.contractTaxMap);
        this.contractPriceTax = Converter.stringToNumber(this.contractPriceTaxMap);
    }
}
