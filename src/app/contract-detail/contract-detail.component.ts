import { Component, OnInit, Inject } from '@angular/core';
import { BackendService } from '../backend.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Stockcontractinfo } from '../models/stockcontractinfo';

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.css']
})
export class ContractDetailComponent extends BaseComponent {

  constructor(public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<ContractDetailComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Stockcontractinfo) {
      super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
