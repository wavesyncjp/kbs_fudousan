import { Contractdetailinfo } from './contractdetailinfo';
import { SharerInfo } from './sharer-info';
import { Converter } from '../utils/converter';
import { DatePipe } from '@angular/common';//20200913 Add

export class Locationinfo {
    pid: number;
    tempLandInfoPid: number;
    acquisitionDate: string;//20200913 Add
    //20200803 S_Delete
//    registPosition: number;
//    zipcode: string;
//    prefecture: string;
    //20200803 E_Delete
    address: string;
    blockNumber: string;
    buildingNumber: string;
    area: number;
    tsubo: number;
    //20200803 S_Delete
//    floorAreaRate: number;
//    improveFlg: number;
    //20200803 E_Delete
    buildingType: string;
    floorSpace: string;
    structure: string;
//    coverageRate: number;//20200803 Delete
    owner: string;
    ownerAdress: string;
    equity: string;
    //20200803 S_Delete
//    landMortgage: string;
//    builMortgage: string;
    //20200803 E_Delete
    rightsForm: string;
    liveInfo: string;
    locationType: string;
//    residence: string;//20200803 Delete
    buysellFlg = '0';
    dependType: string;
    dependFloor: string;
    //20200803 S_Delete
//    bukkenName = '';
//    floorAreaRatio: number = null;
    //20200803 E_Delete
    landCategory: string;
    ownerRemark: string;
    ridgePid: string;
    buildingNotyet = '0';
    inheritanceNotyet = '0';

    acquisitionDateMap: Date = null;//20200913 Add

    areaMap:string;

    contractDetail: Contractdetailinfo;
    sharers: SharerInfo[];
    delSharers: number[];
    dependTypeMap: string[] = [];
    createUserId: number;
    updateUserId: number;
    locations: Locationinfo[];

    public constructor(init?: Partial<Locationinfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert() {
        if (this.dependType !== null && this.dependType !== undefined && this.dependType.length > 0) {
            this.dependTypeMap = this.dependType.split(',');
        }
        this.acquisitionDateMap = Converter.stringToDate(this.acquisitionDate, 'yyyyMMdd');//20200913 Add
        this.areaMap = Converter.numberToString(this.area);
    }
    //20200913 S_Update
//    public convertForSave(userId: number) {
    public convertForSave(userId: number, datePipe: DatePipe) {
    //20200913 E_Update
        if (this.dependTypeMap != null && this.dependTypeMap.length > 0) {
            this.dependType = this.dependTypeMap.join(',');
        }
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        this.acquisitionDate = Converter.dateToString(this.acquisitionDateMap, 'yyyyMMdd', datePipe);//20200913 Add
        this.area = Converter.stringToNumber(this.areaMap);
    }
}
