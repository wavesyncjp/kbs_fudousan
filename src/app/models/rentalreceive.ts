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

    // 20231010 S_Add
    isExistRenContractMap: boolean;
    isDisableByRenContractMap: boolean;
    receiveDayMap: Date = null;
    // 20231010 E_Add

    public constructor(init?: Partial<RentalReceive>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    // 20231010 S_Update 
    // public convert(emps: any[]) {
    //     //カレンダー

    //     // 数字
    // }

    public convert() {
        //カレンダー
        this.receiveDayMap = Converter.stringToDate(this.receiveDay, 'yyyyMMdd');
    }
    // 20231010 E_Update 

    public convertForSave(userId: number, datePipe: DatePipe, isJoin: boolean = false) {
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        //カレンダー
        // 20231010 S_Add 
        this.receiveDay = Converter.dateToString(this.receiveDayMap, 'yyyyMMdd', datePipe);
        // 20231010 E_Add 

        // 数字
    }
}
