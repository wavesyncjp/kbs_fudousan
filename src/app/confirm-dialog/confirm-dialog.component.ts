import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Dialog } from '../models/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Dialog) { }

  ngOnInit() {
  }
  cancel() {
    this.data.choose = false;
    this.dialogRef.close();
  }
  ok() {
    this.data.choose = true;
    this.dialogRef.close();
  }
}
