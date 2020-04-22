import { Locationinfo } from './locationinfo';
import { MapAttach, AttachFile } from './mapattach';
import {Bukkenplaninfo} from './bukkenplaninfo'
import { SharerInfo } from './sharer-info';
import { from } from 'rxjs';

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
    indivisibleDenominator: number;
    landCategory = '';
    floorAreaRatio: number = null;
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
    bukkenplans: Bukkenplaninfo[];


    pickDateMap: Date = null;
    startDateMap: Date = null;
    finishDateMap: Date = null;
    surveyRequestedDayMap: Date = null;
    surveyDeliveryDayMap: Date = null;
    infoStaffMap: string[] = [];
    infoOfferMap: string[] = [];
    
    createUserId: number;
    updateUserId: number;
    
    

    public constructor(init?: Partial<Templandinfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert() {
        if (this.pickDate) {
            this.pickDateMap = new Date(this.pickDate);
        }
        if (this.startDate) {
            this.startDateMap = new Date(this.startDate);
        }
        if (this.finishDate) {
            this.finishDateMap = new Date(this.finishDate);
        }
        if (this.surveyRequestedDay) {
            this.surveyRequestedDayMap = new Date(this.surveyRequestedDay);
        }
        if (this.surveyDeliveryDay) {
            this.surveyDeliveryDayMap = new Date(this.surveyDeliveryDay);
        }
        if (this.infoStaff !== null) {
            this.infoStaffMap = this.infoStaff.split(',');
        }
        if (this.infoOffer !== null) {
            this.infoOfferMap = this.infoOffer.split(',');
        }
    }

    public convertForSave(userId: number) {
        this.infoStaff = this.infoStaffMap.join(',');
        this.infoOffer = this.infoOfferMap.join(',');
        this.pickDate = this.pickDateMap != null ? this.pickDateMap.toLocaleString() : null;
        this.startDate = this.startDateMap != null ? this.startDateMap.toLocaleString() : null;
        this.finishDate = this.finishDateMap != null ? this.finishDateMap.toLocaleString() : null;
        this.surveyRequestedDay = this.surveyRequestedDayMap != null ? this.surveyRequestedDayMap.toLocaleString() : null;
        this.surveyDeliveryDay = this.surveyDeliveryDayMap != null ? this.surveyDeliveryDayMap.toLocaleString() : null;

        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

    }
}
