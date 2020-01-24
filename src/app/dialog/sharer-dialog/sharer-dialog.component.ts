import { Component, OnInit, Inject } from '@angular/core';
import { BaseComponent } from 'src/app/BaseComponent';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { Locationinfo } from 'src/app/models/locationinfo';
import { Dialog } from 'src/app/models/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sharer-dialog',
  templateUrl: './sharer-dialog.component.html',
  styleUrls: ['./sharer-dialog.component.css']
})
export class SharerDialogComponent extends BaseComponent {

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
    this.service.changeTitle('登記名義人選択');
  }
  changeFlg(event, sharer) {
    sharer.outPutFlg = (event.checked ? 1 : 0);
  }
  cancel() {
    this.dialogRef.close();
  }
  ok() {
    const dlg = new Dialog({title: '確認', message: '登録しますが、よろしいですか？'});
    const dialogConfirm = this.dialog.open(ConfirmDialogComponent, {width: '400px',　height: '250px',　data: dlg});

    dialogConfirm.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.saveChooseSharer(this.data.sharers, this.data.contractDetail).then(res => {
          this.dialogRef.close();
        });
      }
    });
  }

}
