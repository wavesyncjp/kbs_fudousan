import { Contractdetailinfo } from './contractdetailinfo';
import { Templandinfo } from './templandinfo';
import { Locationinfo } from './locationinfo';
import { SharerInfo } from './sharer-info';

export class Planinfo {

    pid: number;
    tempLandInfoPid: number;
    planNo: number;
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
    
    public constructor(init?: Partial<Planinfo>) {
        Object.assign(this, init);
    }

    public convertForSave(userId: number) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
    }
}
