export class Information {
pid: number;
infoDate = '';
infoSubject = '';
detailFlg = '';
infoDetail = '';
attachFileName = '';
attachFilePath = '';
createDate = '';
public constructor(init?: Partial<Information>) {
    Object.assign(this, init);
}
}
