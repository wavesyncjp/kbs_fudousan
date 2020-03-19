import { Templandinfo } from './templandinfo';

export class Plandetail {

    pid: number;
    tempLandInfoPid: number;
    planpid: number;
    landCost: number;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;
    settlement: number;
    period : string;
    traffic : string;

    public constructor(init?: Partial<Plandetail>) {
        Object.assign(this, init);
    }

    public convertForSave(userId: number) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
    }
}
