import { Component, OnInit, Inject } from '@angular/core';
import { Information } from 'src/app/models/information';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.css']
})
export class InfoDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<InfoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Information) { }

  ngOnInit() {
  }
  ok() {
    this.dialogRef.close();
  }
}
