import { Component } from '@angular/core';
import { BackendService } from '../backend.service';
import { BaseComponent } from '../BaseComponent';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { JPDateAdapter } from '../adapters/adapters';
import { Planhistorylist } from '../models/planhistorylist';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-planhistory-list',
  templateUrl: './planhistory-list.component.html',
  styleUrls: ['./planhistory-list.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class PlanHistoryListComponent extends BaseComponent {

  public history: Planhistorylist;
  public pid: number;
  
  constructor(public router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
      super(router, service,dialog);
      this.route.queryParams.subscribe(params => {
        this.pid = params.pid;
      });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('事業収支詳細');

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();

    const funcs = [];
    funcs.push(this.service.getPlanHistoryList(this.pid));
    
    Promise.all(funcs).then(values => {
        this.history = values[0];
    });
  }
}
