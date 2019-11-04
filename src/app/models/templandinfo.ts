import { Locationinfo } from './locationinfo';

export class Templandinfo {
    pid: number;
    bukkenNo = '';
    bukkenName = '';
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
    mapFileName = '';
    mapFilePath = '';
    locations: Locationinfo[];

    pickDateMap: Date = null;
    startDateMap: Date = null;
    finishDateMap: Date = null;
    infoStaffMap: string[] = [];
    infoOfferMap: string[] = [];

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

    public convertForSave() {
        this.infoStaff = this.infoStaffMap.join(',');
        this.infoOffer = this.infoOfferMap.join(',');
        this.pickDate = this.pickDateMap.toLocaleString();
        this.startDate = this.startDateMap.toLocaleString();
        this.finishDate = this.finishDateMap.toLocaleString();
    }
}
