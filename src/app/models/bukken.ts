export class User {
    userId: number;
    loginId: string;
    password: string;
    userName: string;
    token: string;
    result: boolean;
    msg: string;
}

export class Bukken {
    bukkenId: string;
    bukkenCode: string;
    bukkenName: string;
    zipcode: string;
    descriptions: BukkenDescription[];
}

export class BukkenDescription {
    zipcode: string;
    pref: string;
    address1: string;
    address2: string;
}

export class Contract {
    contractId: string;
}

export class Code {
    code: string;
    codeDetail: string;
    name: string;
    displayOrder: number;
}

export enum SYSTEM_CODE {
    CODE_001 = '001',
    CODE_002 = '002',
    CODE_003 = '003',
    CODE_004 = '004',
}
