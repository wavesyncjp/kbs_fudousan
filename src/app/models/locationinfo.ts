import { Stockcontractinfo } from './stockcontractinfo';

export class Locationinfo {
    pid: number;
    tempLandInfoPid: number;
    registPosition: number;
    zipcode: string;
    prefecture: string;
    address: string; /*11/26変更*/
    blockNumber: string; /*11/26変更*/
    buildingNumber: string;
    area: number;
    tsubo: number;
    floorAreaRate: number;
    improveFlg: number;
    buildingType: string;
    floorSpace: number;
    structure: string;
    coverageRate: number;
    owner: string; /*11/26変更*/
    ownerAdress: string; /*11/26変更*/
    landMortgage: string;
    builMortgage: string;
    contract: Stockcontractinfo;
    rightsForm: string; /*11/26追加*/
    liveInfo: string;　/*11/26追加*/


    hasContract: boolean;
}
