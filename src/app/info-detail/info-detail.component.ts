import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Information } from '../models/information';

@Component({
  selector: 'app-info-detail',
  templateUrl: './info-detail.component.html',
  styleUrls: ['./info-detail.component.css']
})
export class InfoDetailComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<InfoDetailComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Information) { }

  ngOnInit() {
    if (this.data == null) {
      this.data = new Information();
    }
  }
  ok() {
    this.dialogRef.close();
  }
}
