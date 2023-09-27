import { Component, OnInit, ViewChild, Input, EventEmitter, Output, forwardRef } from '@angular/core';
import { BackendService } from 'src/app/backend.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Dialog } from 'src/app/models/dialog';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';// 20221116 Add

@Component({
  selector: 'app-file',
  templateUrl: './file-component.component.html',
  styleUrls: ['./file-component.component.css'],
  // 20221116 S_Add
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FileComponentComponent),
    },
  ],
  // 20221116 E_Add
})
export class FileComponentComponent implements OnInit {

  // 20211231 S_Add
  @Input()
  id: string;
  // 20211231 E_Add

  @Input()
  bukkenId: number;

  @Input()
  contractInfoId: number;

  // 20230227 S_Add
  @Input()
  attachFileType: number;
  // 20230227 E_Add

  // 20210311 S_Add
  @Input()
  locationInfoId: number;
  // 20210311 E_Add

  // 20220329 S_Add
  @Input()
  infoPid: number;
  // 20220329 E_Add

  // 20230927 S_Add
  // 掲示板承認済添付ファイル用
  @Input()
  infoPid2: number;
  // 20230927 E_Add

  // 20230227 S_Add
  @Input()
  bukkenSalesInfoPid: number;
  // 20230227 E_Add

  // 20230917 S_Add
  @Input()
  evictionInfoPid: number;
  // 20230917 E_Add

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
    // 20221024 S_Update
    /*
    this.file = event[0]; 
    if(this.immediately) {
      this.uploadWithoutConfirm();
    }
    */
    for (var i = 0; i < event.length; i++) {
      this.file = event[i];
      if(this.immediately) {
        this.uploadWithoutConfirm();
      }
    }
    // 20221024 E_Update
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
    // 20230227 S_Add
    // 仕入契約添付ファイルアップロード
    else if (this.contractInfoId !== undefined && this.contractInfoId > 0
      && this.attachFileType !== undefined && this.attachFileType == 0) {
      this.service.uploadContractAttach(this.contractInfoId, this.attachFileType, this.file).then(res => {
        this.snackBar.open('ファイルアップロード完了', null, {
          duration: 1000,
        });
        this.file = null;
        this.uploaded.emit(res);
      });
    }
    // 20230227 E_Add
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
    // 20220329 S_Add
    // インフォメーション添付ファイルアップロード
    else if (this.infoPid !== undefined && this.infoPid > 0 ) {
      this.service.uploadInfoAttachFile(this.infoPid, this.file).then(res => {
        this.snackBar.open('ファイルアップロード完了', null, {
          duration: 1000,
        });
        this.file = null;
        this.uploaded.emit(res);
      });
    }
    // 20220329 E_Add
    // 20230927 S_Add
    // 承認済添付ファイルアップロード
    else if (this.infoPid2 !== undefined && this.infoPid2 > 0 ) {
      this.service.uploadInfoApprovalAttach(this.infoPid2, this.file).then(res => {
        this.snackBar.open('ファイルアップロード完了', null, {
          duration: 1000,
        });
        this.file = null;
        this.uploaded.emit(res);
      });
    }
    // 20230927 E_Add
    // 20230227 S_Add
    // 物件売契約添付ファイルアップロード
    else if (this.bukkenSalesInfoPid !== undefined && this.bukkenSalesInfoPid > 0
      && this.attachFileType !== undefined && this.attachFileType == 0) {
      this.service.uploadBukkenSalesAttach(this.bukkenSalesInfoPid, this.attachFileType, this.file).then(res => {
        this.snackBar.open('ファイルアップロード完了', null, {
          duration: 1000,
        });
        this.file = null;
        this.uploaded.emit(res);
      });
    }
    // 20230227 E_Add
    // 20230917 S_Add
    // 立ち退き添付ファイルアップロード
    else if (this.evictionInfoPid !== undefined && this.evictionInfoPid > 0) {
      this.service.evictionAttachUpload(this.evictionInfoPid, this.file).then(res => {
        this.snackBar.open('ファイルアップロード完了', null, {
          duration: 1000,
        });
        this.file = null;
        this.uploaded.emit(res);
      });
    }
    // 20230917 E_Add
  }

  // 20221116 S_Add
  public uploadInfoAttachFile(infoPid: number, afterFunc: any) {
    this.service.uploadInfoAttachFile(infoPid, this.file).then(res => {
      afterFunc();
    });
  }
  // 20221116 E_Add

  // 20230927 S_Add
  public uploadInfoApprovalAttach(infoPid: number, afterFunc: any) {
    this.service.uploadInfoApprovalAttach(infoPid, this.file).then(res => {
      afterFunc();
    });
  }
  // 20230927 E_Add

  public uploadInfoFile(infoPid: number) {
    this.service.uploadInfoFile(infoPid, this.file).then(res => {
      this.snackBar.open('ファイルアップロード完了', null, {
        duration: 1000,
      });
      this.file = null;
      this.uploaded.emit(res);
    });
  }

  // 20211227 S_Add
  public uploadApprovedInfoFile(infoPid: number) {
    this.service.uploadApprovedInfoFile(infoPid, this.file).then(res => {
      this.snackBar.open('ファイルアップロード完了', null, {
        duration: 1000,
      });
      this.file = null;
      this.uploaded.emit(res);
    });
  }
  // 20211227 E_Add

  public hasFile() {
    return (this.file != null);
  }

}
