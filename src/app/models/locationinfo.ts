import { Contractdetailinfo } from './contractdetailinfo';
import { SharerInfo } from './sharer-info';
import { BottomLandInfo } from './bottomLandInfo';// 20210614 Add
import { Converter } from '../utils/converter';
import { DatePipe } from '@angular/common';//20200913 Add
import { LocationAttach } from './mapattach';// 20210311 Add

export class Locationinfo {
    pid: number;
    tempLandInfoPid: number;
    acquisitionDate: string;//20200913 Add
    ridgePid: string;
    inheritanceNotyet = '0';
    buildingNotyet = '0';
    //20200803 S_Delete
//    registPosition: number;
//    zipcode: string;
//    prefecture: string;
    //20200803 E_Delete
    address: string;
    blockNumber: string;
    buildingNumber: string;
    landCategory: string;
    area: number;
    tsubo: number;
    //20200803 S_Delete
//    floorAreaRate: number;
//    improveFlg: number;
    //20200803 E_Delete
//    buildingType: string;//20201124 Delete
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
    ownerRemark: string;
    buysellFlg = '0';
    dependFloor: string;
    dependType: string;
    //20200803 S_Delete
//    bukkenName = '';
//    floorAreaRatio: number = null;
    //20200803 E_Delete
    // 20201124 S_Add
    grossFloorArea: number;
    bottomLandPid: string;
    leasedArea: number;
    otherOverview: string;
    // 20201124 E_Add
    // 20210904 S_Add
    valuation: number;
    reducedChk: string;
    propertyTax: number;
    cityPlanningTax: number;
    // 20210904 E_Add
    completionDay: string;//20211025 Add
    
    acquisitionDateMap: Date = null;//20200913 Add
    completionDayMap: String = null;//20211025 Add

    areaMap: string;
    // 20201124 S_Add
    grossFloorAreaMap: string;
    leasedAreaMap: string;
    // 20201124 E_Add
    // 20210904 S_Add
    valuationMap: string;
    propertyTaxMap: string;
    cityPlanningTaxMap: string;
    // 20210904 E_Add

    locations: Locationinfo[];
    sharers: SharerInfo[];
    delSharers: number[];
    // 20210614 S_Add
    bottomLands: BottomLandInfo[] = [];
    delBottomLands: number[];
    // 20210614 E_Add
    contractDetail: Contractdetailinfo;
    contractDetail02: string; //不可分
    dependTypeMap: string[] = [];
    attachFiles: LocationAttach[];// 20210311 Add

    createUserId: number;
    updateUserId: number;

    public constructor(init?: Partial<Locationinfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert() {
        if (this.dependType !== null && this.dependType !== undefined && this.dependType.length > 0) {
            this.dependTypeMap = this.dependType.split(',');
        }
        //カレンダー
        this.acquisitionDateMap = Converter.stringToDate(this.acquisitionDate, 'yyyyMMdd');//20200913 Add

        this.completionDayMap = this.addSlash(this.completionDay);
        //カンマ

        this.areaMap = Converter.numberToString(this.area);
        // 20201124 S_Add
        this.grossFloorAreaMap = Converter.numberToString(this.grossFloorArea);
        this.leasedAreaMap = Converter.numberToString(this.leasedArea);
        // 20201124 E_Add
        // 20210904 S_Add
        this.valuationMap = Converter.numberToString(this.valuation);
        this.propertyTaxMap = Converter.numberToString(this.propertyTax);
        this.cityPlanningTaxMap = Converter.numberToString(this.cityPlanningTax);
        // 20210904 E_Add
        // 20210614 S_Add
        // 底地情報
        this.bottomLands.forEach((bottomLand) => {
            bottomLand.leasedAreaMap = Converter.numberToString(bottomLand.leasedArea);
        });
        // 20210614 E_Add
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
        //カレンダー
        this.acquisitionDate = Converter.dateToString(this.acquisitionDateMap, 'yyyyMMdd', datePipe);//20200913 Add
        this.completionDay = this.completionDayMap.replace(/\//g, '')
        //カンマ
        this.area = Converter.stringToNumber(this.areaMap);
        // 20201124 S_Add
        this.grossFloorArea = Converter.stringToNumber(this.grossFloorAreaMap);
        this.leasedArea = Converter.stringToNumber(this.leasedAreaMap);
        // 20201124 E_Add
        // 20210904 S_Add
        this.valuation = Converter.stringToNumber(this.valuationMap);
        this.propertyTax = Converter.stringToNumber(this.propertyTaxMap);
        this.cityPlanningTax = Converter.stringToNumber(this.cityPlanningTaxMap);
        // 20210904 E_Add
        // 20210614 S_Add
        // 底地情報
        this.bottomLands.forEach((bottomLand) => {
            bottomLand.leasedArea = Converter.stringToNumber(bottomLand.leasedAreaMap);
        });
        // 20210614 E_Add
    }

    addSlash(day: String) {
        if(day == null || day === '') return day;
        return `${day.substring(0, 4)}/${day.substring(4, 6)}/${day.substring(6)}`
    }
}
