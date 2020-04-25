
import { SharerInfo } from './sharer-info';
import { Bukkensalesinfo } from './bukkensalesinfo'

import { DatePipe } from '@angular/common';

import { parse } from 'date-fns';
import { from } from 'rxjs';

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
    deleteUserId: number;

    
    planRequestDayMap: Date = null;
    planScheduledDayMap: Date = null;
    delete: boolean;

    public constructor(init?: Partial<Bukkenplaninfo>) {
        Object.assign(this, init);
    }

   public convert() {
        
        if (this.planRequestDay) {
            this.planRequestDayMap = parse(this.planRequestDay, 'yyyyMMdd', new Date());
        }
        if (this.planScheduledDay) {
            this.planScheduledDayMap = parse(this.planScheduledDay, 'yyyyMMdd', new Date());
        }
        
    }

    public convertForSave(userId: number , datePipe: DatePipe) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }                
        this.planRequestDay = this.planRequestDayMap != null ? datePipe.transform(this.planRequestDayMap, 'yyyyMMdd') : null;
        this.planScheduledDay = this.planScheduledDayMap != null ? datePipe.transform(this.planScheduledDayMap, 'yyyyMMdd') : null;   
        if(this.delete) {
            this.deleteUserId = userId;
        }             
    }
}




