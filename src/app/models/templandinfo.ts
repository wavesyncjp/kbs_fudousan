import { Locationinfo } from './locationinfo';
import { MapAttach, AttachFile } from './mapattach';

export class Templandinfo {
    pid: number;
    bukkenNo = '';
    bukkenName = '';
    residence = '';
    pickDate = '';
    department = '';
    staff = '';
    infoStaff = '';
    infoOffer = '';
    startDate = '';
    finishDate = '';
    result = '';
    remark1 = '';
    remark2 = '';
    indivisibleFlg: number;
    indivisibleNumerator: number;
    indivisibleDenominator: number;
    landCategory = '';
    floorAreaRatio: number = null;
    coverageRate: number = null;
    mapFiles: MapAttach[];
    attachFiles: AttachFile[];
    locations: Locationinfo[];
    buysellFlg='0';

    pickDateMap: Date = null;
    startDateMap: Date = null;
    finishDateMap: Date = null;
    infoStaffMap: string[] = [];
    infoOfferMap: string[] = [];

    createUserId: number;
    updateUserId: number;

    public constructor(init?: Partial<Templandinfo>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    public convert() {
        if (this.pickDate) {
            this.pickDateMap = new Date(this.pickDate);
        }
        if (this.startDate) {
            this.startDateMap = new Date(this.startDate);
        }
        if (this.finishDate) {
            this.finishDateMap = new Date(this.finishDate);
        }
        if (this.infoStaff !== null) {
            this.infoStaffMap = this.infoStaff.split(',');
        }
        if (this.infoOffer !== null) {
            this.infoOfferMap = this.infoOffer.split(',');
        }
    }

    public convertForSave(userId: number) {
        this.infoStaff = this.infoStaffMap.join(',');
        this.infoOffer = this.infoOfferMap.join(',');
        this.pickDate = this.pickDateMap != null ? this.pickDateMap.toLocaleString() : null;
        this.startDate = this.startDateMap != null ? this.startDateMap.toLocaleString() : null;
        this.finishDate = this.finishDateMap != null ? this.finishDateMap.toLocaleString() : null;

        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }

    }
}
