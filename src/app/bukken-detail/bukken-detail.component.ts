import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MatDialog, MAT_DATE_FORMATS, MatCheckbox } from '@angular/material';
import { BackendService } from '../backend.service';
import { JPDateAdapter } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { Templandinfo } from '../models/templandinfo';
import { Locationinfo } from '../models/locationinfo';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Code } from '../models/bukken';
import { MapAttach, AttachFile } from '../models/mapattach';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Contractinfo } from '../models/contractinfo';
import { SharerInfo } from '../models/sharer-info';

@Component({
  selector: 'app-bukken-detail',
  templateUrl: './bukken-detail.component.html',
  styleUrls: ['./bukken-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class BukkenDetailComponent extends BaseComponent {
  @ViewChild('cbxBuysellFlg', {static: true})
  cbxBuysellFlg: MatCheckbox;
  public data: Templandinfo;
  public pid: number;
  removeLoc: Locationinfo[] = [];
  contracts: Contractinfo[] = []; // 契約情報

  constructor(public router: Router,
              private route: ActivatedRoute,
              public service: BackendService,
              public dialog: MatDialog,
              private spinner: NgxSpinnerService) {
    super(router, service);

    this.route.queryParams.subscribe(params => {
      this.pid = params.pid;
    });
    this.data = new Templandinfo();
    this.data.result = '01';
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('土地情報詳細');
    this.spinner.show();

    const funcs = [];
    funcs.push(this.service.getCodes(null));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getEmps(null));
    if (this.pid > 0) {
      funcs.push(this.service.getLand(this.pid));
      funcs.push(this.service.getLandContract(this.pid));
    }
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

      // 部署
      this.deps = values[1];

      // 社員
      this.emps = values[2];

      // 物件あり場合
      if ( values.length > 3) {
        this.data = new Templandinfo(values[3] as Templandinfo);
      //}else{
        //this.data.result = '01';
      }

      // 土地の契約情報
      if (values.length > 4) {
        this.contracts = values[4];
      }

      this.convertForDisplay();

      setTimeout(() => {
        this.spinner.hide();
      }, 200);

    });
  }
  convertForDisplay() {
    this.data.convert();
    // 物件位置情報
    if (!this.data.locations || this.data.locations.length === 0) {
      this.data.locations = [];

      const loc = new Locationinfo();
      this.data.locations.push(loc);
    }
    else {
      const locs = [];
      this.data.locations.forEach(loc => {
        const frontLoc = new Locationinfo(loc);
        frontLoc.convert();
        locs.push(frontLoc);
      });
      this.data.locations = locs;
    }
  }  

  /**
   * 所有地追加
   */
  addLocation(): void {
    const loc = new Locationinfo();
    this.data.locations.push(loc);
  }

  /**
   * 所在地削除
   * @param pos : 削除位置
   */
  removeLocation(pos: number): void {
    const dlg = new Dialog({title: '確認', message: '所在地情報情報を削除しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        const loc = this.data.locations[pos];
        if (loc.pid > 0) {
          this.removeLoc.push(loc);
        }
        this.data.locations.splice(pos, 1);
      }
    });
  }

  /**
   * 所有者追加
   * @param loc ：所有地
   */
  addSharer(loc: Locationinfo) {
    if (loc.sharers == null) {
      loc.sharers = [];
    }
    if (loc.sharers.length === 0) {
      loc.sharers.push(new SharerInfo());
      loc.sharers.push(new SharerInfo());
    }
    else {
      loc.sharers.push(new SharerInfo());
    }
  }

  /**
   * 所有者削除
   * @param loc ：所有地
   */
  deleteSharer(loc: Locationinfo, sharerPos: number) {
    const sharer = loc.sharers[sharerPos];
    if (sharer.pid > 0) {
      if (loc.delSharers == null) {
        loc.delSharers = [];
      }
      loc.delSharers.push(sharer.pid);
    }
    loc.sharers.splice(sharerPos, 1);
  }

  /**
   * 一覧へ戻る
   */
  backToList() {
    this.router.navigate(['/bukkens'], {queryParams: {search: '1'}});
  }

  /**
   * データ保存
   */
  save() {
    if (!this.validate()) {
      return;
    }

    const dlg = new Dialog({title: '確認', message: '土地情報を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        // 土地情報登録
        this.convertSharer();
        this.data.convertForSave(this.service.loginUser.userId);
        
        this.data.locations.forEach(loc => {
          loc.convertForSave();
        });

        /*
        if (this.cbxBuysellFlg.checked) {
          this.data.buysellFlg = '1';
        } else {
          this.data.buysellFlg = '0';
        }
        */

        // 削除された所在地も送る

        const funcs = [];
        funcs.push(this.service.saveLand(this.data));
        if (this.removeLoc.length > 0) {
          funcs.push(this.service.deleteLoc(this.removeLoc.map(lc => lc.pid)));
        }
        Promise.all(funcs).then(values => {

          const finishDlg = new Dialog({title: '完了', message: '土地情報を登録しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(res => {
            this.data = new Templandinfo(values[0]);
            this.convertForDisplay();
            this.router.navigate(['/bkdetail'], {queryParams: {pid: this.data.pid}});
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

    this.checkBlank(this.data.bukkenName, 'bukkenName', '物件名は必須です。');
    this.checkBlank(this.data.residence, 'residence', '住居表示は必須です。');
    this.checkNumber(this.data.floorAreaRatio, 'floorAreaRatio', '容積率は不正です。');
    this.checkNumber(this.data.coverageRate, 'coverageRate', '建蔽率は不正です。');

    // 所有地
    this.data.locations.forEach((element, index) => {
      this.checkBlank(element.locationType, `locationType${index}`, '所在地種別は必須です。');
      this.checkBlank(element.address, `address${index}`, '所在地は必須です。');
      this.checkBlank(element.owner, `owner${index}`, '所有者名は必須です。');
      this.checkNumber(element.area, `area${index}`, '地積は不正です。');
      this.checkNumber(element.floorSpace, `floorSpace${index}`, '床面積は不正です。');
    });

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * 共有者情報
   */
  convertSharer() {
    this.data.locations.forEach(loc => {
      if (loc.sharers == null) {
        loc.sharers = [];
      }
      if(loc.sharers.length === 0) {
        loc.sharers.push(new SharerInfo());
      }
      // 共通
      const firstSharer = loc.sharers[0];
      firstSharer.sharer = loc.owner;
      firstSharer.sharerAdress = loc.ownerAdress;
      firstSharer.shareRatio = loc.equity;
      firstSharer.buysellFlg = loc.buysellFlg;

    });
  }

  // 地図アップロード
  mapUploaded(event) {
    // ファイル添付
    if (event.attachFileName !== undefined) {
      if (this.data.attachFiles === null) {
        this.data.attachFiles = [];
      }
      const attachFile: AttachFile = JSON.parse(JSON.stringify(event));
      this.data.attachFiles.push(attachFile);
    }
    // 地図添付
    // tslint:disable-next-line:one-line
    else {
      if (this.data.mapFiles === null) {
        this.data.mapFiles = [];
      }
      const mapFile: MapAttach = JSON.parse(JSON.stringify(event));
      this.data.mapFiles.push(mapFile);

    }
  }

  /**
   * 地図削除
   * @param map :　削除したい地図
   */
  deleteMapFile(map: MapAttach) {

    const dlg = new Dialog({title: '確認', message: 'ファイルを削除しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px',　height: '250px',　data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteFile(map.pid, false).then(res => {
          this.data.mapFiles.splice(this.data.mapFiles.indexOf(map), 1);
        });
      }
    });
  }

  /**
   * ファイル添付削除
   * @param map :　削除したいファイル添付
   */
  deleteAttachFile(map: AttachFile) {

    const dlg = new Dialog({title: '確認', message: 'ファイルを削除しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px',　height: '250px',　data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteFile(map.pid, true).then(res => {
          this.data.attachFiles.splice(this.data.attachFiles.indexOf(map), 1);
        });
      }
    });
  }

  /**
   * 契約画面遷移
   * @param loc: 所在地
   */
  navigateContract(loc: Locationinfo) {
    this.router.navigate(['/ctdetail'], {queryParams: {bukkenid: this.data.pid}});
  }

  changeArea(event, loc) {
    const val = event.target.value;
    if (this.isNumberStr(val)) {
      loc.tsubo = Number(val) * 0.3025;
    }
  }

  changeType(loc: Locationinfo) {
    // 土地
    if (loc.locationType === '01') {
      loc.buildingNumber = '';
      loc.floorSpace = null;
      loc.liveInfo = '';
    } else if (loc.locationType === '02') {
      loc.blockNumber = '';
      loc.area = null;
      loc.tsubo = null;
    }
  }

  /**
   * 契約詳細
   * @param data : 契約情報
   */
  showContract(ctData: Contractinfo) {
    this.router.navigate(['/ctdetail'], {queryParams: {pid: ctData.pid}});
  }

  getLocationType(ctData: Contractinfo) {
    return ctData.details.map(dt => {
      return this.getCodeTitle('007', this.data.locations.filter(loc => loc.pid === dt.locationInfoPid)[0].locationType);
    }).join('\n\r');
  }
  getAddress(ctData: Contractinfo) {
    return ctData.details.map(dt => {
      return this.data.locations.filter(loc => loc.pid === dt.locationInfoPid)[0].address;
    }).join('\n\r');
  }
  getBlockNumber(ctData: Contractinfo) {
    return ctData.details.map(dt => {
      return this.data.locations.filter(loc => loc.pid === dt.locationInfoPid)[0].blockNumber;
    }).join('\n\r');
  }
  getBuildingNumber(ctData: Contractinfo) {
    return ctData.details.map(dt => {
      return this.data.locations.filter(loc => loc.pid === dt.locationInfoPid)[0].buildingNumber;
    }).join('\n\r');
  }
  getOwnerName(ctData: Contractinfo) {
    return ctData.details.map(dt => {
      return this.data.locations.filter(loc => loc.pid === dt.locationInfoPid)[0].owner;
    }).join('\n\r');
  }

  getContractorName(ctData: Contractinfo) {
    return ctData.details.length > 0 ? ctData.details.map(dt => dt.contractorName).join('\r\n') : '';
  }

  getDependerName(ctData: Contractinfo) {
    return ctData.depends.length > 0 ? ctData.depends.map(dt => dt.dependerName).join('\r\n') : '';
  }

  /**
   * 所有地を契約済みかどうか
   * @param locationId ：所有地
   */
  contracted(locationId: number) {
    if (this.contracts === undefined || this.contracts.length === 0) {
      return false;
    }
    if (this.contracts.filter(ct => ct.details.filter(dt => dt.locationInfoPid === locationId).length > 0).length > 0) {
      return true;
    }
    return false;
  }
  /**
   * チェックボックス変更
   */
  flgChange(event, flg: any) {
   flg.buysellFlg = (event.checked ? 1 : 0);
  }


}


