export class Paycontractdetailinfo {
    pid: number;
    tempLandInfoPid: number;
    payContractPid: number;
    paymentCode: string;
    payPrice: number;
    payTax: number;
    payPriceTax: number;
    closingDay: string;
    paymentSeason: string;
    contractDay: string;
    contractFixDay: string;
    paymentMethod: string;
    contractor: string;
    detailRemarks: string;

    closingDayMap: Date = null;
    contractDayMap: Date = null;
    contractFixDayMap: Date = null;

    deleteUserId: number;

    payPriceMap: string = "";
    payTaxMap: string = "";
    payPriceTaxMap: string = "";
}
