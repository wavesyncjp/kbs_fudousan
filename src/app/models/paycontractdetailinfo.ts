import { Contractregistrant } from './contractregistrant';

export class Paycontractdetailinfo {
    pid: number;
    tempLandInfoPid: number;
    payContractPid: number;
    paymentCode: string;
    payPrice: number;
    payTax: number;
    payPriceTax: number;
    closingDay: Date;
    contractDay: Date;
    contractFixDay: Date;
    paymentMethod: string;
    detailRemarks: string;

    registrants: Contractregistrant[];

    deleteUserId: number;
}
