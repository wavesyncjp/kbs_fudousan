export class Plandetail {

    pid: number;
    tempLandInfoPid: number;
    planPid: number;
    paymentCode: string;
    routePrice: number;
    burdenDays: number;
    unitPrice: number;
    complePriceMonth: number;
    dismantlingMonth: number;
    valuation: number;
    rent: number;
    totalMonths: number;
    commissionRate: number;
    backNumber: number;
    price: number;
    priceTax: number;

    routePriceMap: string = "";
    burdenDaysMap: string = "";
    unitPriceMap: string = "";
    complePriceMonthMap: string = "";
    dismantlingMonthMap: string = "";
    valuationMap: string = "";
    rentMap: string = "";
    totalMonthsMap: string = "";
    commissionRateMap: string = "";
    priceMap: string = "";
    priceTaxMap: string = "";

    createUserId: number;
    createDate: Date;
    updateUserId: number;
    updateDate: Date;
    deleteUserId: number;
}
