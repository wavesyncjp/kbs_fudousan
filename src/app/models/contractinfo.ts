import { Contractdetailinfo } from './contractdetailinfo';
import { Contractdependinfo } from './contractdependinfo';
import { DatePipe } from '@angular/common';

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

    vacationDayMap: Date = null;
    contractDayMap: Date = null;
    acquisitionConfirmDayMap: Date = null;
    startScheduledDayMap: Date = null;
    prioritySalesAgreementDayMap: Date = null;
    finishScheduledDayMap: Date = null;


    details: Contractdetailinfo[] = [];
    depends: Contractdependinfo[] = [];

    createUserId: number;
    updateUserId: number;

    public constructor(init?: Partial<Contractinfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert() {
        if (this.vacationDay) {
            this.vacationDayMap = new Date(Date.parse(this.vacationDay));
        }
        if (this.contractDay) {
            this.contractDayMap = new Date(this.contractDay);
        }
        if (this.acquisitionConfirmDay) {
            this.acquisitionConfirmDayMap = new Date(this.acquisitionConfirmDay);
        }
        if (this.startScheduledDay !== null) {
            this.startScheduledDayMap = new Date(this.startScheduledDay);
        }
        if (this.prioritySalesAgreementDay !== null) {
            this.prioritySalesAgreementDayMap = new Date(this.prioritySalesAgreementDay);
        }
        if (this.finishScheduledDay !== null) {
            this.finishScheduledDayMap = new Date(this.finishScheduledDay);
        }
    }

    public convertForSave(userId: number, datePipe: DatePipe) {
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

        this.vacationDay = this.vacationDayMap != null ? datePipe.transform(this.vacationDayMap, 'yyyyMMdd') : null;
        this.contractDay = this.contractDayMap != null ? datePipe.transform(this.contractDayMap, 'yyyyMMdd') : null;
        // tslint:disable-next-line:max-line-length
        this.acquisitionConfirmDay = this.acquisitionConfirmDayMap != null ? datePipe.transform(this.acquisitionConfirmDayMap, 'yyyyMMdd') : null;
        this.startScheduledDay = this.startScheduledDayMap != null ? datePipe.transform(this.startScheduledDayMap, 'yyyyMMdd') : null;
        // tslint:disable-next-line:max-line-length
        this.prioritySalesAgreementDay = this.prioritySalesAgreementDayMap != null ? datePipe.transform(this.prioritySalesAgreementDayMap, 'yyyyMMdd') : null;
        this.finishScheduledDay = this.finishScheduledDayMap != null ? datePipe.transform(this.finishScheduledDayMap, 'yyyyMMdd') : null;
    }
}
