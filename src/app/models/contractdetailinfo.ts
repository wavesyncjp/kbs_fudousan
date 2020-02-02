import { Contractregistrant } from './contractregistrant';

export class Contractdetailinfo {
    pid: number;
    contractInfoPid: number;
    locationInfoPid: number;
    contractDataType: string;
    contractArea: number;

    registrants: Contractregistrant[];

    deleteUserId: number;
}
