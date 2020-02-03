export class Information {
    pid: number;
    infoDate = '';
    infoSubject = '';
    detailFlg = '1';
    finishFlg = '0';
    infoDetail = '';
    attachFileName = '';
    attachFilePath = '';
    createUserId: number;
    updateUserId: number;
    createDate: Date;

    infoDateMap: Date = null;
  department: any;
  result: string;

    public constructor(init?: Partial<Information>) {
        Object.assign(this, init);
    }

    public convert() {
        if (this.infoDate) {
            this.infoDateMap = new Date(this.infoDate);
        }
    }

    public convertForSave(userId: number) {
        this.infoDate = this.infoDateMap != null ? this.infoDateMap.toLocaleString() : null;
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
    }

}
