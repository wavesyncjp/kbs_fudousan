export class User {

    userId: number;
    loginId: string = "";
    password: string;
    userName: string;
    userNameKana: string;
    employeeCode: string;
    depCode: string;
    authority: string;
    mailAddress: string;// 20220213 Add
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
    displayOrder: number;
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
    costReceiptFlg: string;// 20211104 Add
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

// 20210916 S_Add
export class ReceiveType {

    receiveCode: string;
    receiveName: string;
    categoryFlg: string;
    displayOrder: number;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;

    public constructor(init?: Partial<ReceiveType>) {
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

// 20210916 E_Add

// 20210628 S_Add
export class Kanjyo {

    kanjyoCode: string;
    kanjyoName: string;
    supplierName: string;
    taxFlg: string;
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

export class KanjyoFix {

    pid: number;
    paymentCode: string;
    debtorKanjyoCode: string;
    debtorKanjyoDetailName: string;
    creditorKanjyoCode: string;
    creditorKanjyoDetailName: string;
    // 20240802 S_Update
    // transFlg: string = "";
    contractType: string = "";
    // 20240802 E_Update
    transDebtorKanjyoCode : string;
    transCreditorKanjyoCode : string;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;

    // 20240930 S_Add
    statusMap: string;// 登録状態
    msgMap: string;// NGのメッセージ
    // 20240930 E_Add

    public constructor(init?: Partial<KanjyoFix>) {
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
// 20210628 E_Add

// 20210831 S_Add
export class Bank {

    pid: number;
    contractType: string;
    displayName: string;
    bankName: string;
    branchName: string;
    depositType: string;
    accountNumber: string;
    accountHolder: string;
    displayOrder: string;
    createUserId: number;
    updateUserId: number;
    updateDate: Date;
    createDate: Date;

    public constructor(init?: Partial<Bank>) {
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
// 20210831 E_Add
