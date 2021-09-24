import { DatePipe } from '@angular/common';
import { Receivecontractdetailinfo } from './receivecontractdetailinfo';
import { Converter } from '../utils/converter';

export class Receivecontractinfo {

    pid: number;
    tempLandInfoPid: number;
    depCode: string;
    userId: number;
    contractInfoPid: number;
    bukkenSalesInfoPid: number;
    contractCategory: string;
    supplierName: string;
    supplierAddress: string;
    supplierTel: string;
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

    details: Receivecontractdetailinfo[];

    public constructor(init?: Partial<Receivecontractinfo>) {
        Object.assign(this, init);
    }

    public convert() {
        //カレンダー
        this.contractDayMap = Converter.stringToDate(this.contractDay, 'yyyyMMdd');
        this.contractFixDayMap = Converter.stringToDate(this.contractFixDay, 'yyyyMMdd');
        this.taxEffectiveDayMap = Converter.stringToDate(this.taxEffectiveDay, 'yyyyMMdd');

        let lst = [];
        this.details.forEach((detail) => {            
            //カレンダー
            detail.contractDayMap = Converter.stringToDate(detail.contractDay, 'yyyyMMdd');
            detail.contractFixDayMap = Converter.stringToDate(detail.contractFixDay, 'yyyyMMdd');

            //カンマ
            detail.receivePriceMap = Converter.numberToString(detail.receivePrice);
            detail.receiveTaxMap = Converter.numberToString(detail.receiveTax);
            detail.receivePriceTaxMap = Converter.numberToString(detail.receivePriceTax);
            let ct = new Receivecontractdetailinfo(detail);
            lst.push(ct);
        });
        this.details = lst;
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

        this.details.forEach((detail) => {
            //カレンダー
            detail.contractDay = Converter.dateToString(detail.contractDayMap,'yyyyMMdd',datePipe);
            detail.contractFixDay = Converter.dateToString(detail.contractFixDayMap,'yyyyMMdd',datePipe);

            //カンマ
            detail.receivePrice = Converter.stringToNumber(detail.receivePriceMap);
            detail.receiveTax = Converter.stringToNumber(detail.receiveTaxMap);
            detail.receivePriceTax = Converter.stringToNumber(detail.receivePriceTaxMap);

            if(detail.contractorMap != null && detail.contractorMap.length > 0) {
                detail.contractor = detail.contractorMap.map(me => me['codeDetail'].split('_').join(',')).join('|');
            }
            else {
                detail.contractor = null;
            }

        });
        //カンマ
        this.contractPrice = Converter.stringToNumber(this.contractPriceMap);
        this.contractTax = Converter.stringToNumber(this.contractTaxMap);
        this.contractPriceTax = Converter.stringToNumber(this.contractPriceTaxMap);
    }
}
