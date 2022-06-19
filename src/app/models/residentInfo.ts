export class ResidentInfo {
    pid: number;
    tempLandInfoPid: number;
    registPosition: number;
    locationInfoPid: number;
    roomNo: string;
    borrowerName: string;
    rentPrice: number;
    expirationDate: string;
    createUserId: number;
    updateUserId: number;

    rentPriceMap: string;
    expirationDateMap: Date = null;
}
