export class Planhistorylist {

    paymentCode: number;
    planHistoryPid: number;
    paymentName: string;
    costFlg : string;
    addFlg: string;
    price: number;
    details: Planhistorydetaillist[];

}

export class Planhistorydetaillist {

    paymentCode: number;
    planHistoryPid: number;
    paymentName: string;
    costFlg : string;
    addFlg: string;
    price: number;
    details: [];

}
