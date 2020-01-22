import { Component, OnInit, Inject } from '@angular/core';
import { Locationinfo } from '../models/locationinfo';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharerInfo } from '../models/sharer-info';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Code } from '../models/bukken';

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.css']
})
export class LocationDetailComponent extends BaseComponent {

  pid: number;

  constructor(public router: Router,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public dialogRef: MatDialogRef<Locationinfo>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: Locationinfo) {
      super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('謄本情報詳細');
    this.spinner.show();

    const funcs = [];
    funcs.push(this.service.getCodes(['002', '003', '007', '011']));
    Promise.all(funcs).then(values => {
      // コード
      const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }

      this.spinner.hide();
    });
  }

  /**
   * 所有者追加
   * @param loc ：所有地
   */
  addSharer() {
    if (this.data.sharers == null) {
      this.data.sharers = [];
    }
    if (this.data.sharers.length === 0) {
      this.data.sharers.push(new SharerInfo());
      this.data.sharers.push(new SharerInfo());
    } else {
      this.data.sharers.push(new SharerInfo());
    }
  }

  /**
   * 所有者削除
   * @param loc ：所有地
   */
  deleteSharer(sharerPos: number) {
    const sharer = this.data.sharers[sharerPos];
    if (sharer.pid > 0) {
      if (this.data.delSharers == null) {
        this.data.delSharers = [];
      }
      this.data.delSharers.push(sharer.pid);
    }
    this.data.sharers.splice(sharerPos, 1);
  }

  /**
   * 共有者情報
   */
  convertSharer() {
      if (this.data.sharers == null) {
        this.data.sharers = [];
      }
      if (this.data.sharers.length === 0) {
        this.data.sharers.push(new SharerInfo());
      }
      // 共通
      const firstSharer = this.data.sharers[0];
      firstSharer.sharer = this.data.owner;
      firstSharer.sharerAdress = this.data.ownerAdress;
      firstSharer.shareRatio = this.data.equity;
      firstSharer.buysellFlg = this.data.buysellFlg;
  }

  changeArea(event) {
    const val = event.target.value;
    if (this.isNumberStr(val)) {
      this.data.tsubo = Number(val) * 0.3025;
    }
  }


  changeType() {
    // 土地
    if (this.data.locationType === '01') {
      this.data.buildingNumber = '';
      this.data.floorSpace = null;
      this.data.liveInfo = '';
      this.data.dependTypeMap = null;
      this.data.dependFloor = null;
      this.data.liveInfo = null;
      this.data.oneBuilding = null;
    } else if (this.data.locationType === '02') {
      this.data.blockNumber = '';
      this.data.area = null;
      this.data.tsubo = null;
      this.data.oneBuilding = null;
    }  else if (this.data.locationType === '03') {
    } else if (this.data.locationType === '04') {
      this.data.oneBuilding = null;
    }
  }

   /**
   * チェックボックス変更
   */
  flgChange(event, flg: any) {
    flg.buysellFlg = (event.checked ? 1 : 0);
   }

  save() {
    if (!this.validate()) {
      return;
    }

    const dlg = new Dialog({title: '確認', message: '謄本情報を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.data.convertForSave(this.service.loginUser.userId);
        // 削除された所在地も送る

        this.service.saveLocation(this.data).then(values => {
          const finishDlg = new Dialog({title: '完了', message: '謄本情報を登録しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(res => {
            this.spinner.hide();
            this.dialogRef.close(true);
          });
        });
      }
    });
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};
    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  cancel() {
    this.spinner.hide();
    this.dialogRef.close(false);
  }

}
