import { DatePipe } from '@angular/common';
import { parse } from 'date-fns';

export class Information {
    pid: number;
    infoType = 0;// 20211227 Add
    infoDate = '';
    infoSubject = '';
    detailFlg = '1';
    finishFlg = '0';
    infoDetail = '';
    attachFileName = '';
    attachFilePath = '';
    // 20211227 S_Add
    approvalFlg = '';
    approvalAttachFileName = '';
    approvalAttachFilePath = '';
    // 20211227 E_Add
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
//            this.infoDateMap = new Date(this.infoDate);
            this.infoDateMap = parse(this.infoDate, 'yyyyMMdd', new Date());
        }
    }

    public convertForSave(userId: number, datePipe: DatePipe) {
 //       this.infoDate = this.infoDateMap != null ? this.infoDateMap.toLocaleString() : null;
        this.infoDate = this.infoDateMap != null ? datePipe.transform(this.infoDateMap, 'yyyyMMdd') : null;
        
        if (this.pid > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
    }

}
