import { Contractdetailinfo } from './contractdetailinfo';
import { Contractdependinfo } from './contractdependinfo';
import { Templandinfo } from './templandinfo';

export class Contractinfo {
    pid: number;
    tempLandInfoPid: number;
    contractNumber = '';
    promptDecideFlg: number;
    promptDecideContent: string;
    indivisibleFlg: number;
    thirdPartyFlg: number;
    equiExchangeFlg: number;
    tradingType: string;
    tradingPrice: number;
    tradingLandPrice: number;
    tradingBuildingPrice: number;
    tradingLeasePrice: number;
    setlementPrice: number;
    deposit1: number;
    deposit2: number;
    earnestPrice: number;
    tradingBalance: number;
    prioritySalesArea: number;
    prioritySalesFloor: number;
    prioritySalesPlanPrice: number;
    vacationDay: string;
    contractDay: string;
    attachFilePath: string;
    attachFileName: string;
    siteArea: number;
    siteAvailableArea: number;
    structure: string;
    scale: string;
    acquisitionConfirmDay: string;
    startScheduledDay: string;
    prioritySalesAgreementDay: string;
    finishScheduledDay: string;
    finishScheduledNote: string;

    details: Contractdetailinfo[];
    depends: Contractdependinfo[];

    createUserId: number;
    updateUserId: number;

    public constructor(init?: Partial<Contractinfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convertForSave(userId: number) {
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

    }
}
