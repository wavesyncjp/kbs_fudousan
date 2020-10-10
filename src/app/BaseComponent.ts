import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from './backend.service';
import { Code, PaymentType } from './models/bukken';
import { formatDate } from '@angular/common';
import { parse } from 'date-fns';
import { Dialog } from './models/dialog';
import { ErrorDialogComponent } from './dialog/error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material';
import { isNullOrUndefined } from 'util';

export class BaseComponent implements OnInit {
    public sysCodes = {};
    public deps = [];
    public emps = [];
    public users = [];
    public payTypes: PaymentType[]  = [];
    public lands = [];
//    public codes = [];
    public sysCodeNameMsts = [];
    public taxes = [];
    public paymenttypes= [];
    public errorMsgs: string[] = [];
    public errors = {};

    private locale = 'en-US';

    constructor(public router: Router,
                public service: BackendService,
                public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.service.isLoginPage(false);

        if(!this.service.isLogin()) {
            const dlg = new Dialog({title: 'エラー', message: '認証されていません。再度、ログインしてください。'});
            const dialogRef = this.dialog.open(ErrorDialogComponent, {width: '500px', height: '250px', data: dlg});

            dialogRef.afterClosed().subscribe(result => {
                this.router.navigate(['/login']);
            });
        }
    }

    /**
     * システムコード取得
     */
    getCode(code: string) {
        return this.sysCodes[code];
    }

    /**
     * コード名称マスタ取得
     */
    getCodeNameMst() {
        if (this.sysCodeNameMsts) {
            return this.sysCodeNameMsts.map(codeNameMst => new Code({codeDetail: codeNameMst.code, name: codeNameMst.name}));
        } else {
            return [];
        }
    }

    /**
     * コード名称
     * @param code ：コード
     * @param codeDetail ：コード詳細
     */
    getCodeTitle(code: string, codeDetail: string) {
        if (codeDetail == null || codeDetail === '') {
            return '';
        }
        return this.sysCodes[code].filter(c => c.codeDetail === codeDetail).map(c => c.name)[0];
    }

    /**
     * コード明細取得
     * @param code ：コード
     * @param title ：名称
     */
    getCodeDetail(code: string, title: string) {
        return this.sysCodes[code].filter(c => c.name === title).map(c => c.codeDetail)[0];
    }

    /**
     * 複数コードのタイトル
     * @param code ：コード
     * @param codeDetail ：コード詳細
     */
    getCodeTitles(code: string, details: string) {
        if (details == null || details === '') {
            return '';
        }
        const lst = details.split(',');
        const ret = this.sysCodes[code].filter(c => lst.indexOf(c.codeDetail) >= 0).map(c => c.name);
        if (ret != null && ret.length > 0) {
            return ret.join(',');
        }
        return '';
    }

    /**
     * 部署変換
     */
    getDeps() {
        if (this.deps) {
            return this.deps.map(dep => new Code({codeDetail: dep.depCode, name: dep.depName}));
        } else {
        return [];
        }
    }

    getUsers() {
        if (this.users) {
            return this.users.map(user => new Code({codeDetail: user.userId, name: user.userName}));
        } else {
        return [];
        }
    }

    getEmps() {
        if (this.emps) {
            return this.emps.map(user => new Code({codeDetail: user.employeeCode, name: user.userName}));
        } else {
        return [];
        }
    }

    getLands() {
        if (this.lands) {
            return this.lands.map(land => new Code({codeDetail: land.pid, name: land.bukkenName}));
        } else {
        return [];
        }
    }

    /**
     * 支払種別
     */
    getPaymentTypes() {
        if (this.payTypes) {
            return this.payTypes.map(PaymentType => new Code({codeDetail: PaymentType.paymentCode, name: PaymentType.paymentName}));
        } else {
        return [];
        }
    }

    /**
     * @param paymentCode 支払い名称取得
     */
    getPaymentName(paymentCode: string): string {
        const lst = this.payTypes.filter(data => data.paymentCode === paymentCode).map(data => data.paymentName);
        if(lst.length > 0) {
            return lst[0];
        }
        return '';
    }

    /**
     * 消費税取得
     */
    getTaxes() {
        if (this.taxes) {
            return this.taxes.map(Tax => new Code({codeDetail: Tax.pid, name: Tax.taxRate}));
        } else {
            return [];
        }
    }

    numericOnly(event): boolean {
        const patt = /^([0-9])$/;
        const result = patt.test(event.key);
        return result;
    }

    floatOnly(event): boolean {
        const patt = /^([0-9.])$/;
        const result = patt.test(event.key);
        return result;
    }

    isNumberStr(str: string) {
        if (str != null && str !== '') {
            return !isNaN(Number(str));
        }
        return true;
    }

    isBlank(str): boolean {
        return (!str || /^\s*$/.test(str));
    }

    /**
     * 空白チェック
     * @param str : チェック文字列
     * @param propName ：項目名
     * @param msg ：エラーメッセージ
     */
    checkBlank(str, propName, msg) {
        const isInValid = (!str || /^\s*$/.test(str));
        if (isInValid) {
            this.errorMsgs.push(msg);
            this.errors[propName] = true;
        }
    }

    checkNumber(str, propName, msg) {
        if (str != null && str !== '') {
            const isValid =  !isNaN(Number(str));
            if (!isValid) {
                this.errorMsgs.push(msg);
                this.errors[propName] = true;
            }
        }
    }

    inList(list: string[], val = '') {
        return list != null && list.includes(val);
    }

    changeCheck(list: string[], val = '', $event) {
        if ($event.checked) {
            if (!list.includes(val)) {
                list.push(val);
            }
        } else {
            if (list.includes(val)) {
                list.splice(list.indexOf(val), 1);
            }
        }
    }

    formatDay(val: string, format: string) {
        if (val === undefined || val === '' || val == null) {
            return '';
        }
        const parseVal = parse(val, 'yyyyMMdd', new Date());
        return formatDate(parseVal, format, this.locale);
    }

    formatIntNumber(val: number, unit: string = null) {
        if (val === undefined || val == null) {
            return '';
        }
        const parts = val.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.') + (unit != null ? ' ' + unit : '');
    }
    
    //数値にカンマを付ける作業
    //20200709 S_Add
    numberFormat(val: number | string) {
        // 空の場合そのまま返却
        if (isNullOrUndefined(val) || val === '') return '';
        // 全角から半角へ変換し、既にカンマが入力されていたら事前に削除
        if(isNaN(Number(val))) val = val.toString().replace(/,/g, "").trim();
        // 整数部分を3桁カンマ区切りへ
        //val = Number(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        //20200901 S_Update
        //val = Number(val).toLocaleString();
        val = isNaN(Number(val)) ? String(val) : Number(val).toLocaleString();
        //20200901 E_Update
        return val;
    }
    
    removeComma(val: number | string) {
        if (isNullOrUndefined(val) || val === '') {
            return '';
        }
        val = val.toString().replace(/,/g, "").trim();
        return val;
    }
    //20200709 E_Add

    getNumber(val) {
        if (isNullOrUndefined(val) || val === '' || isNaN(val)) return 0;
        return Number(val);
    }
}
