import { Component, OnInit, Inject } from '@angular/core';
import { BaseComponent } from 'src/app/BaseComponent';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { Locationinfo } from 'src/app/models/locationinfo';
import { Dialog } from 'src/app/models/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Contractdetailinfo } from 'src/app/models/contractdetailinfo';
import { Contractregistrant } from 'src/app/models/contractregistrant';
import { SharerInfo } from 'src/app/models/sharer-info';

@Component({
  selector: 'app-sharer-dialog',
  templateUrl: './sharer-dialog.component.html',
  styleUrls: ['./sharer-dialog.component.css']
})
export class SharerDialogComponent extends BaseComponent {

  originalRegists = [];

  constructor(public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<SharerDialogComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: Locationinfo) {
    super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    if(this.data.contractDetail == null) {
      this.data.contractDetail = new Contractdetailinfo();      
    }
    if(this.data.contractDetail.registrants == null) {
      this.data.contractDetail.registrants = [];
    }
    this.originalRegists = this.originalRegists.concat(this.data.contractDetail.registrants);
  }

  /**
   * 
   * @param event イベント
   * @param sharer ：共有者
   */
  changeFlg(event, sharer) {    
    if(event.checked) {
      const regist = new Contractregistrant();
      regist.sharerInfoPid = sharer.pid;      
      this.data.contractDetail.registrants.push(regist);
    }
    else {
      this.data.contractDetail.registrants = this.data.contractDetail.registrants.filter(item => item.sharerInfoPid !== sharer.pid);
    }    
  }

  isChecked(sharer: SharerInfo) {
    return this.data.contractDetail.registrants.filter(item => {return item.sharerInfoPid === sharer.pid;}).length > 0;
  }

  cancel() {
    this.data.contractDetail.registrants = this.originalRegists;
    this.dialogRef.close(false);
  }
  ok() {
    this.dialogRef.close(true);
  }

}
