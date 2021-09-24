import { Checklib } from "../utils/checklib";
import { Code } from "./bukken";

export class Receivecontractdetailinfo {
    pid: number;
    receiveContractPid: number;
    tempLandInfoPid: number;
    receiveCode: string;
    receivePrice: number;
    receiveTax: number;
    receivePriceTax: number;
    receiveSeason: string;
    contractDay: string;
    contractFixDay: string;
    contractFixTime: string = "0:00";
    receiveMethod: string;
    contractor: string;
    detailRemarks: string;

    contractDayMap: Date = null;
    contractFixDayMap: Date = null;

    deleteUserId: number;

    receivePriceMap: string = "";
    receiveTaxMap: string = "";
    receivePriceTaxMap: string = "";

    contractorMap: Code[];

    public constructor(init?: Partial<Receivecontractdetailinfo>) {
        Object.assign(this, init);
        this.forDisplay();
    }

    forDisplay() {
        this.contractorMap = [];
        if(!Checklib.isBlank(this.contractor)) {
            this.contractor.split('|').forEach(me => {
                let data = new Code({codeDetail: me.split(',').join('_'), name: ''});
                this.contractorMap.push(data);
            });
        }
    }
}
