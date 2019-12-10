import { OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from './backend.service';
import { Code } from './models/bukken';
import { isNumber } from 'util';

export class BaseComponent implements OnInit {
    public sysCodes = {};
    public deps = [];
    public emps = [];
    public users = [];

    public errorMsgs: string[] = [];
    public errors = {};

    constructor(public router: Router,
                public service: BackendService) {

    }

    ngOnInit(): void {
        this.service.isLoginPage(false);
        this.service.checkLogin().subscribe((msg: string) => {
            // tslint:disable-next-line:radix
            if (Number.parseInt(msg) !== 1) {
                // this.router.navigate(['/login']);
            }
        });
    }

    /**
     * システムコード取得
     */
    getCode(code: string) {
        return this.sysCodes[code];
    }

    /**
     * コード名称
     * @param code ：コード
     * @param codeDetail ：コード詳細
     */
    getCodeTitle(code: string, codeDetail: string) {
        return this.sysCodes[code].filter(c => c.codeDetail === codeDetail).map(c => c.name)[0];
    }

    /**
     * 部署変換
     */
    getDeps() {
        if (this.deps) {
            return this.deps.map(dep => new Code({code: dep.depCode, name: dep.depName}));
        } else {
        return [];
        }
    }

    getUsers() {
        if (this.users) {
            return this.users.map(user => new Code({code: user.userId, name: user.userName}));
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
        return list.includes(val);
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
}
