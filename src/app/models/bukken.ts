export class User {
    userId: number;
    loginId: string;
    password: string;
    userName: string;
    token: string;
    result: boolean;
    msg: string;
}

export class Department {
  convertForSave(userId: number) {
    throw new Error("Method not implemented.");
  }
    depCode: string;
    depName: string;
}

export class Employee {
    employeeCode: string;
    employeeName: string;
    depCode: string;
}

export class Code {
    public constructor(init?: any) {
        if (init) {
            this.codeDetail = init.code;
            this.name = init.name;
        }
    }
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
