import { Information } from '../../models/information'
import { NoticeDetailComponent } from '../../notice-detail/notice-detail.component';
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

      this.files.forEach(me => {
        // me.isSelected = true;
      });
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

  /**
   * お知らせ作成
   */
  createNotice(){
    const row = new Information();
    row.attachFiles = []; 
    this.files.forEach(el => {
      if(el.isSelected){
          row.attachFiles.push({
            pid: 0,
            infoPid: 0,
            attachFileName : el.attachFileName,
            attachFilePath : el.attachFilePath
        });
      }
    });

    const dialogRef = this.dialog.open(NoticeDetailComponent, {
      width: '60%',
      height: '680px',
      data: row
    });
    dialogRef.componentInstance.bukkenName = this.data.bukkenNo + ':' + this.data.bukkenName;
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
      }
    });
  }
}
