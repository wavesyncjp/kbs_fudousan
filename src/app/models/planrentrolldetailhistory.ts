export class Planrentrolldetailhistory {

    pid: number;
    tempLandInfoPid: number;
    planPid: number;
    planHistoryPid: number;
    planRentRollPid: number;
    targetArea: string;
    space: number;
    rentUnitPrice: number;
    securityDeposit: number;
    backNumber: number;

    spaceMap: string = "";
    rentUnitPriceMap: string = "";
    securityDepositMap: string = "";

    createUserId: number;
    createDate: Date;
    updateUserId: number;
    updateDate: Date;
    deleteUserId: number;
}
