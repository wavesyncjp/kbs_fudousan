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
import { LocationDetailComponent } from '../location-detail/location-detail.component';

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
      }

      // 土地の契約情報
      if (values.length > 4) {
        this.contracts = values[4];
      }

      this.convertForDisplay();

      this.spinner.hide();

    });
  }
  convertForDisplay() {
    this.data.convert();
    // 物件位置情報
    if (this.data.locations && this.data.locations.length > 0) {
      const locs = [];
      this.data.locations.forEach(loc => {
        const locFront = new Locationinfo(loc);
        locs.push(locFront);
      });
      this.data.locations = locs;
    } else {
      this.data.locations = [];
    }
  }

  /**
   * 所有地追加
   */
  addLocation(): void {
    const loc = new Locationinfo();
    loc.tempLandInfoPid = this.data.pid;
    loc.sharers = [];
    const dialogRef = this.dialog.open(LocationDetailComponent, {
      width: '98%',
      height: '550px',
      data: loc
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isSave) {
        this.data.locations.push(result.data);
      }
    });

  }

  /**
   * 所有地詳細
   * @param loc : 所有地
   */
  showLocation(loc: Locationinfo, pos: number) {
    const dialogRef = this.dialog.open(LocationDetailComponent, {
      width: '98%',
      height: '550px',
      data: loc
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        // 更新
        if (result.isSave) {
          loc = result.data;
        } else if (result.isDelete) {
          this.data.locations.splice(pos, 1);
        }
      }
    });
  }

  /**
   * 所有地コピー
   * @param loc ：所有地
   */
  copyLocation(loc: Locationinfo) {
    const newLoc = new Locationinfo(loc);
    newLoc.pid = null;
    const dialogRef = this.dialog.open(LocationDetailComponent, {
      width: '98%',
      height: '550px',
      data: newLoc
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.locations.push(newLoc);
      }
    });
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
        this.data.convertForSave(this.service.loginUser.userId);
        const funcs = [];
        funcs.push(this.service.saveLand(this.data));
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
  　// this.checkNumber(this.data.floorAreaRatio, 'floorAreaRatio', '容積率は不正です。');
    // this.checkNumber(this.data.coverageRate, 'coverageRate', '建蔽率は不正です。');

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
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
  navigateContract() {
    this.router.navigate(['/ctdetail'], {queryParams: {bukkenid: this.data.pid}});
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
   * 所有地ー契約取得
   */
  getLandContract(loc: Locationinfo) {    
    const ret = this.contracts.filter(ct => {
      return ct.details.filter(dt => dt.locationInfoPid === loc.pid && dt.contractDataType === '01').length > 0;
    });
    return ret;
  }

  ShowContractNo(loc: Locationinfo, contractNo: string) {
    const buysellCount = loc.sharers.filter(s => {
      return s.buysellFlg === '1';
    }).length;
    if (buysellCount === 0) {
      return '';
    }
    return contractNo;
  }

  /**
   * 所有地の契約ステータス
   * @param loc ：所有地
   */
  showStatus(loc: Locationinfo) {
    const status = ''; // this.getCodeTitle('013', '01');

    // ①
    const buysellCount = loc.sharers.filter(s => {
      return s.buysellFlg === '1';
    }).length;
    if (buysellCount === 0) {
      return status;
    }

    if (loc.sharers != null && loc.sharers.length > 0) {

      // ②仕入契約登記人情報
      const outputCount = this.countContractRegistrant(loc.pid);

      // 契約
      const ret = this.contracts.filter(ct => {
        return ct.details.filter(dt => dt.locationInfoPid === loc.pid && dt.contractDataType === '01').length > 0;
      });

      // 契約あり
      if (ret.length > 0) {

        // 契約日あり
        const contractDayCount = ret.filter(ct => {
          return ct.contractDay != null && ct.contractDay !== '';
        }).length;

        // 所有者一人
        if (outputCount === buysellCount) {
          if (contractDayCount === 0) {
            return this.getCodeTitle('013', '01');
          } else if (ret.length !== contractDayCount) {
            return this.getCodeTitle('013', '05');
          } else {
            return this.getCodeTitle('013', '09');
          }

        } else {
          if (contractDayCount === 0) {
            return this.getCodeTitle('013', '01');
          } else {
            return this.getCodeTitle('013', '05');
          }
        }
      }
    }
    return status;
  }

  /**
   * 仕入契約登記人情報
   * @param locPid ：所有地
   */
  countContractRegistrant(locPid: number) {
    let sellers = [];
    this.contracts.forEach(ct => {
      ct.details.forEach(dt => {
        if (dt.locationInfoPid === locPid && dt.contractDataType === '01') {
          const ids = dt.registrants.filter(re => { return sellers.indexOf(re.sharerInfoPid) < 0; }).map(re => re.sharerInfoPid);
          sellers = sellers.concat(ids);
        }
      });
    });

    return sellers.length;
  }

  /**
   * 契約者名表示
   * @param contract 契約者
   */
  displaySeller(contract: Contractinfo) {
    return contract.sellers.filter(ct => ct.contractorName != null && ct.contractorName !== '').map(ct => ct.contractorName).join('\n\r');
  }
}


