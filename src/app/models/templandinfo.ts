import { Locationinfo } from './locationinfo';
import { MapAttach, AttachFile } from './mapattach';
import {Bukkenplaninfo} from './bukkenplaninfo'
import { Bukkensalesinfo } from './bukkensalesinfo';
import { DatePipe } from '@angular/common';
import { Converter } from '../utils/converter';

export class Templandinfo {
    pid: number;
    bukkenNo = '';
    //20200902 S_Update
//    contractBukkenNo: number;
    contractBukkenNo = '';
    //20200902 E_Update
    bukkenName = '';
    residence = '';
    pickDate = '';
    department = '';
//    staff = '';//20200801 Delete
    infoStaff = '';
    infoOffer = '';
    startDate = '';
    finishDate = '';
    result = '';
    bukkenListChk = '';// 20210111 Add
    remark1 = '';
    remark2 = '';
    indivisibleFlg: number;
    indivisibleNumerator: number;
    indivisibleDenominator: string;
    importance: string;// 20210111 Add
//    landCategory = '';//20200801 Delete
    floorAreaRatio: string;
    coverageRate: number = null;
    surveyRequestedDay: string;
    surveyRequestedDayChk: string;// 20210111 Add
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
    seller: string = '0';// 2001124 Add

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

    //20210117 緯度経度追加
    latitude: number;
    longitude: number;
    
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
        //日付
        this.pickDateMap = Converter.stringToDate(this.pickDate, 'yyyyMMdd');
        this.startDateMap = Converter.stringToDate(this.startDate, 'yyyyMMdd');
        this.finishDateMap = Converter.stringToDate(this.finishDate, 'yyyyMMdd');
        this.surveyRequestedDayMap = Converter.stringToDate(this.surveyRequestedDay, 'yyyyMMdd');
        this.surveyDeliveryDayMap = Converter.stringToDate(this.surveyDeliveryDay, 'yyyyMMdd');
        /*
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
        */
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

    //20200819 S_Update
    /*
    public convertForSave(userId: number, datePipe: DatePipe) {
    */
    public convertForSave(userId: number, datePipe: DatePipe, isJoin: boolean = false) {
        //20200731 S_Update
        /*
        this.infoStaff = this.infoStaffMap.join(',');
        this.infoOffer = this.infoOfferMap.join(',');
        this.infoStaff = this.infoStaffMap.map(me => me['userId']).join(',');
        this.infoOffer = this.infoOfferMap.map(me => me['userId']).join(',');
        */
        //20200731 E_Update
        if(isJoin) {
            this.infoStaff = this.infoStaffMap.map(me => me['userId']).join(',');
            this.infoOffer = this.infoOfferMap.map(me => me['userId']).join(',');
        }
        //20200819 E_Update
        
        /*
        this.pickDate = this.pickDateMap != null ? this.pickDateMap.toLocaleString() : null;
        this.startDate = this.startDateMap != null ? this.startDateMap.toLocaleString() : null;
        this.finishDate = this.finishDateMap != null ? this.finishDateMap.toLocaleString() : null;
        this.surveyRequestedDay = this.surveyRequestedDayMap != null ? this.surveyRequestedDayMap.toLocaleString() : null;
        this.surveyDeliveryDay = this.surveyDeliveryDayMap != null ? this.surveyDeliveryDayMap.toLocaleString() : null;
        
        this.pickDate = this.pickDateMap != null ? datePipe.transform(this.pickDateMap, 'yyyyMMdd') : null;
        this.startDate = this.startDateMap != null ? datePipe.transform(this.startDateMap, 'yyyyMMdd') : null;
        this.finishDate = this.finishDateMap != null ? datePipe.transform(this.finishDateMap, 'yyyyMMdd') : null;
        this.surveyRequestedDay = this.surveyRequestedDayMap != null ? datePipe.transform(this.surveyRequestedDayMap, 'yyyyMMdd') : null;
        this.surveyDeliveryDay = this.surveyDeliveryDayMap != null ? datePipe.transform(this.surveyDeliveryDayMap, 'yyyyMMdd') : null;
        */
        //日付
        this.pickDate = Converter.dateToString(this.pickDateMap, 'yyyyMMdd', datePipe);
        this.startDate = Converter.dateToString(this.startDateMap, 'yyyyMMdd', datePipe);
        this.finishDate = Converter.dateToString(this.finishDateMap, 'yyyyMMdd', datePipe);
        this.surveyRequestedDay = Converter.dateToString(this.surveyRequestedDayMap, 'yyyyMMdd', datePipe);
        this.surveyDeliveryDay = Converter.dateToString(this.surveyDeliveryDayMap, 'yyyyMMdd', datePipe);

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
