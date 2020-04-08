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
    createDay: string;
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

    createDayMap: Date = null;
    startDayMap: Date = null;
    upperWingDayMap: Date = null;
    completionDayMap: Date = null;
    scheduledDayMap: Date = null;
    
    
    
    
    details: Plandetail[];

    public constructor(init?: Partial<Planinfo>) {
        Object.assign(this, init);
    }

    public convert() {
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
    }
}




