import { DatePipe } from '@angular/common';
import { parse } from 'date-fns';
import { InfoAttach } from './mapattach';// 20220329 Add

export class Information {
    pid: number;
    infoType = 0;// 20211227 Add
    infoDate = '';
    infoSubject = '';
    detailFlg = '1';
    finishFlg = '0';
    infoDetail = '';
    answer = '';// 20220223 Add
    answerTimeLimit = '';// 20220517 Add
    attachFileName = '';
    attachFilePath = '';
    confirmFlg = '0';// 20220519 Add
    // 20211227 S_Add
    approvalFlg = '0';
    approvalAttachFileName = '';
    approvalAttachFilePath = '';
    // 20211227 E_Add
    approvalDateTime: Date;// 20220517 Add

    attachFiles: InfoAttach[];// 20220329 Add

    createUserId: number;
    updateUserId: number;
    createDate: Date;

    infoDateMap: Date = null;
    addedFileSendFlg = '0';// 20220519 Add
    // 20220329 S_Delete
    /*
    department: any;
    result: string;
    */
    // 20220329 E_Delete

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
