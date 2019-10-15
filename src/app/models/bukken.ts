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
