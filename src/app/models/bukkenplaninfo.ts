
import { DatePipe } from '@angular/common';
import { Converter } from '../utils/converter';

export class Bukkenplaninfo {

    pid: number;
    tempLandInfoPid: number;
    planFixFlg: string;
    planConsidered: string;
    planPrice: number;
    planRequest: string;
    planRequestDay: string;
    planScheduledDay: string;
    planRemark: string;
    
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;
    deleteUserId: number;

    planPriceMap: string = "";

    planRequestDayMap: Date = null;
    planScheduledDayMap: Date = null;
    delete: boolean;

    public constructor(init?: Partial<Bukkenplaninfo>) {
        Object.assign(this, init);
    }

   public convert() {
        //カレンダー
        this.planRequestDayMap = Converter.stringToDate(this.planRequestDay, 'yyyyMMdd');
        this.planScheduledDayMap = Converter.stringToDate(this.planScheduledDay, 'yyyyMMdd');
        /*
        if (this.planRequestDay) {
            this.planRequestDayMap = parse(this.planRequestDay, 'yyyyMMdd', new Date());
        }
        if (this.planScheduledDay) {
            this.planScheduledDayMap = parse(this.planScheduledDay, 'yyyyMMdd', new Date());
        }
        */
        //カンマ
        this.planPriceMap = Converter.numberToString(this.planPrice);
    }

    public convertForSave(userId: number , datePipe: DatePipe) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

        if(this.delete) {
            this.deleteUserId = userId;
        }

        //カレンダー
        this.planRequestDay = Converter.dateToString(this.planRequestDayMap,'yyyyMMdd',datePipe);
        this.planScheduledDay = Converter.dateToString(this.planScheduledDayMap,'yyyyMMdd',datePipe);
        /*
        this.planRequestDay = this.planRequestDayMap != null ? datePipe.transform(this.planRequestDayMap, 'yyyyMMdd') : null;
        this.planScheduledDay = this.planScheduledDayMap != null ? datePipe.transform(this.planScheduledDayMap, 'yyyyMMdd') : null;   
        */
        //カンマ
        this.planPrice = Converter.stringToNumber(this.planPriceMap);             
    }
}




