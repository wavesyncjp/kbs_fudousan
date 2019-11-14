import { OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from './backend.service';
import { Code } from './models/bukken';

export class BaseComponent implements OnInit {
    public sysCodes = {};
    public deps = [];
    public emps = [];

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
     * 部署変換
     */
    getDeps() {
        if (this.deps) {
            return this.deps.map(dep => new Code({code: dep.depCode, name: dep.depName}));
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
        // const patt = /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/;
        const patt = /^([0-9.])$/;
        const result = patt.test(event.key);
        return result;
    }
}
