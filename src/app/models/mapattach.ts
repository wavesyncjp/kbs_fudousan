export class MapAttach {
    pid: number;
    tempLandInfoPid: number;
    mapFileName = '';
    mapFilePath = '';
}

export class AttachFile {
    pid: number;
    tempLandInfoPid: number;
    attachFileName = '';
    attachFilePath = '';
    attachFileRemark = '';
}

export class ContractFile {
    pid: number;
    contractInfoPid: number;
    attachFileName = '';
    attachFilePath = '';
}

export class LocationAttach {
    pid: number;
    locationInfoPid: number;
    attachFileName = '';
    attachFilePath = '';
}
// 20220329 S_Add
export class InfoAttach {
    pid: number;
    infoPid: number;
    attachFileName = '';
    attachFilePath = '';
}
// 20220329 E_Add
// 20230227 S_Add
export class ContractAttach {
    pid: number;
    contractInfoPid: number;
    attachFileType: number;
    attachFileName = '';
    attachFilePath = '';
    // 20230511 S_Add
    attachFileChk: string;
    attachFileDay: string;
    attachFileDayMap: Date = null;;
    attachFileDisplayName: string;
    // 20230511 E_Add
}

export class BukkenSalesAttach {
    pid: number;
    bukkenSalesInfoPid: number;
    attachFileType: number;
    attachFileName = '';
    attachFilePath = '';
    // 20230511 S_Add
    attachFileChk: string;
    attachFileDay: string;
    attachFileDayMap: Date = null;;
    attachFileDisplayName: string;
    // 20230511 E_Add
}
// 20230227 E_Add
