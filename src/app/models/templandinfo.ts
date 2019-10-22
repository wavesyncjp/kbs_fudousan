import { Locationinfo } from './locationinfo';

export class Templandinfo {
    pid: number;
    bukkenNo: string;
    bukkenName: string;
    pickDate: Date;
    department: string;
    staff: string;
    infoStaff: string;
    infoOffer: string;
    startDate: Date;
    finishDate: Date;
    result: string;
    remark1: string;
    remark2: string;
    indivisibleFlg: number;
    indivisibleNumerator: number;
    indivisibleDenominator: number;
    landCategory: string;
    mapFileName: string;
    mapFilePath: string;
    createUserId: number;
    createDate: Date;
    updateUserId: number;
    updateDate: Date;
    deleteUserId: number;
    deleteDate: Date;
    locations: Locationinfo[];
}
