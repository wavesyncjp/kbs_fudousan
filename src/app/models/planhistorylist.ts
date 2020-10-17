export class Planhistorylist {

    paymentCode: string;
    planHistoryPid: number;
    paymentName: string;
    costFlg : string;
    addFlg: string;
    price: number;
    details: Planhistorydetaillist[];
    planHistoryName: string;//20201016

}

export class Planhistorydetaillist {

    paymentCode: string;
    planHistoryPid: number;
    paymentName: string;
    costFlg : string;
    addFlg: string;
    price: number;
    planHistoryName: string;//20201016

}
