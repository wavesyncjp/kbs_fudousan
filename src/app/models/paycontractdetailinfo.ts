export class Paycontractdetailinfo {
    pid: number;
    tempLandInfoPid: number;
    payContractPid: number;
    paymentCode: string;
    payPrice: number;
    payTax: number;
    payPriceTax: number;
    closingDay: string;
    contractDay: string;
    contractFixDay: string;
    paymentMethod: string;
    detailRemarks: string;

    closingDayMap: Date = null;
    contractDayMap: Date = null;
    contractFixDayMap: Date = null;

    deleteUserId: number;
}
