import { Contractregistrant } from './contractregistrant';

export class Contractdetailinfo {
    pid: number;
    contractInfoPid: number;
    locationInfoPid: number;
    contractArea: string;
    contractHave: number;
    contractDataType: string;
    deleteUserId: number;

    contractHaveMap: string = "";

    registrants: Contractregistrant[];
}
