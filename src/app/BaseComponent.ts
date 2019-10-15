import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from './backend.service';

export class BaseComponent implements OnInit {

    constructor(public router: Router,
                public service: BackendService) {

    }

    ngOnInit(): void {
        this.service.isLoginPage(false);
        this.service.checkLogin().subscribe((msg: string) => {
            // tslint:disable-next-line:radix
            if (Number.parseInt(msg) !== 1) {
                this.router.navigate(['/login']);
            }
        });
    }
}
