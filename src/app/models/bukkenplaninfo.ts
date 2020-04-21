import { Contractdetailinfo } from './contractdetailinfo';
import { Templandinfo } from './templandinfo';
import { Locationinfo } from './locationinfo';
import { SharerInfo } from './sharer-info';

import { DatePipe } from '@angular/common';

import { parse } from 'date-fns';

export class Bukkenplaninfo {

    pid: number;
    tempLandInfoPid: number;
    planFixFlg: string;
    planConsidered: string;
    planPrice: string;
    planRequest: string;
    planRequestDay: string;
    planScheduledDay: string;
    planRemark: string;

    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;
    
    sharers: SharerInfo[];
    
    
    /*details: Plandetail[];
    rent: Planrentroll[];
    rentdetails: Planrentrolldetail[];*/

    public constructor(init?: Partial<Bukkenplaninfo>) {
        Object.assign(this, init);
    }

   /* public convert() {
        if (this.createDay) {
            this.createDayMap = parse(this.createDay, 'yyyyMMdd', new Date());
        }
        if (this.startDay) {
            this.startDayMap = parse(this.startDay, 'yyyyMMdd', new Date());
        }
        if (this.upperWingDay) {
            this.upperWingDayMap = parse(this.upperWingDay, 'yyyyMMdd', new Date());
        }
        if (this.completionDay) {
            this.completionDayMap = parse(this.completionDay, 'yyyyMMdd', new Date());
        }
        if (this.scheduledDay) {
            this.scheduledDayMap = parse(this.scheduledDay, 'yyyyMMdd', new Date());
        }
    }

    public convertForSave(userId: number , datePipe: DatePipe) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        //20200408_hirano_S
        this.createDay = this.createDayMap != null ? datePipe.transform(this.createDayMap, 'yyyyMMdd') : null;
        this.startDay = this.startDayMap != null ? datePipe.transform(this.startDayMap, 'yyyyMMdd') : null;
        this.upperWingDay = this.upperWingDayMap != null ? datePipe.transform(this.upperWingDayMap, 'yyyyMMdd') : null;
        this.completionDay = this.completionDayMap != null ? datePipe.transform(this.completionDayMap, 'yyyyMMdd') : null;
        this.scheduledDay = this.scheduledDayMap != null ? datePipe.transform(this.scheduledDayMap, 'yyyyMMdd') : null;
        //20200408_hirano_E
    }*/
}




