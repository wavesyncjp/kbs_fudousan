import { Contractdependinfo } from './contractdependinfo';
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
    floorSpace: number;
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
    buysellFlg='0';
    dependType: string;
    dependFloor: string;
    oneBuilding: string;

    

    isContract: boolean;
    isDepend: boolean;
    contractData: ContractData = new ContractData();
    sharers: SharerInfo[];
    delSharers: number[];
    dependTypeMap: string[] = [];

    


    public constructor(init?: Partial<Locationinfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    copyContracDetail(detail: Contractdetailinfo) {
        this.isContract = true;
        this.contractData.contractorName = detail.contractorName;
        this.contractData.contractArea = detail.contractArea;
    }
    copyContracDetailForSave(detail: Contractdetailinfo) {
        detail.locationInfoPid = this.pid;
        detail.contractorName = this.contractData.contractorName;
        detail.contractArea = this.contractData.contractArea;
    }

    copyContracDepend(depend: Contractdependinfo) {
        this.isDepend = true;
        this.contractData.contractorName = depend.dependerName;
        this.contractData.dependType = depend.dependType;
        this.contractData.dependStructure = depend.dependStructure;
        this.contractData.dependFloor = depend.dependFloor;
        this.contractData.dependFloorArea = depend.dependFloorArea;
    }
    copyContracDependForSave(depend: Contractdependinfo) {
        depend.locationInfoPid = this.pid;
        depend.dependerName = this.contractData.contractorName;
        depend.dependType = this.contractData.dependType;
        depend.dependStructure = this.contractData.dependStructure;
        depend.dependFloor = this.contractData.dependFloor;
        depend.dependFloorArea = this.contractData.dependFloorArea;
    }

    public convert() {
        if (this.dependType !== null) {
            this.dependTypeMap = this.dependType.split(',');
        }
    }
    public convertForSave() {
        this.dependType = this.dependTypeMap.join(',');

    

    }
}

export class ContractData {
    contractorName: string;
    contractArea: number;
    dependType: string;
    dependStructure: string;
    dependFloor: number;
    dependFloorArea: string;
}
