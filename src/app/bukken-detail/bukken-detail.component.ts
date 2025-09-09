import { Component, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MatDialog, MatCheckbox, MatTabGroup, MatRadioChange } from '@angular/material';
import { BackendService } from '../backend.service';
import { JPDateAdapter } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { Templandinfo } from '../models/templandinfo';
import { Locationinfo } from '../models/locationinfo';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Code, User } from '../models/bukken';
import { MapAttach, AttachFile, BukkenPhotoAttach } from '../models/mapattach';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Contractinfo } from '../models/contractinfo';
import { LocationDetailComponent } from '../location-detail/location-detail.component';
import { DatePipe } from '@angular/common';
import { Util } from '../utils/util';
import { LocationAttach } from '../models/mapattach';// 20210317 Add
import { AttachFileDialogComponent } from '../dialog/attachFile-dialog/attachFile-dialog.component';// 20230309 Add
declare var google: any;

@Component({
  selector: 'app-bukken-detail',
  templateUrl: './bukken-detail.component.html',
  styleUrls: ['./bukken-detail.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class BukkenDetailComponent extends BaseComponent {
  //hirano_202004.15_edd
  @ViewChild(MatTabGroup, { static: true }) tabGroup: MatTabGroup;
  //hirano_202004.15_edd
  @ViewChild('cbxBuysellFlg', { static: true })
  cbxBuysellFlg: MatCheckbox;
  public data: Templandinfo;
  public pid: number;
  public copyFlg: boolean = false;// 20210426 Add
  removeLoc: Locationinfo[] = [];
  contracts: Contractinfo[] = [];// 契約情報
  public cond = {
    mode: 1
  };

  //20200731 S_Add
  dropdownSettings = {};
  authority = '';
  disableUser: boolean = false;
  //20200731 E_Add
  //20210317 S_Add
  enableUser: boolean = false;
  normalUser: boolean = false;
  //20210317 E_Add
  enableAttachUser: boolean = false;// 20230313 Add
  public sumArea: number = 0;// 20230301 Add
  public sumAreaContract: number = 0;// 20230309 Add
  isDepartmentSelected = false;// 20250909 Add
  oneDepartmentStaffs: User[] | [] = [];// 担当者セレクトボックス用 20250909 Add

  constructor(public router: Router,
    private route: ActivatedRoute,
    public service: BackendService,
    public dialog: MatDialog,
    public datepipe: DatePipe,
    private spinner: NgxSpinnerService) {
    super(router, service, dialog);

    this.route.queryParams.subscribe(params => {
      this.pid = params.pid;
      this.copyFlg = params.copyFlg;// 20210426 Add
    });
    this.data = new Templandinfo();
    this.data.result = '01';
  }

  depCodes: Code[];// 20210211 Add

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    //20200731 S_Add
    this.authority = this.service.loginUser.authority;
    this.disableUser = (this.authority === '03');
    //20200731 E_Add
    //20210317 S_Add
    this.enableUser = (this.authority === '01');
    this.normalUser = (this.authority === '04');
    //20210317 E_Add
    // 20230313 S_Add
    this.enableAttachUser = (this.authority === '01' || this.authority === '02' || this.authority === '05');// 01:管理者,02:営業事務,05:経理
    // 20230313 E_Add
    this.service.changeTitle('物件情報詳細');
    this.spinner.show();

    const funcs = [];
    funcs.push(this.service.getCodes(null));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getEmps('1'));
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
          lst.sort((a, b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }

      // 部署
      this.deps = values[1];
      this.depCodes = this.getDeps();// 20210211 Add

      // 社員
      this.emps = values[2];

      // 物件あり場合
      if (values.length > 3) {
        this.data = new Templandinfo(values[3] as Templandinfo);
        // 20250909 S_Add
        if (this.data.department) {
          this.isDepartmentSelected = true;
          this.service.getEmps('1', [this.data.department])
          .then((res) => this.oneDepartmentStaffs = res);
        }
        // 20250909 E_Add

        // 20210426 S_Add
        // コピーの場合
        if (this.copyFlg) {
          // this.data.bukkenNo = '';// 20220522 Delete
          this.data.attachFiles = [];
        }
        // 20210426 E_Add
      }

      // 土地の契約情報
      // 20220522 S_Update
      //      if (values.length > 4) {
      //      if (values.length > 4 && !this.copyFlg) {
      if (values.length > 4) {
        // 20220522 E_Update
        this.contracts = values[4];
      }

      this.convertForDisplay();

      this.spinner.hide();

    });

    //20200731 S_Add
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'userId',
      textField: 'userName',
      searchPlaceholderText: '検索',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: false
    };
    //20200731 E_Add
  }

  //20250909 S_Add
  /**
   * 担当部署変更時、担当部署に紐づく担当者を取得
   */
  onChangeDepartment(depCode: string) {
    this.oneDepartmentStaffs = [];

    if (depCode === '') {
      this.data.infoStaffMap = [];
      this.isDepartmentSelected = false;
      return;
    }
    
    this.service.getEmps('1', [this.data.department]).then((res) => {
      this.isDepartmentSelected = true;
      this.oneDepartmentStaffs = res;
      this.data.infoStaffMap = this.data.infoStaffMap.filter((selectedStaff) => {
        return this.oneDepartmentStaffs.some((departmentStaff: User) => {
          return selectedStaff.userId === departmentStaff.userId;
        });
      });
    })
  }
  //20250909 E_Add

  convertForDisplay() {
    //20200731 S_Update
    /*
    this.data.convert();
    */
    this.data.convert(this.emps);
    //20200731 E_Update
    // 物件位置情報
    if (this.data.locations && this.data.locations.length > 0) {
      const locs: Locationinfo[] = [];
      this.sumArea = 0;// 20230305 Add
      this.data.locations.forEach(loc => {
        const locFront = new Locationinfo(loc);
        locs.push(locFront);

        // 20230301 S_Add
        //土地
        if (loc.locationType == '01') {
          this.sumArea += Number(loc.area);
        }
        // 20230301 E_Add
      });
      // 20220329 S_Update
      /*
      this.sortLocation(locs);
      */
      this.data.locations = locs;
      this.sortLocation();
      // 20220329 E_Update
    } else {
      this.data.locations = [];
    }
    this.sumAreaContractProcess();// 20230309 Add
  }

  // 20230309 S_Add
  /**
   * 地積合計 契約
   */
  sumAreaContractProcess() {
    this.sumAreaContract = 0;
    if (this.data.locations && this.data.locations.length > 0) {
      this.contracts.forEach(ct => {
        const details = ct.details.filter(dt => dt.contractDataType === '01');

        details.forEach(dt => {
          this.data.locations.forEach(me => {
            //土地
            if (me.locationType == '01' && me.pid == dt.locationInfoPid) {
              if (dt.contractHave && dt.contractHave > 0) {
                this.sumAreaContract += Number(dt.contractHave);
              }
              else {
                this.sumAreaContract += Number(me.area);
              }
            }
          });
        });
      });
    }
  }

  openAttachFileDialog(parentPid: number, fileType: number, attachFileType: string) {
    let bukkenNo = this.data.bukkenNo;
    let bukkenName = this.data.bukkenName;

    const dialogRef = this.dialog.open(AttachFileDialogComponent, {
      width: '60%',
      height: '400px',
      data: { parentPid, fileType, attachFileType, bukkenNo, bukkenName }
    });
  }
  // 20230309 E_Add

  // 20220329 S_Update
  /*
  sortLocation(locs : Locationinfo[]) {
    locs.sort((a,b) => {
      let id1 = a.pid;
      let id2 = b.pid;

      if(a.locationType === '04' && a.ridgePid !== null && a.ridgePid !== '0' && a.ridgePid !== ''){
        id1 = Number(a.ridgePid);
      }
      if(b.locationType === '04' && b.ridgePid !== null && b.ridgePid !== '0' && b.ridgePid !== ''){
        id2 = Number(b.ridgePid);
      }
      if(id1 === id2) {
        return a.locationType.localeCompare(b.locationType);
      }
      return id1 - id2;
    });
  }
  */
  sortLocation() {
    this.data.locations.sort((a, b) => {
      /*
      let id1 = a.locationType != null ? a.locationType : '';
      let id2 = b.locationType != null ? b.locationType : '';
      if(id1 !== id2) return id1.localeCompare(id2);

      id1 = a.blockNumber != null ? a.blockNumber : '';
      id2 = b.blockNumber != null ? b.blockNumber : '';
      if(id1 !== id2) return id1.localeCompare(id2);

      id1 = a.buildingNumber != null ? a.buildingNumber : '';
      id2 = b.buildingNumber != null ? b.buildingNumber : '';
      if(id1 !== id2) return id1.localeCompare(id2);

      id1 = a.address != null ? a.address : '';
      id2 = b.address != null ? b.address : '';
      if(id1 !== id2) return id1.localeCompare(id2);
      */
      let id1 = a.displayOrder != null ? a.displayOrder : 0;
      let id2 = b.displayOrder != null ? b.displayOrder : 0;
      if (id1 !== id2) return id1 - id2;

      return a.pid - b.pid;
    });

    let tempLocs: Locationinfo[] = [];
    let tempLocsNot04 = this.data.locations.filter(loc => loc.locationType !== '04');
    let tempLocs04 = this.data.locations.filter(loc => loc.locationType === '04');
    let pids = [];
    tempLocsNot04.forEach(locNot04 => {
      tempLocs.push(locNot04);
      if (locNot04.locationType === '03') {
        tempLocs04.forEach(loc04 => {

          if (String(locNot04.pid) === loc04.ridgePid && !pids.includes(loc04.pid)) {
            tempLocs.push(loc04);
            pids.push(loc04.pid);
          }
        });
      }
    });
    tempLocs04.forEach(loc04 => {
      if (!pids.includes(loc04.pid)) {
        tempLocs.push(loc04);
        pids.push(loc04.pid);
      }
    });
    this.data.locations = tempLocs;
  }
  // 20220329 E_Update

  /**
   * 所有地追加
   */
  addLocation(): void {
    const loc = new Locationinfo();
    loc.tempLandInfoPid = this.data.pid;
    loc.sharers = [];
    const dialogRef = this.dialog.open(LocationDetailComponent, {
      width: '98%',
      height: '650px',// 20220308 Update
      data: loc
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isSave) {
        this.data.locations.push(result.data);
        // 20230305 S_Update
        // this.sortLocation(this.data.locations);
        // this.sortLocation();
        this.convertForDisplay();
        // 20230305 E_Update
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
      height: '650px',// 20220308 Update
      data: <Locationinfo>Util.deepCopy(loc, 'Locationinfo')
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        // 20210311 S_Update
        // 更新
        /*
        if (result.isSave) {
          this.data.locations[pos] = new Locationinfo(result.data);
          this.resetRegistrant(pos);//20201009 リセットRegistrant
          //loc = new Locationinfo(result.data);
        } else if (result.isDelete) {
          this.data.locations.splice(pos, 1);
        }
        */
        if (result.isSave || result.isDelete) {
          if (result.isSave) {
            this.data.locations[pos] = new Locationinfo(result.data);
            this.resetRegistrant(pos);//20201009 リセットRegistrant
            //loc = new Locationinfo(result.data);
          } else if (result.isDelete) {
            this.data.locations.splice(pos, 1);
          }
          // 20230305 S_Update
          // this.sortLocation();
          this.convertForDisplay();
          // 20230305 E_Update
        }
        // キャンセルで戻っても謄本添付ファイルは最新を設定
        else {
          const temp = new Locationinfo(result.data);
          this.data.locations[pos].attachFiles = temp.attachFiles;
        }
        // 20210311 E_Update
      }
    });
  }

  /**
   * Registrantリセット
   * @param pos ロケーションポジション
   */
  resetRegistrant(pos: number) {
    let sharers = this.data.locations[pos].sharers.map(me => me.pid);
    let locId = this.data.locations[pos].pid;
    //契約ループ
    this.contracts.forEach(me => {

      //契約明細ループ
      me.details.filter(dt => dt.locationInfoPid === locId).forEach(dt => {
        dt.registrants = dt.registrants.filter(rt => sharers.indexOf(rt.sharerInfoPid) >= 0);
      });

    });
  }

  /**
   * 所有地コピー
   * @param loc ：所有地
   */
  copyLocation(loc: Locationinfo) {
    const newLoc = new Locationinfo(loc);
    const newSharer = JSON.parse(JSON.stringify(loc.sharers));
    newLoc.sharers = newSharer;
    newLoc.sharers.forEach(sh => {
      sh.locationInfoPid = null
      sh.pid = null
    });
    newLoc.pid = null;
    newLoc.attachFiles = [];// 20210312 Add
    const dialogRef = this.dialog.open(LocationDetailComponent, {
      width: '98%',
      height: '550px',
      data: newLoc
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      //20200811 S_Update
      /*
      if (result) {
        this.data.locations.push(newLoc);
      }
      */
      if (result && result.isSave) {
        this.data.locations.push(result.data);
        // 20230305 S_Update
        // this.sortLocation(this.data.locations);
        // this.sortLocation();
        this.convertForDisplay();
        // 20230305 E_Update
      }
      //20200811 E_Update
    });
  }

  /**
   * 一覧へ戻る
   */
  backToList() {
    this.router.navigate(['/bukkens'], { queryParams: { search: '1' } });
  }

  /**
   * プラン画面切り替え
   */
  switchTab(event: MatRadioChange) {
    if (event.value === 1) {
      this.tabGroup.selectedIndex = 0;
    } else {
      this.tabGroup.selectedIndex = 1;
    }
    this.cond.mode = event.value;
    this.service.searchCondition = this.cond;
  }

  /**
   * データ保存
   */
  // 20210426 S_Update
  // save() {
  save(copyFlg: boolean) {
    // 20210426 E_Update
    if (!this.validate()) {
      return;
    }

    const dlg = new Dialog({ title: '確認', message: '土地情報を登録します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();

        // 20210117 保存する前緯度経度取得
        const that = this;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: this.data.residence }, function (results: any, status: any) {
          if (status === google.maps.GeocoderStatus.OK) {
            that.data.latitude = results[0].geometry.location.lat(); // 緯度を取得
            that.data.longitude = results[0].geometry.location.lng();// 経度を取得
          }
          else {
            that.data.latitude = 0;
            that.data.longitude = 0;
          }

          // 20210426 S_Update
          //          that.data.convertForSave(that.service.loginUser.userId, that.datepipe, true);
          that.data.convertForSave(that.service.loginUser.userId, that.datepipe, true, copyFlg);
          // 20210426 E_Update
          const funcs = [];
          // 20210426 S_Update
          //          funcs.push(that.service.saveLand(that.data));
          if (copyFlg) funcs.push(that.service.saveLandByCopy(that.data));
          else funcs.push(that.service.saveLand(that.data));
          // 20210426 E_Update
          Promise.all(funcs).then(values => {
            that.spinner.hide();
            // 20231110 S_Add
            if (values[0].statusMap == 'NG') {
              that.dialog.open(FinishDialogComponent, {
                width: '500px',
                height: '250px',
                data: new Dialog({ title: 'エラー', message: values[0].msgMap })
              });
            }
            else {
              // 20231110 E_Add
              const finishDlg = new Dialog({ title: '完了', message: '土地情報を登録しました。' });
              const dlgVal = that.dialog.open(FinishDialogComponent, {
                width: '500px',
                height: '250px',
                data: finishDlg
              });
              dlgVal.afterClosed().subscribe(res => {
                that.data = new Templandinfo(values[0]);
                that.convertForDisplay();
                // 20220522 S_Add
                if (copyFlg) {
                  that.service.getLandContract(that.data.pid).then(res => {
                    that.contracts = res;
                  });
                }
                // 20220522 E_Add
                that.router.navigate(['/bkdetail'], { queryParams: { pid: that.data.pid } });
              });
            }// 20231110 Add
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

    // this.checkBlank(this.data.bukkenName, 'bukkenName', '物件名は必須です。');
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
   * @param map : 削除したい地図
   */
  deleteMapFile(map: MapAttach) {

    const dlg = new Dialog({ title: '確認', message: 'ファイルを削除します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

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
   * @param map : 削除したいファイル添付
   */
  deleteAttachFile(map: AttachFile) {

    const dlg = new Dialog({ title: '確認', message: 'ファイルを削除します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

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
    this.router.navigate(['/ctdetail'], { queryParams: { bukkenid: this.data.pid } });
  }

  /**
   * 契約詳細
   * @param data : 契約情報
   */
  showContract(ctData: Contractinfo) {
    this.router.navigate(['/ctdetail'], { queryParams: { pid: ctData.pid } });
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

  showContractNo(loc: Locationinfo, contractNo: string) {
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
    let status = '';// this.getCodeTitle('013', '01');

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

      status = this.getCodeTitle('013', '01');

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
  /**
   * 所在地表示
   * @param contract 契約者
   */
  displayAddress(contract: Contractinfo) {
    const lst = contract.details.filter(dt => dt.contractDataType === '01').map(dt => {
      return this.data.locations.filter(loc => loc.pid === dt.locationInfoPid && !this.isBlank(loc.address)).map(loc => loc.address);
    });
    return (lst.length > 0 ? lst[0] : '');
  }
  /**
   * 地番表示
   * @param contract 契約者
   */
  displayBlockNumber(contract: Contractinfo) {
    return contract.details.filter(dt => dt.contractDataType === '01').map(dt => {
      return this.data.locations.filter(loc => loc.pid === dt.locationInfoPid).map(loc => !this.isBlank(loc.blockNumber) ? loc.blockNumber : '-');
    }).join('\n\r');
  }
  /**
   * 家屋番号表示
   * @param contract 契約者
   */
  displayBuildingNumber(contract: Contractinfo) {
    return contract.details.filter(dt => dt.contractDataType === '01').map(dt => {
      return this.data.locations.filter(loc => loc.pid === dt.locationInfoPid).map(loc => !this.isBlank(loc.buildingNumber) ? loc.buildingNumber : '-');
    }).join('\n\r');
  }
  /**
   * 所有者表示
   * @param contract 契約者
   */
  displayOwner(contract: Contractinfo) {
    return contract.details.filter(dt => dt.contractDataType === '01').map(dt => {
      return this.data.locations.filter(loc => loc.pid === dt.locationInfoPid).map(loc => !this.isBlank(loc.owner) ? loc.owner : '-');
    }).join('\n\r');
  }

  /**
   * 物件プラン
   */
  gotoPlan() {
    // 20210426 S_Update
    //    if(this.pid != null && this.pid > 0) {
    if (this.pid != null && this.pid > 0 && !this.copyFlg) {
      // 20210426 E_Update
      this.router.navigate(['/bukkenplans'], { queryParams: { pid: this.pid } });
    }
  }

  export() {

    const dlg = new Dialog({ title: '確認', message: '売買取引管理表を出力します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportSale(this.pid).then(data => {
          this.service.writeToFile(data, "売買取引管理表");
          this.spinner.hide();
        });
      }
    });
  }

  // 20210524 S_Add
  /**
   * 取引成立台帳
   */
  exportTransaction() {
    const dlg = new Dialog({ title: '確認', message: '取引成立台帳を出力します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportTransaction(this.pid).then(data => {
          this.service.writeToFile(data, "取引成立台帳");
          this.spinner.hide();
        });
      }
    });
  }
  // 20210524 E_Add

  // 20201006 S_Add
  /**
   * 事業収支画面遷移
   * ※本番では未使用
   */
  navigatePlan() {
    this.router.navigate(['/plandetail'], { queryParams: { bukkenid: this.data.pid } });
  }
  // 20201006 E_Add

  // 20210112 S_Add
  /**
   * チェックボックスON/OFF
   */
  changeFlg(event, flgType: string) {
    if (flgType === 'bukkenListChk') this.data.bukkenListChk = (event.checked ? '1' : '0');
  }

  /**
   * 物件担当者と同じボタン
   */
  sameClick() {
    this.data.infoOfferMap = this.data.infoStaffMap;
  }

  /**
   * 重要度決定
   */
  setImportance(data: Templandinfo) {
    let importance = '';
    // 不可分分子
    let indivisibleNumerator = this.getNumber(this.removeComma(data.indivisibleNumerator));
    // 不可分分母
    let indivisibleDenominator = this.getNumber(this.removeComma(data.indivisibleDenominator));

    if (indivisibleNumerator > 0 && indivisibleDenominator > 0) {
      let rate = Math.floor(indivisibleNumerator / indivisibleDenominator * 100)
      // 不可分子/不可分母≧50％
      // 20240131 S_Update
      // if (rate >= 50) importance = 'A';
      if (indivisibleDenominator - indivisibleNumerator == 1) importance = 'A';
      // 20240131 E_Update
      // 不可分子≧2かつ不可分子/不可分母<50％
      else if (indivisibleNumerator >= 2 && rate < 50) importance = 'B';
      // 不可分子＝1
      else if (indivisibleNumerator == 1) importance = 'C';
    }
    data.importance = importance;
  }
  // 20210112 E_Add
  // 20210314 S_Add
  deleteContract(contract: Contractinfo, pos: number) {
    const dlg = new Dialog({ title: '確認', message: '削除してよろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteContract(contract.pid).then(res => {
          this.contracts.splice(pos, 1);
        });
      }
    });
  }

  /**
   * 謄本ファイルアップロード
   * @param event ：ファイル
   */
  uploadedLoc(event, loc: Locationinfo) {
    if (loc.attachFiles === null) {
      loc.attachFiles = [];
    }
    const attachFile: LocationAttach = JSON.parse(JSON.stringify(event));
    loc.attachFiles.push(attachFile);
  }
  // 20210314 E_Add

  // 20211107 S_Add
  /**
   * 決済案内出力
   */
  buyInfoExport() {
    let lst = this.contracts.filter(me => me.csvSelected).map(me => Number(me.pid));
    if (lst.length === 0) return;

    const dlg = new Dialog({ title: '確認', message: '決済案内を出力します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportBuyInfo(lst).then(data => {
          this.service.writeToFile(data, "買取決済");
          this.spinner.hide();
        });
      }
    });
  }
  // 20211107 E_Add

  // 20231020 S_Add
  // 物件写真アップロード
  photoUploaded(event) {

    if (this.data.photoFilesMap === null) {
      this.data.photoFilesMap = [];
    }
    const file: BukkenPhotoAttach = JSON.parse(JSON.stringify(event));
    this.data.photoFilesMap.push(file);
  }

  /**
   * 物件写真削除
   * @param map : 削除したい物件写真
   */
  deletePhotoFile(file: BukkenPhotoAttach) {

    const dlg = new Dialog({ title: '確認', message: 'ファイルを削除します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteFile(file.pid, false, true).then(res => {
          this.data.photoFilesMap.splice(this.data.photoFilesMap.indexOf(file), 1);
        });
      }
    });
  }
  // 20231020 E_Add
}
