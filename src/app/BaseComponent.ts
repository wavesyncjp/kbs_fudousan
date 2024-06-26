import { OnInit, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from './backend.service';
import { Code, PaymentType, ReceiveType } from './models/bukken';
import { formatDate } from '@angular/common';
import { parse } from 'date-fns';
import { Dialog } from './models/dialog';
import { ErrorDialogComponent } from './dialog/error-dialog/error-dialog.component';
// 20230309 S_Delete
// import { AttachFileDialogComponent } from './dialog/attachFile-dialog/attachFile-dialog.component';// 20230302 Add
// 20230309 E_Delete
import { MatDialog } from '@angular/material';
import { isNullOrUndefined } from 'util';

@Directive()
export class BaseComponent implements OnInit {
    public sysCodes = {};
    public deps = [];
    public emps = [];
    public users = [];
    public payTypes: PaymentType[] = [];
    public recTypes: ReceiveType[] = []; // 20210916 Add
    public lands = [];
    //    public codes = [];
    public sysCodeNameMsts = [];
    public taxes = [];
    public paymenttypes = [];
    public receivetypes = []; // 20210916 Add
    public kanjyos = []; // 20210628 Add
    public banks = [];// 20210905 Add
    public errorMsgs: string[] = [];
    public errors = {};

    private locale = 'en-US';

    constructor(public router: Router,
        public service: BackendService,
        public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.service.isLoginPage(false);

        if (!this.service.isLogin()) {
            const dlg = new Dialog({ title: 'エラー', message: '認証されていません。再度、ログインしてください。' });
            const dialogRef = this.dialog.open(ErrorDialogComponent, { width: '500px', height: '250px', data: dlg });

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
            return this.sysCodeNameMsts.map(codeNameMst => new Code({ codeDetail: codeNameMst.code, name: codeNameMst.name }));
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
            return this.deps.map(dep => new Code({ codeDetail: dep.depCode, name: dep.depName }));
        } else {
            return [];
        }
    }

    getUsers() {
        if (this.users) {
            return this.users.map(user => new Code({ codeDetail: user.userId, name: user.userName }));
        } else {
            return [];
        }
    }

    getEmps() {
        if (this.emps) {
            return this.emps.map(user => new Code({ codeDetail: user.employeeCode, name: user.userName }));
        } else {
            return [];
        }
    }

    // 20220517 S_Add
    /**
     * @param userId ユーザー名称取得
     */
    getUserName(userId: string): string {
        const lst = this.emps.filter(data => data.userId === userId).map(data => data.userName);
        if (lst.length > 0) {
            return lst[0];
        }
        return '';
    }
    // 20220517 E_Add

    getLands() {
        if (this.lands) {
            return this.lands.map(land => new Code({ codeDetail: land.pid, name: land.bukkenName }));
        } else {
            return [];
        }
    }

    /**
     * 支払種別
     */
    getPaymentTypes() {
        if (this.payTypes) {
            return this.payTypes.map(PaymentType => new Code({ codeDetail: PaymentType.paymentCode, name: PaymentType.paymentName }));
        } else {
            return [];
        }
    }

    /**
     * @param paymentCode 支払い名称取得
     */
    getPaymentName(paymentCode: string): string {
        const lst = this.payTypes.filter(data => data.paymentCode === paymentCode).map(data => data.paymentName);
        if (lst.length > 0) {
            return lst[0];
        }
        return '';
    }

    // 20210916 S_Add
    /**
     * 入金種別
     */
    getReceiveTypes() {
        if (this.recTypes) {
            return this.recTypes.map(ReceiveType => new Code({ codeDetail: ReceiveType.receiveCode, name: ReceiveType.receiveName }));
        } else {
            return [];
        }
    }

    /**
     * @param receiveCode 入金名称取得
     */
    getReceiveName(receiveCode: string): string {
        const lst = this.recTypes.filter(data => data.receiveCode === receiveCode).map(data => data.receiveName);
        if (lst.length > 0) {
            return lst[0];
        }
        return '';
    }
    // 20210916 E_Add

    // 20210628 S_Add
    /**
     * 勘定コード取得
     */
    getKanjyos() {
        if (this.kanjyos) {
            return this.kanjyos.map(kanjyo => new Code({ codeDetail: kanjyo.kanjyoCode, name: kanjyo.kanjyoName }));
        } else {
            return [];
        }
    }

    /**
     * @param kanjyoCode 勘定科目名称取得
     */
    getKanjyoNames(kanjyoCode: string): string {
        const lst = this.kanjyos.filter(data => data.kanjyoCode === kanjyoCode).map(data => data.kanjyoName);
        if (lst.length > 0) {
            return lst[0];
        }
        return '';
    }
    // 20210628 E_Add

    /**
     * 消費税取得
     */
    getTaxes() {
        if (this.taxes) {
            return this.taxes.map(Tax => new Code({ codeDetail: Tax.pid, name: Tax.taxRate }));
        } else {
            return [];
        }
    }

    // 20210905 S_Add
    /**
     * 銀行取得
     */
    getBanks() {
        if (this.banks) {
            return this.banks.map(bank => new Code({ codeDetail: bank.pid, name: bank.displayName }));
        } else {
            return [];
        }
    }
    // 20210905 E_Add

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
            const isValid = !isNaN(Number(str));
            if (!isValid) {
                this.errorMsgs.push(msg);
                this.errors[propName] = true;
            }
        }
    }

    // 20220213 S_Add
    checkMailAddress(str, propName, msg) {
        var pattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
        if (str != null && str !== '') {
            if (!pattern.test(str)) {
                this.errorMsgs.push(msg);
                this.errors[propName] = true;
            }
        }
    }
    // 20220213 E_Add

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

    formatDateTime(date: string, time: string) {
        if (date === undefined || date === '' || date == null) {
            return '';
        }
        if (time === undefined || time === '' || time == null) {
            return '';
        }
        const parseVal = parse(date + time, 'yyyyMMddHHmmss', new Date());
        return formatDate(parseVal, 'yyyy/MM/dd HH:mm:ss', this.locale);
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
        if (isNaN(Number(val))) val = val.toString().replace(/,/g, "").trim();
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

    // 20230309 S_Delete
    /*
    // 20230302 S_Add
    openAttachFileDialog(parentPid: number,fileType: number, attachFileType: string) {
        const dialogRef = this.dialog.open(AttachFileDialogComponent, {
        width: '60%',
        height: '400px',
        data: {parentPid, fileType, attachFileType}
        });
    }
    // 20230302 E_Add
     */
    // 20230309 E_Delete
    // 20230917 S_Add
    /**
     * コード
     * @param codes 
     */
    processCodes(codes: Code[]) {
        // コード
        if (codes !== null && codes.length > 0) {
            const uniqeCodes = [...new Set(codes.map(code => code.code))];
            uniqeCodes.forEach(code => {
                const lst = codes.filter(c => c.code === code);
                lst.sort((a, b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
                this.sysCodes[code] = lst;
            });
        }
    }
    // 20230917 E_Add

    // 20240610 S_Add
    // 再利用可能な日付ピッカーの初期化関数を定義します。
    initializeDatepicker($, selector, dateMapObject, dateKey) {
        $(selector).datepicker({
            changeMonth: true,
            changeYear: true,
            yearRange: `1950:${new Date().getFullYear() + 10}`,
            dateFormat: 'yy/m/d',
            onSelect: function (dataText) {
                dateMapObject[dateKey] = dataText;
            },
            showButtonPanel: true,
            ignoreReadonly: true,
            allowInputToggle: true,
            buttonImage: "assets/img/calendar-icon_wareki.png",
            buttonImageOnly: true,
            showOn: "both"
        }).on('change', function () {
            const inputDate = $(this).val();
            let currentDate = $(this).datepicker('getDate');
            let formattedDate = $.datepicker.formatDate('yy/m/d', currentDate);
    
            if (inputDate !== formattedDate) {
                const parseDate = (dateString, pattern) => {
                    const year = parseInt(dateString.substr(0, 4));
                    let month = parseInt(dateString.substr(4, pattern === 'yyyymmdd' ? 2 : 1));
                    let day = parseInt(dateString.substr(4 + (pattern === 'yyyymmdd' ? 2 : 1), pattern === 'yyyymmdd' ? 2 : 1));
                    
                    if (pattern === 'yyyymdd' || pattern === 'yyyymd') {
                        if (pattern === 'yyyymdd' && parseInt(dateString.substr(5, 2)) <= 12) {
                            month = parseInt(dateString.substr(4, 1));
                            day = parseInt(dateString.substr(5, 2));
                        }
                    }
    
                    if (month <= 12 && day <= new Date(year, month, 0).getDate()) {
                        return new Date(year, month - 1, day);
                    }
                    return null;
                };
    
                let isValidDate = !isNaN(currentDate.getTime());
                if (isValidDate) {
                    if (/^\d{8}$/.test(inputDate)) {
                        currentDate = parseDate(inputDate, 'yyyymmdd');
                    } else if (/^\d{6}$/.test(inputDate)) {
                        currentDate = parseDate(inputDate, 'yyyymd');
                    } else if (/^\d{7}$/.test(inputDate)) {
                        currentDate = parseDate(inputDate, 'yyyymdd') || parseDate(inputDate, 'yyyymd');
                    }
    
                    if (currentDate) {
                        formattedDate = $.datepicker.formatDate('yy/m/d', currentDate);
                        $(this).datepicker('setDate', formattedDate);
                    } else {
                        $(this).val(formattedDate); // 最後の有効な日付にリセットします。
                    }
                }
                dateMapObject[dateKey] = formattedDate;
            }
        });
    }
    // 20240610 E_Add
}
