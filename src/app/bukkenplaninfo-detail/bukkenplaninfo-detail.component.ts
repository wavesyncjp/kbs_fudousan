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
import {Bukkenplaninfo} from '../models/bukkenplaninfo';



@Component({
  selector: 'app-bukkenplaninfo-detail',
  templateUrl: './bukkenplaninfo-detail.component.html',
  styleUrls: ['./bukkenplaninfo-detail.component.css']
})
export class BukkenplaninfoDetailComponent extends BaseComponent {

  pid: number;
  oldLocationType = '';
  public cond: any;
  public locAdresses =[];
 
  constructor(public router: Router,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public dialogRef: MatDialogRef<Locationinfo>,
              public dialog: MatDialog,
              //public dataplan: Bukkenplaninfo,
              /*public sharer: SharerInfo,*/
              @Inject(MAT_DIALOG_DATA) public data: Locationinfo) {
      super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('物件情報詳細');
    this.spinner.show();
    this.oldLocationType = this.data.locationType;

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
     if(this.data.pid == undefined) this.data.locationType = '01';
     else{
       
      if (this.data.locationType === '04') {

        this.cond = {
          tempLandInfoPid: this.data.tempLandInfoPid,
          locationType: '03'
        };
        const funcs = [];
        funcs.push(this.service.searchLocation(this.cond));
        Promise.all(funcs).then(values => {
          // 住所
          this.locAdresses = values[0];
          // this.spinner.hide();
        });
      }
      
     }
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
      this.data.tsubo = Math.floor(Number(val) * 0.3025 * 100 ) / 100;
    }
  }


  changeType(event) {
    if (event.target.value !== this.oldLocationType && this.oldLocationType != null && this.oldLocationType !== '') {
      const dlg = new Dialog({title: '確認', message: '区分を変更すると一部の項目は値がクリアされるます。よろしいですか？'});
      const dlgRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px',
        height: '250px',
        data: dlg
      });
      dlgRef.afterClosed().subscribe(result => {
        if (dlg.choose) {
          this.applyChangeType();
        } else {
          this.data.locationType = this.oldLocationType;
        }
      });      
    } else {
      this.applyChangeType();
    }
  }

  applyChangeType() {
    if (this.data.locationType === '01') {
      this.data.buildingNumber = '';
      this.data.floorSpace = null;
      this.data.liveInfo = '';
      this.data.dependTypeMap = null;
      this.data.dependFloor = null;
      this.data.liveInfo = null;
      this.data.structure = null;
      this.data.inheritanceNotyet = '';
      this.data.buildingNotyet = '';
    } else if (this.data.locationType === '02') {
      this.data.blockNumber = '';
      this.data.area = null;
      this.data.tsubo = null;
      this.data.inheritanceNotyet = '';
      this.data.buildingNotyet = '';
    } else if (this.data.locationType === '03') {
      this.data.buysellFlg = '';
      this.data.owner = null;
      this.data.ownerAdress = null;
      this.data.equity = null; 
      var index: number = 0;
      this.data.sharers.forEach(sharer => {
        this.deleteSharer(index);
        index++;
      }); 
      this.data.inheritanceNotyet = '';
      this.data.buildingNotyet = '';
    } else if (this.data.locationType === '04') {
      this.data.inheritanceNotyet = '';
      this.data.buildingNotyet = '';
      this.cond = {
        tempLandInfoPid: this.data.tempLandInfoPid,
        locationType: '03'
      };
      const funcs = [];
      funcs.push(this.service.searchLocation(this.cond));
      Promise.all(funcs).then(values => {
        // 住所
        this.locAdresses = values[0];
        // this.spinner.hide();
      });
    }
    this.oldLocationType = this.data.locationType;
  }

  /**
   * 20200124 S_Add
   * 一棟の建物　住所取得
   */
  getLocAdress() {
    if (this.locAdresses) {
      return this.locAdresses.map(locAdress => new Code({codeDetail: locAdress.pid, name: locAdress.address + (locAdress.blockNumber != null ? locAdress.blockNumber : '')}));
    } else {
      return [];
    }
  }

  /**
   * チェックボックス変更
   * @param event ：イベント
   * @param flg ：フラグ
   売買対象flgChange/相続未登記ありnotChange/建物未登記ありyetChange*/
  flgChange(event, flg: any) {
    flg.buysellFlg = (event.checked ? 1 : 0);
   }
   notChange(event, flg: any) {
    flg.inheritanceNotyet = (event.checked ? 1 : 0);
   }
   yetChange(event, flg: any) {
    flg.buildingNotyet = (event.checked ? 1 : 0);
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
        this.convertSharer();
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
            this.data = new Locationinfo(values);
            this.spinner.hide();
            this.dialogRef.close({data: this.data, isSave: true});
          });
        });
      }
    });
  }

  /**
   * 所有地削除
   * @param row ：削除したい所有地
   */
  deleteLoc() {
    const dlg = new Dialog({title: '確認', message: '謄本情報を削除してよろしいですか？'});
    const dlgRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dlgRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.deleteLocation(this.data).then(res => {

          // 既に契約されている
          this.spinner.hide();
          if (res.status === 'NG') {
            this.dialog.open(FinishDialogComponent, {
              width: '500px',　height: '250px',
              data: new Dialog({title: 'エラー', message: '謄本情報を既に契約されています。'})
            });
          } else {
            this.dialogRef.close({data: this.data, isDelete: true});
          }
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
    this.checkBlank(this.data.locationType, 'locationType', '謄本種類は必須です。');
    if (this.data.locationType !== '03') {
    this.checkBlank(this.data.owner, `owner`, '所有者名は必須です。');}
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
