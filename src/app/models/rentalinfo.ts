import { RentalContract } from './rentalcontract';
import { DatePipe } from '@angular/common';
import { Converter } from '../utils/converter';
import { RentalReceive } from './rentalreceive';

export class RentalInfo {
    pid: number;
    contractInfoPid: number;
    contractSellerInfoPid: number;
    locationInfoPid: number;
    tempLandInfoPid: number;
    bankPid: number;
    apartmentName: string;// 建物名称
    ownershipRelocationDate: string;
    ownershipRelocationDateMap: Date = null;
    validType: string;
    totalUnits: number;
    totalUnitsMap: string;

    createUserId: number;
    updateUserId: number;

    rentalContracts: RentalContract[];
    rentalReceives: RentalReceive[];
    rentalReceivesChanged: RentalReceive[];

    public constructor(init?: Partial<RentalInfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert() {
        //カレンダー
        this.ownershipRelocationDateMap = Converter.stringToDate(this.ownershipRelocationDate, 'yyyyMMdd');

        // 数字
        this.totalUnitsMap = Converter.numberToString(this.totalUnits);
    }

    public convertForSave(userId: number, datePipe: DatePipe) {
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
        //カレンダー
        this.ownershipRelocationDate = Converter.dateToString(this.ownershipRelocationDateMap, 'yyyyMMdd', datePipe);

        // 数字
        this.totalUnits = Converter.stringToNumber(this.totalUnitsMap);
    }
}
