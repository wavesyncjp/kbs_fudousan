import { Component, OnInit, Inject } from '@angular/core';
import { Dialog } from 'src/app/models/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-finish-dialog',
  templateUrl: './finish-dialog.component.html',
  styleUrls: ['./finish-dialog.component.css']
})
export class FinishDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FinishDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Dialog) { }

  ngOnInit() {
  }
  ok() {
    this.dialogRef.close();
  }
}
