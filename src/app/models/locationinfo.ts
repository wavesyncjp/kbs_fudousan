import { Stockcontractinfo } from './stockcontractinfo';

export class Locationinfo {
    pid: number;
    tempLandInfoPid: number;
    registPosition: number;
    zipcode: string;
    prefecture: string;
    address1: string;
    address2: string;
    blockNumber1: string;
    blockNumber2: string;
    buildingNumber: string;
    area: number;
    tsubo: number;
    floorAreaRate: number;
    improveFlg: number;
    buildingType: string;
    floorSpace: number;
    structure: string;
    coverageRate: number;
    landOwner: string;
    landOwnerAdress: string;
    landMortgage: string;
    builOwner: string;
    builOwnerAdress: string;
    builMortgage: string;
    contract: Stockcontractinfo;

    hasContract: boolean;
}
