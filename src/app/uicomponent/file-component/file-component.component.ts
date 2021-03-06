import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { BackendService } from 'src/app/backend.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Dialog } from 'src/app/models/dialog';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-file',
  templateUrl: './file-component.component.html',
  styleUrls: ['./file-component.component.css']
})
export class FileComponentComponent implements OnInit {

  @Input()
  bukkenId: number;

  @Input()
  contractInfoId: number;

  // 20210311 S_Add
  @Input()
  locationInfoId: number;
  // 20210311 E_Add

  @Input()
  comment = '';

  @Input()
  hasComment = false;

  @Input()
  notButton = false;

  @Input()
  immediately = false;

  @Input()
  simpleMode: boolean;

  @Output() uploaded: EventEmitter<any> = new EventEmitter();

  @ViewChild('fileInput', {static: true})
  fileInput;

  file: File | null = null;

  constructor(public service: BackendService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  onChangeFileInput(): void {
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    this.file = files[0];
    // 20201021 S_Add
    if(this.immediately) {
      this.uploadWithoutConfirm();
    }
    // 20201021 E_Add
  }

  /**
   * ファイルドラッグアンドドロップ
   * @param event イベント
   */
  uploadFile(event) {
    this.file = event[0]; 
    if(this.immediately) {
      this.uploadWithoutConfirm();
    }
  }

  upload(): void {

    const dlg = new Dialog({title: '確認', message: 'ファイルアップロードしますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {

       this.uploadWithoutConfirm();

      }
    });
  }

  uploadWithoutConfirm() {
     // 物件アップロード
     if (this.bukkenId !== undefined && this.bukkenId > 0) {
      this.service.uploadFile(this.bukkenId, this.file, this.hasComment, this.comment).then(res => {
        this.snackBar.open('ファイルアップロード完了', null, {
          duration: 1000,
        });
        this.file = null;
        this.uploaded.emit(res);
        
      });
      if(this.hasComment) this.comment = '';
    }
    // 契約ファイルアップロード
    // tslint:disable-next-line:one-line
    else if (this.contractInfoId !== undefined && this.contractInfoId > 0 ) {
      this.service.uploadContractFile(this.contractInfoId, this.file).then(res => {
        this.snackBar.open('ファイルアップロード完了', null, {
          duration: 1000,
        });
        this.file = null;
        this.uploaded.emit(res);
      });
    }
    // 20210311 S_Add
    // 謄本ファイルアップロード
    else if (this.locationInfoId !== undefined && this.locationInfoId > 0 ) {
      this.service.uploadLocationFile(this.locationInfoId, this.file).then(res => {
        this.snackBar.open('ファイルアップロード完了', null, {
          duration: 1000,
        });
        this.file = null;
        this.uploaded.emit(res);
      });
    }
    // 20210311 E_Add
  }

  public uploadInfoFile(infoPid: number) {
    this.service.uploadInfoFile(infoPid, this.file).then(res => {
      this.snackBar.open('ファイルアップロード完了', null, {
        duration: 1000,
      });
      this.file = null;
      this.uploaded.emit(res);
    });
  }

  public hasFile() {
    return (this.file != null);
  }

}
