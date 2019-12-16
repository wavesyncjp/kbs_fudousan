import { Contractdependinfo } from './contractdependinfo';
import { Contractdetailinfo } from './contractdetailinfo';

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
    landMortgage: string;
    builMortgage: string;
    rightsForm: string;
    liveInfo: string;
    locationType: string;

    isContract: boolean;
    isDepend: boolean;
    contractData: ContractData = new ContractData();

    copyContracDetail(detail: Contractdetailinfo) {
        this.contractData.contractorName = detail.contractorName;
        this.contractData.contractArea = detail.contractArea;
    }

    copyContracDepend(depend: Contractdependinfo) {
        this.contractData.dependerName = depend.dependerName;
        this.contractData.dependType = depend.dependType;
        this.contractData.dependStructure = depend.dependStructure;
        this.contractData.dependFloor = depend.dependFloor;
        this.contractData.dependFloorArea = depend.dependFloorArea;
    }
}

export class ContractData {
    contractorName: string;
    contractArea: number;
    dependerName: string;
    dependType: string;
    dependStructure: string;
    dependFloor: number;
    dependFloorArea: string;
}
