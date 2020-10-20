import { Component, Inject, ViewChild } from '@angular/core';
import { Locationinfo } from '../models/locationinfo';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MatCheckbox } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharerInfo } from '../models/sharer-info';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Code } from '../models/bukken';
import { isNullOrUndefined } from 'util';
//20200913 S_Add
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
//20200913 E_Add

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.css'],
  //20200913 S_Add
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
  //20200913 E_Add
})
export class LocationDetailComponent extends BaseComponent {

  pid: number;
  oldLocationType = '';
  public cond: any;
  public locAdresses =[];

  // 20201021 S_Add
  // 相続未登記あり
  @ViewChild('inheritanceNotyet', {static: true})
  inheritanceNotyet: MatCheckbox;
  // 建物未登記あり
  @ViewChild('buildingNotyet', {static: true})
  buildingNotyet: MatCheckbox;
  // 売買対象
  @ViewChild('buysellFlg', {static: true})
  buysellFlg: MatCheckbox;
  // 20201021 E_Add

  constructor(public router: Router,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public dialogRef: MatDialogRef<Locationinfo>,
              public dialog: MatDialog,
              public datepipe: DatePipe,//20200913 Add
              /*public sharer: SharerInfo,*/
              @Inject(MAT_DIALOG_DATA) public data: Locationinfo) {
      super(router, service,dialog);
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

      this.data.convert();

      this.spinner.hide();
    });
    //20200811 S_Update
    /*
    if(this.data.pid == undefined) this.data.locationType = '01';
    */
    if(this.data.pid == undefined && this.data.locationType == undefined) this.data.locationType = '01';
    //20200811 E_Update
    else {
      if (this.data.locationType === '04') {
        // 一棟の建物を取得
        this.cond = {
          tempLandInfoPid: this.data.tempLandInfoPid,
          locationType: '03'
        };
        const funcs = [];
        funcs.push(this.service.searchLocation(this.cond));
        Promise.all(funcs).then(values => {
          this.locAdresses = values[0];// 住所
        });
      }
    }
    // 20201021 S_Add
    // チェックボックス初期化
    this.inheritanceNotyet.checked = (this.data.inheritanceNotyet === '1');
    this.buildingNotyet.checked = (this.data.buildingNotyet === '1');
    this.buysellFlg.checked = (this.data.buysellFlg === '1');
    // 20201021 E_Add
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

  //数値にカンマを付ける作業
  // 20200709 S_Add
  changeValue(val) {
    val = this.numberFormat(val);
    return val;
  }

  calTsubo(val) {
    if (!isNullOrUndefined(this.data.areaMap)) {
      return Math.floor(this.getNumber(this.removeComma(val)) * 0.3025 * 100) / 100;
    } else {
      return '0';
    }
  }

  /**
   * 地積変更
   */
  changeArea(event) {
    const val = event.target.value;
    let ret = this.removeComma(val)
    if (this.isNumberStr(ret)) {
      this.data.tsubo = Math.floor(Number(ret) * 0.3025 * 100 ) / 100;
    }
  }

  /**
   * 区分変更
   */
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

  /**
   * 区分変更時初期化処理
   */
  applyChangeType() {
    // 20201021 S_Add
    // 相続未登記あり
    this.inheritanceNotyet.checked = false;
    this.data.inheritanceNotyet = '0';
    // 建物未登記あり
    this.buildingNotyet.checked = false;
    this.data.buildingNotyet = '0';
    // 20201021 E_Add

    // 区分が01:土地の場合
    if (this.data.locationType === '01') {
      this.data.ridgePid = null;        // 一棟の建物
      this.data.buildingNumber = null;  // 家屋番号
      this.data.dependTypeMap = null;   // 種類
      this.data.dependFloor = null;     // 階建
      this.data.structure = null;       // 構造
      this.data.floorSpace = null;      // 床面積
      this.data.liveInfo = null;        // 入居者情報
    }
    // 区分が02:建物の場合
    else if (this.data.locationType === '02') {
      this.data.ridgePid = null;        // 一棟の建物
      this.data.blockNumber = null;     // 地番
      this.data.areaMap = null;         // 地積
      this.data.tsubo = null;           // 坪
      this.data.landCategory = null;    // 地目
    }
    // 区分が03:区分所有（一棟）の場合
    else if (this.data.locationType === '03') {
      this.data.ridgePid = null;        // 一棟の建物
      // 20201020 S_Add
      this.data.blockNumber = null;     // 地番
      this.data.buildingNumber = null;  // 家屋番号
      // 20201020 E_Add
      // 売買対象
      this.buysellFlg.checked = false;
      this.data.buysellFlg = '0';
      this.data.owner = null;           // 所有者
      this.data.ownerAdress = null;     // 所有者住所
      this.data.equity = null;          // 持ち分
      // 所有者追加分を削除
      var index: number = 0;
      this.data.sharers.forEach(sharer => {
        this.deleteSharer(index);
        index++;
      });
      // 20201020 S_Add
      this.data.areaMap = null;         // 地積
      this.data.tsubo = null;           // 坪
      this.data.rightsForm = null;      // 権利形態
      this.data.landCategory = null;    // 地目
      this.data.dependTypeMap = null;   // 種類
      // 20201020 E_Add
    }
    // 区分が04:区分所有（専有）の場合
    else if (this.data.locationType === '04') {
      // 一棟の建物を取得
      this.cond = {
        tempLandInfoPid: this.data.tempLandInfoPid,
        locationType: '03'
      };
      const funcs = [];
      funcs.push(this.service.searchLocation(this.cond));
      Promise.all(funcs).then(values => {
        this.locAdresses = values[0];// 住所
      });
      // 20201020 S_Add
      this.data.address = null;         // 所在地
      this.data.blockNumber = null;     // 地番
      this.data.areaMap = null;         // 地積
      this.data.tsubo = null;           // 坪
      this.data.landCategory = null;    // 地目
      // 20201020 E_Add
    }
    this.oldLocationType = this.data.locationType;
  }

  /**
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
   * 売買対象チェックボックス変更
   * @param event ：イベント
   * @param data ：所有地
  */
  flgChange(event, data: any) {
    data.buysellFlg = (event.checked ? 1 : 0);
  }
  /**
   * 相続未登記ありチェックボックス変更
   * @param event ：イベント
   * @param data ：所有地
  */
  notChange(event, data: any) {
    data.inheritanceNotyet = (event.checked ? 1 : 0);
  }
  /**
   * 建物未登記ありチェックボックス変更
   * @param event ：イベント
   * @param data ：所有地
  */
  yetChange(event, data: any) {
    data.buildingNotyet = (event.checked ? 1 : 0);
  }
  
  /**
   * 登録
   */
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
        //20200913 S_Update
//        this.data.convertForSave(this.service.loginUser.userId);
        this.data.convertForSave(this.service.loginUser.userId, this.datepipe);
        //20200913 E_Update
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
    //20200831 S_Add
    if (this.data.locationType === '04') {
      this.checkBlank(this.data.ridgePid, `ridgePid`, '一棟の建物は必須です。');}
    //20200831 E_Add
    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * キャンセル
   */
  cancel() {
    this.spinner.hide();
    this.dialogRef.close(false);
  }
}
