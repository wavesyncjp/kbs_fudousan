import { Component, Inject, ViewChild } from '@angular/core';
import { Locationinfo } from '../models/locationinfo';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MAT_DATE_LOCALE, DateAdapter, MatCheckbox } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharerInfo } from '../models/sharer-info';
import { BottomLandInfo } from '../models/bottomLandInfo';// 20210614 Add
import { ResidentInfo } from '../models/residentInfo';// 20220614 Add
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Code } from '../models/bukken';
import { isNullOrUndefined } from 'util';
//20200913 S_Add
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
//20200913 E_Add
import { LocationAttach } from '../models/mapattach';// 20210311 Add

declare var $: any;// 20211107 Add

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
  public locAdresses = [];
  public landAdresses = [];// 20201222 Add

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

  // 20210211 S_Add
  locAdress: Code[];
  landAdress: Code[];
  // 20210211 E_Add

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
          this.locAdress = this.getLocAdress();// 20210211 Add
        });
      }
      // 20201222 S_Add
      if (this.data.locationType !== '01'
        && (this.data.rightsForm === '01' || this.data.rightsForm === '02' || this.data.rightsForm === '03')) {
        // 底地を取得
        this.cond = {
          tempLandInfoPid: this.data.tempLandInfoPid,
          locationType: '01'
        };
        const funcs = [];
        funcs.push(this.service.searchLocation(this.cond));
        Promise.all(funcs).then(values => {
          this.landAdresses = values[0];// 住所
          this.landAdress = this.getLandAdress();// 20210211 Add
        });
      }
      // 20201222 E_Add
    }
    // 20201021 S_Add
    // チェックボックス初期化
    this.inheritanceNotyet.checked = (this.data.inheritanceNotyet === '1');
    this.buildingNotyet.checked = (this.data.buildingNotyet === '1');
    this.buysellFlg.checked = (this.data.buysellFlg === '1');
    // 20201021 E_Add

    // 20211107 S_Add
    let _that = this;
    $('#txtCompletionDay').datepicker({
      changeMonth: true,
      changeYear: true,
      yearRange: `1950:${new Date().getFullYear() + 10}`,
      dateFormat: 'yy/mm/dd',
      onSelect: function (dataText) {
        _that.data.completionDayMap = dataText;
      },
      showButtonPanel: true,
      ignoreReadonly: true,
      allowInputToggle: true,

      buttonImage: "assets/img/calendar-icon_wareki.png",
      buttonImageOnly: true,// 画像として表示
      showOn: "both"
    });
    // 20211107 S_End
    // 20211109 S_Add
    if(this.data.locationType === '01' || this.data.locationType === '03') {
      this.switchCalendar('#txtCompletionDay', false);
    } else {
      this.switchCalendar('#txtCompletionDay', true);
    }
    // 20211109 E_Add
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
//    sharerPos++;// 20201031 Add
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
          // 20201224 S_Add
          // 相続未登記あり
          this.inheritanceNotyet.checked = false;
          this.data.inheritanceNotyet = '0';
          // 建物未登記あり
          this.buildingNotyet.checked = false;
          this.data.buildingNotyet = '0';
          // 20201224 E_Add
          this.applyChangeType();
        } else {
          this.data.locationType = this.oldLocationType;
        }
      });
    } else {
      this.applyChangeType();
    }
  }

  // 20211109 S_Add
  /**
   * カレンダーアイコン 活性/非活性
   */
  switchCalendar(id: string, set: boolean) {
    if(set) {
      $(id).datepicker('enable');
    } else {
      $(id).datepicker('disable');
    }
  }
  // 20211109 E_Add

  /**
   * 区分変更時初期化処理
   */
  applyChangeType() {
    /*
    // 20201021 S_Add
    // 相続未登記あり
    this.inheritanceNotyet.checked = false;
    this.data.inheritanceNotyet = '0';
    // 建物未登記あり
    this.buildingNotyet.checked = false;
    this.data.buildingNotyet = '0';
    // 20201021 E_Add
    */
    /*
    // 20201222 S_Add
    if (this.data.locationType !== '01'
      && (this.data.rightsForm === '01' || this.data.rightsForm === '02' || this.data.rightsForm === '03')) {
      
      if(this.data.bottomLandPid === null || this.data.bottomLandPid === '') {
        // 底地を取得
        this.cond = {
          tempLandInfoPid: this.data.tempLandInfoPid,
          locationType: '01'
        };
        const funcs = [];
        funcs.push(this.service.searchLocation(this.cond));
        Promise.all(funcs).then(values => {
          this.landAdresses = values[0];// 住所
          this.landAdress = this.getLandAdress();// 20210211 Add
        });
      }
    }
    else
    {
      this.data.bottomLandPid = null;// 底地
      this.data.leasedAreaMap = null;// 借地対象面積
      // 20210614 S_Add
      // 底地追加分を削除
      var index: number = 0;
      this.data.bottomLands.forEach(bottomLand => {
        this.deleteBottomLand(index);
        index++;
      });
      // 20210614 E_Add
    }
    // 20201222 E_Add
    */
    // 区分が01:土地の場合
    if (this.data.locationType === '01') {
      this.data.ridgePid = null;        // 一棟の建物
      this.data.completionDayMap = null;// 建築時期（竣工日） 20211025 Add
      this.data.buildingNumber = null;  // 家屋番号
      this.data.dependTypeMap = null;   // 種類
      this.data.dependFloor = null;     // 階建
      this.data.grossFloorAreaMap = null;// 延床面積 20201222 Add
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
      this.data.completionDayMap = null;// 建築時期（竣工日） 20211025 Add
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
      // 20201020 S_Add
      this.data.areaMap = null;         // 地積
      this.data.tsubo = null;           // 坪
      this.data.rightsForm = null;      // 権利形態
      this.data.landCategory = null;    // 地目
      this.data.dependTypeMap = null;   // 種類
      // 20201020 E_Add
      // 20201222 S_Add
      this.data.grossFloorAreaMap = null;// 延床面積
//      this.data.bottomLandPid = null;// 底地
//      this.data.leasedAreaMap = null;// 借地対象面積
      // 20201222 E_Add
      // 所有者追加分を削除
      var index: number = 0;
      this.data.sharers.forEach(sharer => {
        this.deleteSharer(index);
        index++;
      });
      index = 0;
      this.data.sharers.forEach(sharer => {
        this.deleteSharer(index);
        index++;
      });
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
        this.locAdress = this.getLocAdress();// 20210211 Add
      });
      // 20201020 S_Add
      this.data.address = null;         // 所在地
      this.data.blockNumber = null;     // 地番
      this.data.areaMap = null;         // 地積
      this.data.tsubo = null;           // 坪
      this.data.landCategory = null;    // 地目
      // 20201020 E_Add
//      this.data.grossFloorAreaMap = null;// 延床面積 20201222 Add
    }
    // 20201222 S_Add
    if (this.data.locationType !== '01'
      && (this.data.rightsForm === '01' || this.data.rightsForm === '02' || this.data.rightsForm === '03')) {

      if(this.data.bottomLandPid === null || this.data.bottomLandPid === '') {
        // 底地を取得
        this.cond = {
          tempLandInfoPid: this.data.tempLandInfoPid,
          locationType: '01'
        };
        const funcs = [];
        funcs.push(this.service.searchLocation(this.cond));
        Promise.all(funcs).then(values => {
          this.landAdresses = values[0];// 住所
          this.landAdress = this.getLandAdress();// 20210211 Add
        });
      }
    }
    else
    {
      this.data.bottomLandPid = null;// 底地
      this.data.leasedAreaMap = null;// 借地対象面積
      this.data.landRentMap = null;// 地代 20220614 Add
      // 20210614 S_Add
      // 底地追加分を削除
      var index: number = 0;
      this.data.bottomLands.forEach(bottomLand => {
        this.deleteBottomLand(index);
        index++;
      });
      index = 0;
      this.data.bottomLands.forEach(bottomLand => {
        this.deleteBottomLand(index);
        index++;
      });
      // 20210614 E_Add
    }
    // 20201222 E_Add
    // 20220615 S_Add
    if (this.data.locationType !== '02' && this.data.locationType !== '04') {
      this.data.roomNo = null;            // 部屋番号
      this.data.borrowerName = null;      // 借主氏名
      this.data.rentPriceMap = null;      // 賃料
      this.data.expirationDateMap = null; // 契約期間満了日

      // 入居者追加分を削除
      var index: number = 0;
      this.data.residents.forEach(resident => {
        this.deleteResident(index);
        index++;
      });
      index = 0;
      this.data.residents.forEach(resident => {
        this.deleteResident(index);
        index++;
      });
    }
    // 20220615 E_Add
    // 20211109 S_Add
    if(this.data.locationType === '01' || this.data.locationType === '03') {
      this.switchCalendar('#txtCompletionDay', false);
    } else {
      this.switchCalendar('#txtCompletionDay', true);
    }
    // 20211109 E_Add
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

  // 20201222 S_Add
  /**
   * 底地　住所取得
  */
  getLandAdress() {
    if (this.landAdresses) {
      return this.landAdresses.map(locAdress => new Code({codeDetail: locAdress.pid, name: locAdress.address + (locAdress.blockNumber != null ? locAdress.blockNumber : '')}));
    } else {
      return [];
    }
  }
  // 20201222 E_Add

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
        this.convertBottomLand();// 20210614 Add
        this.convertResident();// 20220614 Add
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
              width: '500px', height: '250px',
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
      this.checkBlank(this.data.owner, `owner`, '所有者名は必須です。');
    }
    // 20200831 S_Add
    if (this.data.locationType === '04') {
      this.checkBlank(this.data.ridgePid, `ridgePid`, '一棟の建物は必須です。');
      this.checkBlank(this.data.buildingNumber, `buildingNumber`, '家屋番号は必須です。');// 20210106 Add
    }
    // 20200831 E_Add
    // 20201221 S_Add
    if (this.data.locationType !== '04') {
      this.checkBlank(this.data.address, `address`, '所在地は必須です。');
    }
    if (this.data.locationType !== '01'
      && (this.data.rightsForm === '01' || this.data.rightsForm === '02' || this.data.rightsForm === '03')) {
      this.checkBlank(this.data.bottomLandPid, `bottomLandPid`, '底地は必須です。');
    }
    // 20201221 E_Add
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
    // 20210311 S_Update
//    this.dialogRef.close(false);
    this.dialogRef.close({data: this.data});
    // 20210311 E_Update
  }

  // 20210311 S_Add
  /**
   * ファイルアップロード
   * @param event ：ファイル
   */
  uploaded(event) {
    if (this.data.attachFiles === null) {
      this.data.attachFiles = [];
    }
    const attachFile: LocationAttach = JSON.parse(JSON.stringify(event));
    this.data.attachFiles.push(attachFile);
  }

  /**
   * ファイル削除
   * @param map :　削除したいファイル
   */
  deleteFile(map: LocationAttach) {
    const dlg = new Dialog({title: '確認', message: 'ファイルを削除しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteLocationFile(map.pid).then(res => {
          this.data.attachFiles.splice(this.data.attachFiles.indexOf(map), 1);
        });
      }
    });
  }
  // 20210311 E_Add
  // 20210614 S_Add
  /**
   * 底地追加
   * @param loc ：所有地
   */
  addBottomLand() {
    if (this.data.bottomLands == null) {
      this.data.bottomLands = [];
    }
    if (this.data.bottomLands.length === 0) {
      this.data.bottomLands.push(new BottomLandInfo());
      this.data.bottomLands.push(new BottomLandInfo());
    } else {
      this.data.bottomLands.push(new BottomLandInfo());
    }
  }

  /**
   * 底地削除
   * @param loc ：所有地
  */
  deleteBottomLand(bottomLandPos: number) {
    //bottomLandPos++;
    const bottomLand = this.data.bottomLands[bottomLandPos];
    if (bottomLand.pid > 0) {
      if (this.data.delBottomLands == null) {
        this.data.delBottomLands = [];
      }
      this.data.delBottomLands.push(bottomLand.pid);
    }
    this.data.bottomLands.splice(bottomLandPos, 1);
  }

  /**
   * 底地情報
   */
  convertBottomLand() {
    if (this.data.bottomLands == null) {
      this.data.bottomLands = [];
    }
    if (this.data.bottomLands.length === 0) {
      this.data.bottomLands.push(new BottomLandInfo());
    }
    // 共通
    const firstBottomLand = this.data.bottomLands[0];
    firstBottomLand.bottomLandPid = this.data.bottomLandPid;
    firstBottomLand.leasedAreaMap = this.data.leasedAreaMap;
    firstBottomLand.landRentMap = this.data.landRentMap;// 20220614 Add
  }
  // 20210614 E_Add
  // 20220614 S_Add
  /**
   * 入居者追加
   * @param loc ：所有地
   */
   addResident() {
    if (this.data.residents == null) {
      this.data.residents = [];
    }
    if (this.data.residents.length === 0) {
      this.data.residents.push(new ResidentInfo());
      this.data.residents.push(new ResidentInfo());
    } else {
      this.data.residents.push(new ResidentInfo());
    }
  }

  /**
   * 入居者削除
   * @param loc ：所有地
  */
  deleteResident(residentPos: number) {
    const resident = this.data.residents[residentPos];
    if (resident.pid > 0) {
      if (this.data.delResidents == null) {
        this.data.delResidents = [];
      }
      this.data.delResidents.push(resident.pid);
    }
    this.data.residents.splice(residentPos, 1);
  }

  /**
   * 入居者情報
   */
  convertResident() {
    if (this.data.residents == null) {
      this.data.residents = [];
    }
    if (this.data.residents.length === 0) {
      this.data.residents.push(new ResidentInfo());
    }
    // 共通
    const firstResident = this.data.residents[0];
    firstResident.roomNo = this.data.roomNo;
    firstResident.borrowerName = this.data.borrowerName;
    firstResident.rentPriceMap = this.data.rentPriceMap;
    firstResident.expirationDateMap = this.data.expirationDateMap;
  }
  // 20220614 E_Add
}
