import { Contractdetailinfo } from './contractdetailinfo';
import { Templandinfo } from './templandinfo';
import { Locationinfo } from './locationinfo';
import { SharerInfo } from './sharer-info';

import { DatePipe } from '@angular/common';
import {Plandetail} from  './plandetail';
import { parse } from 'date-fns';

export class Planinfo {

    pid: number;
    tempLandInfoPid: number;
    planNumber: string;
    planName = '';
    planStatus: string;
    cratedDay: string;
    depCode: string;
    userId: string;
    address: string;
    siteAreaBuy: number;
    siteAreaCheck: number;
    buildArea: number;
    entrance: number;
    parking: number;
    underArea: number;
    totalArea: number;
    salesArea: number;
    restrictedArea: string;
    floorAreaRate: number;
    coverageRate: number;
    digestionVolume: number;
    lentable: number;
    structureScale: string;
    ground: number;
    underground: number;
    totalUnits: number;
    buysellUnits: number;
    parkingIndoor: number;
    parkingOutdoor: number;
    mechanical: number;
    landOwner: string;
    rightsRelationship: string;
    landContract: string;
    designOffice: string;
    construction: string;
    startDay: string;
    upperWingDay: string;
    completionDay: string;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;
    settlement: number;
    period : string;
    traffic : string;
    scheduledDay: string;
    groundType: string;
    jvRatio: number;

    cratedDayMap: Date = null;
    startDayMap: Date = null;
    upperWingDayMap: Date = null;
    completionDayMap: Date = null;
    scheduledDayMap: Date = null;

    
    
    
    details: Plandetail[];

    public constructor(init?: Partial<Planinfo>) {
        Object.assign(this, init);
    }

    public convert() {
        if (this.cratedDay) {
            this.cratedDayMap = parse(this.cratedDay, 'yyyyMMdd', new Date());
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

        /*this.details.forEach((detail) => {
            if (detail.cratedDay) {
                detail.cratedDayMap = parse(detail.cratedDay, 'yyyyMMdd', new Date());
            }
            if (detail.contractDay) {
                detail.contractDayMap = parse(detail.contractDay, 'yyyyMMdd', new Date());
            }
            if (detail.contractFixDay) {
                detail.contractFixDayMap = parse(detail.contractFixDay, 'yyyyMMdd', new Date());
            }
        }*/
    }

    public convertForSave(userId: number , datePipe: DatePipe) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
    }
}
