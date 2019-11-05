import { Component, OnInit } from '@angular/core';
import { InfoDetailComponent } from '../info-detail/info-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { Information } from '../models/information';

@Component({
  selector: 'app-info-list',
  templateUrl: './info-list.component.html',
  styleUrls: ['./info-list.component.css']
})
export class InfoListComponent extends BaseComponent {

  constructor(public router: Router,
              public dialog: MatDialog,
              public service: BackendService) {
    super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('インフォメーション');
  }

  createNew() {
    const dialogRef = this.dialog.open(InfoDetailComponent, {
      width: '60%',
      height: '500px',
      data: new Information()
    });
  }
}
