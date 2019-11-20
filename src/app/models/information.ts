export class Information {
pid: number;
infoDate = '';
infoSubject = '';
detailFlg = 1;
finishFlg = 0;
infoDetail = '';
attachFileName = '';
attachFilePath = '';
createDate = '';
public constructor(init?: Partial<Information>) {
    Object.assign(this, init);
}
}
