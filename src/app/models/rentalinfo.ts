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

    public convertForSave(userId: number, datePipe: DatePipe, isJoin: boolean = false) {
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

    public getContractDateMin() {
        if (this.pid <= 0 || this.rentalContracts == null || this.rentalContracts.length == 0) {
            return null; 
          }
      
        return this.rentalContracts.filter(a=>a.loanPeriodStartDate != null).reduce((minDate, currentItem) => {
            return currentItem.loanPeriodStartDate < minDate ? currentItem.loanPeriodStartDate : minDate;
            }, this.rentalContracts[0].loanPeriodStartDate);
    }
    public getContractDateMax() {
        if (this.pid <= 0 || this.rentalContracts == null || this.rentalContracts.length == 0) {
            return null; 
          }
      
        return this.rentalContracts.filter(a=>a.loanPeriodEndDate != null).reduce((maxDate, currentItem) => {
            return currentItem.loanPeriodEndDate > maxDate ? currentItem.loanPeriodEndDate : maxDate;
            }, this.rentalContracts[0].loanPeriodEndDate);
    }
}
