import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { BackendService } from 'src/app/backend.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-file',
  templateUrl: './file-component.component.html',
  styleUrls: ['./file-component.component.css']
})
export class FileComponentComponent implements OnInit {

  @Input()
  bukkenId: number;

  @ViewChild('fileInput', {static: true})
  fileInput;

  file: File | null = null;

  constructor(public service: BackendService,
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
    this.service.uploadFile(this.bukkenId, this.file).then(res => {
      this.snackBar.open('ファイルアップロード完了', null, {
        duration: 2000,
      });
    });
  }

}
