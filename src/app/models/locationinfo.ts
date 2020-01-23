import { Contractdetailinfo } from './contractdetailinfo';
import { SharerInfo } from './sharer-info';

export class Locationinfo {
    pid: number;
    tempLandInfoPid: number;
    registPosition: number;
    zipcode: string;
    prefecture: string;
    address: string;
    blockNumber: string;
    buildingNumber: string;
    area: number;
    tsubo: number;
    floorAreaRate: number;
    improveFlg: number;
    buildingType: string;
    floorSpace: string;
    structure: string;
    coverageRate: number;
    owner: string;
    ownerAdress: string;
    equity: string;
    landMortgage: string;
    builMortgage: string;
    rightsForm: string;
    liveInfo: string;
    locationType: string;
    residence: string;
    buysellFlg = '0';
    dependType: string;
    dependFloor: string;
    oneBuilding: string;
    bukkenName = '';
    floorAreaRatio: number = null;

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
        if (this.dependType !== null) {
            this.dependTypeMap = this.dependType.split(',');
        }
    }
    public convertForSave(userId: number) {
        if (this.dependTypeMap != null && this.dependTypeMap.length > 0) {
            this.dependType = this.dependTypeMap.join(',');
        }
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
    }
}

