import { Component, OnInit, Inject } from '@angular/core';
import { Information } from 'src/app/models/information';
// 20200914 S_Update
//import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
// 20200914 E_Update
// 20200914 S_Add
import { BaseComponent } from 'src/app/BaseComponent';
import { BackendService } from 'src/app/backend.service';
import { Router } from '@angular/router';
// 20200914 E_Add

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.css']
})
// 20200914 S_Update
/*
export class InfoDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<InfoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Information) { }

  ngOnInit() {
  }
  ok() {
    this.dialogRef.close();
  }
}
*/
export class InfoDialogComponent extends BaseComponent {
  constructor(public dialogRef: MatDialogRef<InfoDialogComponent>,
                public router: Router,
                public service: BackendService,
                public dialog: MatDialog,
                @Inject(MAT_DIALOG_DATA) public data: Information) {
                  super(router, service, dialog);
                }
  ngOnInit() {
  }
  ok() {
    this.dialogRef.close();
  }
}
// 20200914 E_Update
