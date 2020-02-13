import { Contractregistrant } from './contractregistrant';

export class Contractdetailinfo {
    pid: number;
    contractInfoPid: number;
    locationInfoPid: number;
    contractDataType: string;
    contractArea: number;
    contractHave: number;

    registrants: Contractregistrant[];

    deleteUserId: number;
}
