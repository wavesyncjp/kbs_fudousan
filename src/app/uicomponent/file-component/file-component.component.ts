import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { BackendService } from 'src/app/backend.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Dialog } from 'src/app/models/dialog';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-file',
  templateUrl: './file-component.component.html',
  styleUrls: ['./file-component.component.css']
})
export class FileComponentComponent implements OnInit {

  @Input()
  bukkenId: number;

  @Input()
  comment = '';

  @Input()
  hasComment = false;

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
        this.service.uploadFile(this.bukkenId, this.file, this.hasComment, this.comment).then(res => {
          this.snackBar.open('ファイルアップロード完了', null, {
            duration: 2000,
          });
          this.file = null;
          this.uploaded.emit(res);
        });
      }
    });
  }

}
