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

    // 20231010 S_Add
    manageCompanyName: string;
    manageCompanyAddress: string;
    manageCompanyTel: string;
    statusMap: string;// 登録状態
    msgMap: string;// NGのメッセージ
    // 20231010 E_Add

    // 20250418 S_Add
    successionSecurityDeposit: number;
    successionSecurityDepositMap: string;
    // 20250418 E_Add

    maxReceiveYear: number; // 20250509 Add

    createUserId: number;
    updateUserId: number;

    rentalContracts: RentalContract[];
    // 20240221 S_Delete
    // rentalContractsChanged: RentalContract[];// 20231027
    // 20240221 E_Delete
    rentalReceives: RentalReceive[];
    rentalReceivesChanged: RentalReceive[];
    yearReceiveMap: string;// 20240228 Add
    createDate: string;// 20250509 Add

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
        this.successionSecurityDepositMap = Converter.numberToString(this.successionSecurityDeposit);// 20250418 Add
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
        this.successionSecurityDeposit = Converter.stringToNumber(this.successionSecurityDepositMap);// 20250418 Add
    }
}
