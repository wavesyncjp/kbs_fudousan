import { DatePipe } from '@angular/common';
import { Converter } from '../utils/converter';

export class RentalReceive {
    pid: number;
    rentalInfoPid: number;
    rentalContractPid: number;
    contractInfoPid: number;
    locationInfoPid: number;
    tempLandInfoPid: number;
    receiveCode: string;
    receiveMonth: string;
    receiveDay: string;
    receivePrice: number;
    receiveFlg: string;

    createUserId: number;
    updateUserId: number;
    deleteUserId: number;

    public constructor(init?: Partial<RentalReceive>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert(emps: any[]) {
        //カレンダー
        
        // 数字
    }

    public convertForSave(userId: number, datePipe: DatePipe, isJoin: boolean = false) {
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        //カレンダー

        // 数字
    }
}
