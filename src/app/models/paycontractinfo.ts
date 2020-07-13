import { DatePipe } from '@angular/common';
import { parse } from 'date-fns';
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

    contractPriceMap: string;
    contractTaxMap: string;
    contractPriceTaxMap: string;

    details: Paycontractdetailinfo[];

    public constructor(init?: Partial<Paycontractinfo>) {
        Object.assign(this, init);
    }

    public convert() {
        if (this.contractDay) {
            this.contractDayMap = parse(this.contractDay, 'yyyyMMdd', new Date());
        }
        if (this.contractFixDay) {
            this.contractFixDayMap = parse(this.contractFixDay, 'yyyyMMdd', new Date());
        }
        if (this.taxEffectiveDay) {
            this.taxEffectiveDayMap = parse(this.taxEffectiveDay, 'yyyyMMdd', new Date());
        }

        this.details.forEach((detail) => {
            if (detail.closingDay) {
                detail.closingDayMap = parse(detail.closingDay, 'yyyyMMdd', new Date());
            }
            if (detail.contractDay) {
                detail.contractDayMap = parse(detail.contractDay, 'yyyyMMdd', new Date());
            }
            if (detail.contractFixDay) {
                detail.contractFixDayMap = parse(detail.contractFixDay, 'yyyyMMdd', new Date());
            }
        });
        this.contractPriceMap = Converter.numberToString(this.contractPrice);
        this.contractTaxMap = Converter.numberToString(this.contractTax);
        this.contractPriceTaxMap = Converter.numberToString(this.contractPriceTax);
        /*
        this.details.payPriceMap = Converter.numberToString(this.details.payPrice);
        this.details.payTaxMap = Converter.numberToString(this.details.payTax);
        this.details.payPriceTaxMap = Converter.numberToString(this.details.payPriceTax);
        */
    }

    public convertForSave(userId: number, datePipe: DatePipe) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

        this.contractDay = this.contractDayMap != null ? datePipe.transform(this.contractDayMap, 'yyyyMMdd') : null;
        this.contractFixDay = this.contractFixDayMap != null ? datePipe.transform(this.contractFixDayMap, 'yyyyMMdd') : null;
        this.taxEffectiveDay = this.taxEffectiveDayMap != null ? datePipe.transform(this.taxEffectiveDayMap, 'yyyyMMdd') : null;

        this.details.forEach((detail) => {
            detail.closingDay = detail.closingDayMap != null ? datePipe.transform(detail.closingDayMap, 'yyyyMMdd') : null;
            detail.contractDay = detail.contractDayMap != null ? datePipe.transform(detail.contractDayMap, 'yyyyMMdd') : null;
            detail.contractFixDay = detail.contractFixDayMap != null ? datePipe.transform(detail.contractFixDayMap, 'yyyyMMdd') : null;
        });
        this.contractPrice = Converter.stringToNumber(this.contractPriceMap);
        this.contractTax = Converter.stringToNumber(this.contractTaxMap);
        this.contractPriceTax = Converter.stringToNumber(this.contractPriceTaxMap);
    }
}
