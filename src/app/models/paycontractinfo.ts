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
    contractDay: Date;
    contractFixDay: Date;
    taxEffectiveDay: Date;
    remarks: string;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;

    details: Paycontractdetailinfo[];

    public constructor(init?: Partial<Paycontractinfo>) {
        Object.assign(this, init);
    }

    public convertForSave(userId: number) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
    }
}
