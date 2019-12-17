export class User {
  /*convertForSave(userId: number) {
    throw new Error("Method not implemented.");
  }*/
    userId: number;
    loginId: string;
    password: string;
    userName: string;
    token: string;
    result: boolean;
    msg: string;
    
    depCode:string;
    createUserId: number;
    updateUserId: number;
    employeeCode: string;

    // 20191209 S_Add
    public constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }
    public convertForSave(userId: number) {
    if (this.createUserId > 0) {
        this.updateUserId = userId;
    } else {
        this.createUserId = userId;
    }
}}

export class Department {
  /*convertForSave(userId: number) {
    throw new Error("Method not implemented.");
  }*/
    depCode: string;
    depName: string;
    createUserId: number;
    updateUserId: number;

    // 20191205 S_Add
    public constructor(init?: Partial<Department>) {
        Object.assign(this, init);
    }

    public convertForSave(userId: number) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
    }
    // 20191205 E_Add
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
