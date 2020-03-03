//import { Contractdetailinfo } from './paycontractdetailinfo';
import { DatePipe } from '@angular/common';
import { parse } from 'date-fns';
import { ContractFile } from './mapattach';
import { ContractSellerInfo } from './contractsellerinfo';
import { Paycontractdetailinfo } from './paycontractdetailinfo';

export class Paycontractinfo {

    pid: number;
    tempLandInfoPid: number;
    depCode: string;
    userId: number;
    supplierName: string;
    branchName: string;
    accountName: string;
    contractPrice: number;
    contractTax: number;
    contractPriceTax: number;
    contractDay: string;
    contractFixDay: string;
    taxEffectiveDay: string;
    remarks: string;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;

    contractDayMap: Date = null;
    contractFixDayMap: Date = null;
    taxEffectiveDayMap: Date = null;

    details: Paycontractdetailinfo[];

    public constructor(init?: Partial<Paycontractinfo>) {
        Object.assign(this, init);
    }

    public convert() {
        if (this.contractDay) {
            this.contractDayMap = parse(this.contractDay, 'yyyyMMdd', new Date());
        }
        if (this.contractFixDay) {
            this.contractFixDayMap = parse(this.contractFixDay, 'yyyyMMdd', new Date());
        }
        if (this.taxEffectiveDay) {
            this.taxEffectiveDayMap = parse(this.taxEffectiveDay, 'yyyyMMdd', new Date());
        }
    }

    public convertForSave(userId: number, datePipe: DatePipe) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

        this.contractDay = this.contractDayMap != null ? datePipe.transform(this.contractDayMap, 'yyyyMMdd') : null;
        this.contractFixDay = this.contractFixDayMap != null ? datePipe.transform(this.contractFixDayMap, 'yyyyMMdd') : null;
        this.taxEffectiveDay = this.taxEffectiveDayMap != null ? datePipe.transform(this.taxEffectiveDayMap, 'yyyyMMdd') : null;
    }
}
