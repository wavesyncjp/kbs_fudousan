import { Checklib } from "../utils/checklib";
import { Code } from "./bukken";

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
    // 20210719 S_Add
    fbApprovalFlg: number = 0;
    fbOutPutFlg: number = 0; 
    fbOutPutDate: string;
    fbOutPutTime: string;
    sortCreatedFlg: number = 0;
    // 20210719 E_Add

    closingDayMap: Date = null;
    contractDayMap: Date = null;
    contractFixDayMap: Date = null;

    deleteUserId: number;

    payPriceMap: string = "";
    payTaxMap: string = "";
    payPriceTaxMap: string = "";

    contractorMap: Code[];

    public constructor(init?: Partial<Paycontractdetailinfo>) {
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
