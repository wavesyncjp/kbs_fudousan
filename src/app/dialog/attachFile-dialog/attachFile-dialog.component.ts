import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { BackendService } from 'src/app/backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attachFile-dialog',
  templateUrl: './attachFile-dialog.component.html',
  styleUrls: ['./attachFile-dialog.component.css']
})

export class AttachFileDialogComponent implements OnInit {
  public files : any[];
  public parentPid : number;
  public fileType : number;

  public isCanDelete : boolean = false;
  public isCanAttach : boolean = false;

  constructor(public dialogRef: MatDialogRef<AttachFileDialogComponent>,
                public router: Router,
                public service: BackendService,
                public dialog: MatDialog,
                @Inject(MAT_DIALOG_DATA) public data: any) {
                  
                }
  ngOnInit() {
    this.parentPid = this.data.parentPid;
    this.fileType = this.data.fileType;
    this.service.getFiles(this.parentPid,this.fileType,this.data.attachFileType).then(ret => {
      this.files = ret;
    });
  }
  ok() {
    this.dialogRef.close();
  }
  deleteAttachFile(element:any)
  {
    //TODO
  }

  /**
   * 添付ファイルアップロード
   * @param event ：ファイル
   */
  attachUploaded(event) {
    //TODO
  }
}


