export class Planhistorylist {

    paymentCode: string;
    planHistoryPid: number;
    paymentName: string;
    costFlg : string;
    addFlg: string;
    price: number;
    details: Planhistorydetaillist[];

}

export class Planhistorydetaillist {

    paymentCode: string;
    planHistoryPid: number;
    paymentName: string;
    costFlg : string;
    addFlg: string;
    price: number;

}
