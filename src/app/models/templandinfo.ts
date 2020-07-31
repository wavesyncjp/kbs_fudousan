import { Locationinfo } from './locationinfo';
import { MapAttach, AttachFile } from './mapattach';
import {Bukkenplaninfo} from './bukkenplaninfo'
import { SharerInfo } from './sharer-info';
import { from } from 'rxjs';
import { Bukkensalesinfo } from './bukkensalesinfo';
import { DatePipe } from '@angular/common';
import { parse } from 'date-fns';

export class Templandinfo {
    pid: number;
    bukkenNo = '';
    contractBukkenNo: number;
    bukkenName = '';
    residence = '';
    pickDate = '';
    department = '';
    staff = '';
    infoStaff = '';
    infoOffer = '';
    startDate = '';
    finishDate = '';
    result = '';
    remark1 = '';
    remark2 = '';
    indivisibleFlg: number;
    indivisibleNumerator: number;
    indivisibleDenominator: string;
    landCategory = '';
    floorAreaRatio: string;
    coverageRate: number = null;
    surveyRequestedDay: string;
    surveyRequested: string;
    surveyStaff: string;
    surveyMapChk: string;
    publicAndPrivateFormChk: string;
    publicAndPrivateForm: string;
    privateChk: string;
    private: string;
    publicChk: string;
    public: string;
    surveyDeliveryDay: string;
    surveyRemark: string;
    mapFiles: MapAttach[];
    attachFiles: AttachFile[];
    locations: Locationinfo[];


    pickDateMap: Date = null;
    startDateMap: Date = null;
    finishDateMap: Date = null;
    surveyRequestedDayMap: Date = null;
    surveyDeliveryDayMap: Date = null;
    //20200731 S_Update
    /*
    infoStaffMap: string[] = [];
    infoOfferMap: string[] = [];
    */
    infoStaffMap = [];
    infoOfferMap = [];
    //20200731 E_Update

    createUserId: number;
    updateUserId: number;
    
    

    public constructor(init?: Partial<Templandinfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    //20200731 S_Update
    /*
    public convert() {
    */
    public convert(emps: any[]) {
    //20200731 E_Update
        if (this.pickDate) {
//            this.pickDateMap = new Date(this.pickDate);
            this.pickDateMap = parse(this.pickDate, 'yyyyMMdd', new Date());
        }
        if (this.startDate) {
            this.startDateMap = parse(this.startDate, 'yyyyMMdd', new Date());
        }
        if (this.finishDate) {
            this.finishDateMap = parse(this.finishDate, 'yyyyMMdd', new Date());
        }
        if (this.surveyRequestedDay) {
            this.surveyRequestedDayMap = parse(this.surveyRequestedDay, 'yyyyMMdd', new Date());
        }
        if (this.surveyDeliveryDay) {
            this.surveyDeliveryDayMap = parse(this.surveyDeliveryDay, 'yyyyMMdd', new Date());
        }
        //20200731 S_Update
        /*
        if (this.infoStaff !== null) {
            this.infoStaffMap = this.infoStaff.split(',');
        }
        if (this.infoOffer !== null) {
            this.infoOfferMap = this.infoOffer.split(',');
        }
        */
        if (this.infoStaff !== null && emps != null) {
            this.infoStaffMap = emps.filter(me => this.infoStaff.split(',').indexOf(me.userId) >= 0).map(me => {return {userId: me.userId, userName: me.userName}});
        }
        if (this.infoOffer !== null && emps != null) {
            this.infoOfferMap = emps.filter(me => this.infoOffer.split(',').indexOf(me.userId) >= 0).map(me => {return {userId: me.userId, userName: me.userName}});
        }
        //20200731 E_Update
    }

    public convertForSave(userId: number, datePipe: DatePipe) {
        //20200731 S_Update
        /*
        this.infoStaff = this.infoStaffMap.join(',');
        this.infoOffer = this.infoOfferMap.join(',');
        */
        this.infoStaff = this.infoStaffMap.map(me => me['userId']).join(',');
        this.infoOffer = this.infoOfferMap.map(me => me['userId']).join(',');
        //20200731 E_Update

        /*
        this.pickDate = this.pickDateMap != null ? this.pickDateMap.toLocaleString() : null;
        this.startDate = this.startDateMap != null ? this.startDateMap.toLocaleString() : null;
        this.finishDate = this.finishDateMap != null ? this.finishDateMap.toLocaleString() : null;
        this.surveyRequestedDay = this.surveyRequestedDayMap != null ? this.surveyRequestedDayMap.toLocaleString() : null;
        this.surveyDeliveryDay = this.surveyDeliveryDayMap != null ? this.surveyDeliveryDayMap.toLocaleString() : null;
        */
        this.pickDate = this.pickDateMap != null ? datePipe.transform(this.pickDateMap, 'yyyyMMdd') : null;
        this.startDate = this.startDateMap != null ? datePipe.transform(this.startDateMap, 'yyyyMMdd') : null;
        this.finishDate = this.finishDateMap != null ? datePipe.transform(this.finishDateMap, 'yyyyMMdd') : null;
        this.surveyRequestedDay = this.surveyRequestedDayMap != null ? datePipe.transform(this.surveyRequestedDayMap, 'yyyyMMdd') : null;
        this.surveyDeliveryDay = this.surveyDeliveryDayMap != null ? datePipe.transform(this.surveyDeliveryDayMap, 'yyyyMMdd') : null;

        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

    }    
}

/**
 * 
 */
export class LandPlanInfo {
    land: Templandinfo;
    plans: Bukkenplaninfo[];
    sales: Bukkensalesinfo[];

    public constructor(init?: Partial<LandPlanInfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}
