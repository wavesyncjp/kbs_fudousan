import { Component, OnInit, Inject } from '@angular/core';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-rental-select',
  templateUrl: './rental-select.component.html',
  styleUrls: ['./rental-select.component.css']
})
export class RentalSelectComponent extends BaseComponent {

  list: any[];
  selectedRentalPid: string;

  constructor(public router: Router,
    public service: BackendService,
    public dialogRef: MatDialogRef<RentalSelectComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    super(router, service, dialog);
  }

  ngOnInit() {
    // this.loadTemplate();

    this.list = this.data.map(me => { return { codeDetail: me['pid'], name: me['apartmentName'] } });

  }


  ok() {
    if (this.isBlank(this.selectedRentalPid)) {
      return;
    }
    this.dialogRef.close({ choose: true, selectedRentalPid: this.selectedRentalPid });
  }

  cancel() {
    this.dialogRef.close();
  }

}
