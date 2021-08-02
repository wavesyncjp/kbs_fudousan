
import { Converter } from '../utils/converter';
import { formatDate } from '@angular/common';
import { parse } from 'date-fns';

export class Sorting {

    pid: number;
    tempLandInfoPid: number;
    paymentCode: string;
    contractType: number;
    payContractDetailPid: number;
    identificationCd: string;
    slipNo: string;
    settlement: string;
    transactionDate: string;
    debtorKanjyoCode: string;
    debtorKanjyoDetailName: string;
    debtorTaxType: string;
    debtorPrice: number;
    debtorTax: number;
    creditorKanjyoCode: string;
    creditorKanjyoDetailName: string;
    creditorTaxType: string;
    creditorPrice: number;
    creditorTax: number;
    transactionType: string;
    remark: string;
    transFlg: string = '00';
    outPutFlg: number = 0;
    outPutDate: string;
    outPutTime: string;

    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;
    deleteUserId: number;

    transactionDateMap: Date = null;
    outPutDateTimeMap: string;

    debtorPriceMap: string = "";
    debtorTaxMap: string = "";
    creditorPriceMap: string = "";
    creditorTaxMap: string = "";

    public constructor(init?: Partial<Sorting>) {
        Object.assign(this, init);
    }

    public convert() {
        //カレンダー
        this.transactionDateMap = Converter.stringToDate(this.transactionDate, 'yyyyMMdd');
        this.outPutDateTimeMap = this.formatDateTime(this.outPutDate, this.outPutTime)

        //カンマ
        this.debtorPriceMap = Converter.numberToString(this.debtorPrice);
        this.debtorTaxMap = Converter.numberToString(this.debtorTax);
        this.creditorPriceMap = Converter.numberToString(this.creditorPrice);
        this.creditorTaxMap = Converter.numberToString(this.creditorTax);
    }

    formatDateTime(date: string, time: string) {
        if (date === undefined || date === '' || date == null) {
            return '';
        }
        if (time === undefined || time === '' || time == null) {
            return '';
        }
        const parseVal = parse(date + time, 'yyyyMMddHHmmss', new Date());
        return formatDate(parseVal, 'yyyy/MM/dd HH:mm:ss', 'en-US');
    }
}
