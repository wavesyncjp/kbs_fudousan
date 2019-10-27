import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ContractDetailComponent } from '../contract-detail/contract-detail.component';
import { JPDateAdapter } from '../adapters/adapters';
import { Router } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Stockcontractinfo } from '../models/stockcontractinfo';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class ContractListComponent  extends BaseComponent {

  constructor(public router: Router,
              public service: BackendService,
              public dialog: MatDialog,
              private spinner: NgxSpinnerService) {
                super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('仕入契約一覧');
  }

  searchContract() {
  }

  createNew() {
    const dialogRef = this.dialog.open(ContractDetailComponent, {
      width: '80%',
      height: '80%',
      data: new Stockcontractinfo()
    });
  }

}
