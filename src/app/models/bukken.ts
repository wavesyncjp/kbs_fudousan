export class User {

    userId: number;
    loginId: string;
    password: string;
    userName: string;
    employeeCode: string;
    depCode: string;
    authority: string;
    token: string;
    result: boolean;
    msg: string;
    createUserId: number;
    updateUserId: number;
    createDate: Date;
    updateDate: Date;
 
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
}

export class Department {

    depCode: string;
    depName: string;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;

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

}

export class Employee {
    employeeCode: string;
    employeeName: string;
    depCode: string;
}

export class Code {

    code: string;
    nameHeader: string;
    codeDetail: string;
    name: string;
    displayOrder: number;
    createUserId: number;
    updateUserId: number;
    createDate: Date;
    updateDate: Date;
    /*
    public constructor(init?: any) {
        if (init) {
            this.codeDetail = init.code;
            this.name = init.name;
        }
    }
    */
    public constructor(init?: Partial<Code>) {
        Object.assign(this, init);
    }

    public convertForSave(userId: number) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
    }
}

export class CodeNameMst {

    code: string;
    name: string;
}

export enum SYSTEM_CODE {
    CODE_001 = '001',
    CODE_002 = '002',
    CODE_003 = '003',
    CODE_004 = '004',
}

export class PaymentType {

    paymentCode: string;
    paymentName: string;
    costFlg: string;
    addFlg: string;
    taxFlg: string;
    utilityChargesFlg: string;
    categoryFlg: string;
    payContractEntryFlg: string;
    displayOrder: number;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;

    public constructor(init?: Partial<PaymentType>) {
        Object.assign(this, init);
    }

    public convertForSave(userId: number) {
        if (this.createUserId > 0) {
            this.updateUserId = userId;
        } else {
            this.createUserId = userId;
        }
    }
}


