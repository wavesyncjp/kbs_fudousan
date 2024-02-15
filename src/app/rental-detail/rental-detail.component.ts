import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { RentalInfo } from '../models/rentalinfo';
import { Code } from '../models/bukken';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Dialog } from '../models/dialog';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { Util } from '../utils/util';
import { RentalContractDetailComponent } from '../rentalContract-detail/rentalContract-detail.component';
import { RentalContract } from '../models/rentalcontract';
import { RentalReceive } from '../models/rentalreceive';
// 20231010 S_Add
import { EvictionInfo } from '../models/evictioninfo';
import { EvictionInfoDetailComponent } from '../eviction-detail/eviction-detail.component';
import { Converter } from '../utils/converter';
import { parseJSON } from 'date-fns';
// 20231010 E_Add

declare var $: any;// 20231010 Add
@Component({
  selector: 'app-rental-detail',
  templateUrl: './rental-detail.component.html',
  styleUrls: ['./rental-detail.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class RentalInfoDetailComponent extends BaseComponent {

  @ViewChild('topElement', { static: true }) topElement: ElementRef;

  public locationInfos = [];// 地番　家屋番号
  public contractSellerInfos = [];// 所有者名

  public rental: RentalInfo;
  public pid: number;
  public contractInfoPid: number;// 仕入契約情報PID
  public tempLandInfoPid: number;// 土地情報PID
  public receiveAllFlg: string;

  public rentalContracts = [];//賃貸契約
  public rentalContractsBk = [];//賃貸契約（変更前）20231027 Add
  public rentalReceives = [];//賃貸入金
  public rentalReceivesBk = [];//賃貸入金（変更前）
  // 20231027 S_Add
  public evictions: EvictionInfo[];// 立退き一覧
  bukkens = [];
  bukkenMap: { [key: string]: number; } = {};
  public bukkenName: string;
  contracts: Code[];
  isDisableContract = false;
  // 20231027 E_Add

  bankPids: Code[];
  locationInfoPids: Code[];
  contractSellerInfoPids: Code[];
  locationNumbers: Code[];
  locationInfoPidDB: number;// DBの所在地情報PID
  ownershipRelocationDateDB: string;// DBの所有権移転日 20231010 Add
  dateIds: [];

  constructor(public router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public service: BackendService,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe) {
    super(router, service, dialog);
    this.route.queryParams.subscribe(params => {
      this.pid = params.pid;
      this.contractInfoPid = params.contractInfoPid;
      this.tempLandInfoPid = params.tempLandInfoPid;
      this.isDisableContract = this.contractInfoPid > 0;// 20231027 Add
    });

    this.rental = new RentalInfo();
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('賃貸情報詳細');

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();

    const funcs = [];

    funcs.push(this.service.getCodes(['005', '043', '015']));
    funcs.push(this.service.getBanks('1'));

    if (this.contractInfoPid > 0) {// 20231027 Add
      //地番　家屋番号を取得
      let cond = {
        searchFor: 'searchLocationNumber'
        , contractInfoPid: this.contractInfoPid
        , isGetMore: 1 // 20231010 Add
      };
      funcs.push(this.service.commonSearch(cond));

      //所有者名を取得
      cond.searchFor = 'searchSellerName';
      funcs.push(this.service.commonSearch(cond));

      //物件名称を取得
      cond.searchFor = 'searchContractSimple';
      funcs.push(this.service.commonSearch(cond));
      // 20231027 S_Add  
    }
    else {
      funcs.push(this.service.getLands(null));   // 物件情報一覧の取得
      if (this.pid > 0) {
        let cond = {
          searchFor: 'searchContractSimple'
          , tempLandInfoPid: this.tempLandInfoPid
        };
        //物件名称を取得
        funcs.push(this.service.commonSearch(cond));
      }
    }
    // 20231027 E_Add

    if (this.pid > 0) {
      funcs.push(this.service.rentalGet(this.pid));
    }

    Promise.all(funcs).then(values => {
      // コード
      this.processCodes(values[0] as Code[]);

      this.banks = values[1];
      this.bankPids = this.getBanks();

      if (this.contractInfoPid > 0) {// 20231027 Add
        this.locationInfos = values[2];
        let pidsTemp = [];
        this.locationInfoPids = [];

        this.locationInfos.forEach(loc => {
          if ((loc.blockNumber != null && loc.blockNumber != '') || (loc.buildingNumber != null && loc.buildingNumber != '') || (loc.ridgePid != null && loc.address != null && loc.address != '')) {
            let pid = loc.ridgePid != null ? loc.ridgePid : loc.locationInfoPid;

            if (!pidsTemp.includes(pid)) {
              pidsTemp.push(pid);
              this.locationInfoPids.push(new Code({ codeDetail: pid, name: loc.ridgePid != null ? loc.address : ((loc.blockNumber ?? '') + ' ' + (loc.buildingNumber ?? '')) }));
            }
          }
        });

        this.contractSellerInfos = values[3];
        this.contractSellerInfoPids = this.contractSellerInfos.map(loc => new Code({ codeDetail: loc.pid, name: loc.contractorName }));

        // 20231027 S_Add
        let contractsTemp = values[4];

        this.bukkenName = `${contractsTemp[0].bukkenNo}:${contractsTemp[0].bukkenName}`;

        let lst: Code[] = [];
        contractsTemp.forEach(item => {
          lst.push(new Code({ codeDetail: item.pid, name: item.bukkenNo + '-' + item.contractNumber }))
        });
        this.contracts = lst;
        // 20231027 E_Add
      }// 20231027 Add
      // 20231027 S_Add
      else {
        this.lands = values[2];
        //入力の際に表示される物件名称を取得するための処理
        this.bukkens = this.lands
        //物件名称をキーにpidをmapに保持していく
        this.lands.forEach((land) => {
          this.bukkenMap[land.bukkenNo + ':' + land.bukkenName] = land.pid
        });

        // 20240201 S_Add
        if (this.pid > 0) {
          let contractsTemp = values[3];

          this.bukkenName = `${contractsTemp[0].bukkenNo}:${contractsTemp[0].bukkenName}`;

          let lst: Code[] = [];
          contractsTemp.forEach(item => {
            lst.push(new Code({ codeDetail: item.pid, name: item.bukkenNo + '-' + item.contractNumber }))
          });
          this.contracts = lst;
        }
        // 20240201 E_Add
      }
      // 20231027 E_Add

      // 賃貸あり場合
      if (this.pid > 0) {
        // 20231027 S_Update
        // this.rental = new RentalInfo(values[4] as RentalInfo);
        // this.locationInfoPidDB = this.rental.locationInfoPid;
        // this.ownershipRelocationDateDB = this.rental.ownershipRelocationDate;

        // this.rentalContracts = values[4].rentalContracts;
        // this.rentalReceives = values[4].rentalReceives;

        // 20240201 S_Update
        // let dataTemp = values[5];
        let dataTemp = this.contractInfoPid > 0 ? values[5] : values[4];

        // 20240201 E_Update
        this.rental = new RentalInfo(dataTemp as RentalInfo);

        this.locationInfoPidDB = this.rental.locationInfoPid;
        this.ownershipRelocationDateDB = this.rental.ownershipRelocationDate;

        this.rentalContracts = dataTemp.rentalContracts;
        this.rentalReceives = dataTemp.rentalReceives;

        this.evictions = dataTemp.evictionsMap;
        // 20231027 E_Update

        this.backupRentalReceive();

        this.rental.convert();
      } else {
        this.rental = new RentalInfo();
        // 20231027 S_Add
        if (this.contractInfoPid > 0) {
          this.rental.contractInfoPid = this.contractInfoPid;
        }
        // 20231027 E_Add
      }
      this.spinner.hide();
    });
  }

  /**
   * 賃貸入金の変更前データ
   */
  backupRentalReceive() {
    this.convertBeforeShow();//2023105 Add

    this.rentalReceivesBk = [];
    this.rentalReceives.forEach(r => {
      r.details.forEach(d => {
        this.rentalReceivesBk.push(<RentalReceive>Util.deepCopy(d, 'RentalReceive'));
      });
    });

    // 20231027 S_Add
    this.rentalContractsBk = [];
    this.rentalContracts.forEach(r => {
      this.rentalContractsBk.push(<RentalContract>Util.deepCopy(r, 'RentalContract'));
    });
    // 20231027 E_Add
  }

  //数値にカンマを付ける作業
  changeValue(val) {
    val = this.numberFormat(val);
    return val;
  }

  /**
   * 登録
   */
  save() {
    if (!this.validate()) {
      return;
    }
    const dlg = new Dialog({ title: '確認', message: '賃貸情報を登録しますが、よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();

        let isNeedReload = false;
        // 20231010 S_Add
        this.rental.convertForSave(this.service.loginUser.userId, this.datepipe);
        // 20231010 E_Add

        if (!this.rental.pid || this.rental.pid < 1) {
          this.rental.contractInfoPid = this.contractInfoPid;
          this.rental.tempLandInfoPid = this.tempLandInfoPid;
        }
        // 20231010 S_Update
        // else if (this.locationInfoPidDB != this.rental.locationInfoPid) {
        else if (this.locationInfoPidDB != this.rental.locationInfoPid || this.ownershipRelocationDateDB != this.rental.ownershipRelocationDate) {
          // 20231010 E_Update
          isNeedReload = true;
        }
        // 20231010 S_Delete
        // this.rental.convertForSave(this.service.loginUser.userId, this.datepipe);
        // 20231010 E_Delete

        if (this.rental.pid > 0) {
          // 20231027 S_Add
          this.rental.rentalContractsChanged = this.getContractsChanged();
          if (this.rental.rentalContractsChanged.length > 0) {
            isNeedReload = true;
          }
          // 20231027 E_Add
          this.rental.rentalReceivesChanged = this.getReceivesChanged();
        }

        this.service.rentalSave(this.rental).then(res => {
          // 20231010 S_Add
          if (res.statusMap === 'NG') {
            this.spinner.hide();
            this.dialog.open(FinishDialogComponent, {
              width: '500px', height: '250px',
              data: new Dialog({ title: 'エラー', message: res.msgMap })
            });
          }
          else {
            // 20231010 E_Add
            const finishDlg = new Dialog({ title: '完了', message: '賃貸情報を登録しました。' });

            const dlgVal = this.dialog.open(FinishDialogComponent, {
              width: '500px',
              height: '250px',
              data: finishDlg
            });

            dlgVal.afterClosed().subscribe(val => {
              this.spinner.hide();
              this.rental = new RentalInfo(res);
              this.locationInfoPidDB = this.rental.locationInfoPid;
              // 20231010 S_Add
              this.ownershipRelocationDateDB = this.rental.ownershipRelocationDate;
              // 20231010 E_Add
              this.rental.convert();
              if (isNeedReload) {
                this.searchRentalContract_Receive();
              }
              else {
                this.backupRentalReceive();
              }
              // 20240201 S_Update
              // this.router.navigate(['/rendetail'], { queryParams: { pid: this.rental.pid, contractInfoPid: this.rental.contractInfoPid } });
              this.router.navigate(['/rendetail'], { queryParams: { pid: this.rental.pid, contractInfoPid: this.rental.contractInfoPid, tempLandInfoPid: this.rental.tempLandInfoPid } });
              // 20240201 E_Update
            });
          }// 20231010 Add
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

    this.checkBlank(this.rental.locationInfoPid, 'locationInfoPid', '地番 家屋番号は必須です。');
    this.checkBlank(this.rental.apartmentName, 'apartmentName', '建物名は必須です。');

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * 一覧へ戻る
   */
  backToList() {
    this.router.navigate(['/rentals'], { queryParams: { search: '1' } });
  }

  /**
   * 契約情報遷移
   */
  toContract() {
    this.router.navigate(['/ctdetail'], { queryParams: { pid: this.contractInfoPid } });
  }

  /**
   * 賃貸契約追加
   */
  addRentalContract(): void {
    const data = new RentalContract();
    data.rentalInfoPid = this.rental.pid;
    data.contractInfoPid = this.rental.contractInfoPid;
    data.tempLandInfoPid = this.rental.tempLandInfoPid;
    data.locationInfoPid = this.locationInfoPidDB;

    const dialogRef = this.dialog.open(RentalContractDetailComponent, {
      width: '98%',
      height: '650px',
      data: data
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isSave) {
        this.rentalContracts.push(result.data);
        // 20231106 S_Update
        // this.searchRentalReceive();
        this.searchRentalContract_Receive();
        // 20231106 E_Update
      }
    });
  }

  /**
   * 賃貸契約詳細
   * @param obj : 賃貸契約
   */
  showRentalContract(obj: RentalContract, pos: number) {
    obj.locationInfoPidForSearch = this.locationInfoPidDB;
    obj.ownershipRelocationDateDbMap = this.ownershipRelocationDateDB;
    const dialogRef = this.dialog.open(RentalContractDetailComponent, {
      width: '98%',
      height: '650px',
      data: <RentalContract>Util.deepCopy(obj, 'RentalContract')
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result.isSave || result.isDelete) {
          if (result.isSave) {
            this.rentalContracts[pos] = new RentalContract(result.data);
          } else if (result.isDelete) {
            this.rentalContracts.splice(pos, 1);
          }
        }
        // 20231106 S_Update
        // this.searchRentalReceive();
        this.searchRentalContract_Receive();
        // 20231106 E_Update
      }
    });
  }

  /**
   * 賃貸契約コピー
   * @param obj 賃貸契約
   */
  copyRentalContract(obj: RentalContract) {
    const data = new RentalContract(obj);
    data.pid = null;

    const dialogRef = this.dialog.open(RentalContractDetailComponent, {
      width: '98%',
      height: '550px',
      data: data
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {

      if (result && result.isSave) {
        this.rentalContracts.push(result.data);
        this.searchRentalReceive();
      }
    });
  }
  /**
   * 賃貸契約削除
   * @param obj 賃貸契約
   * @param pos 
  */
  deleteRentalContract(obj: RentalContract, pos: number) {
    const dlg = new Dialog({ title: '確認', message: '削除してよろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteRentalContract(obj).then(res => {
          this.rentalContracts.splice(pos, 1);
          this.searchRentalReceive();
        });
      }
    });
  }

  /**
   * 賃貸入金を取得
   */
  searchRentalReceive() {
    const funcs = [];

    let cond = {
      searchFor: 'searchRentalReceive'
      , rentalInfoPid: this.rental.pid
    };
    funcs.push(this.service.commonSearch(cond));

    Promise.all(funcs).then(values => {
      this.rentalReceives = values[0];

      this.backupRentalReceive();
    });
  }

  /**
   * 賃貸契約・入金を取得
   */
  searchRentalContract_Receive() {
    const funcs = [];

    let cond = {
      searchFor: 'searchRentalContract_Receive'
      , rentalInfoPid: this.rental.pid
    };
    funcs.push(this.service.commonSearch(cond));

    Promise.all(funcs).then(values => {
      this.rentalContracts = values[0].rentalContracts;
      this.rentalReceives = values[0].rentalReceives;

      this.backupRentalReceive();
    });
  }

  // 20231027 S_Add
  /**
   * 変更された賃貸契約を取得
   * @returns 
   */
  getContractsChanged() {
    let listChangeds = [];

    this.rentalContracts.forEach(obj => {
      let objBk = this.rentalContractsBk.filter(b => b.pid == obj.pid)[0];

      if (objBk.rentPriceRefMapMap != obj.rentPriceRefMapMap) {
        obj.rentPriceRefMap = Converter.stringToNumber(obj.rentPriceRefMapMap);
        listChangeds.push(obj);
      }
    });
    return listChangeds;
  }
  // 20231027 E_Add
  /**
   * 変更された賃貸入金を取得
   * @returns 
   */
  getReceivesChanged() {
    let listChangeds = [];

    this.rentalReceives.forEach(r => {
      r.details.forEach(d => {
        let objBk = this.rentalReceivesBk.filter(b => b.pid == d.pid)[0];

        // 20231010 S_Update
        // if (objBk.receiveFlg != d.receiveFlg) {
        let receiveDay = Converter.dateToString(d.receiveDayMap, 'yyyyMMdd', this.datepipe);
        if (objBk.receiveFlg != d.receiveFlg || objBk.receiveDay != receiveDay) {
          d.receiveDay = receiveDay;
          // 20231010 E_Update
          listChangeds.push(d);
        }
      });
    });
    return listChangeds;
  }

  /**
   * 一括入金フラグを変更
   * @param event 
   */
  changeReceiveAllFlg(event) {
    this.receiveAllFlg = (event.checked ? '1' : '0');

    this.rentalReceives.forEach(r => {
      this.changeReceiveFlgGroup(event, r);
    });
  }

  /**
  * グループの入金フラグを変更
  * @param event 
  * @param flg 
  */
  changeReceiveFlgGroup(event, flg: any) {
    flg.receiveFlgGroup = (event.checked ? '1' : '0');

    let listDetails = this.rentalReceives.filter(a => a.receiveMonth == flg.receiveMonth);

    if (listDetails.length > 0) {
      for (var i = 0; i < listDetails.length; i++) {
        let details = listDetails[i].details;

        for (var d = 0; d < details.length; d++) {
          let item = details[d];
          let con = this.rentalContracts.filter(c => c.pid == item.rentalContractPid)[0];

          //賃料免除開始日以外
          // 20231101 S_Update
          // if (!(this.isDisableByRenContract(item.receiveMonth, con.roomRentExemptionStartDate))) {
          if (!(this.isDisableByRenContract(item.receiveMonth, con.roomRentExemptionStartDateEvicMap))) {
            // 20231101 E_Update
            item.receiveFlg = flg.receiveFlgGroup;
          }
        }
      }
    }
  }

  // 20231010 S_Update
  // /**
  // * 入金フラグを変更
  // * @param event 
  // * @param details 
  // * @param renConPid 
  // */
  // changeReceiveFlg(event, details, renConPid) {
  //   let receiveFlg = (event.checked ? '1' : '0');
  //   let detail = details.filter(a => a.rentalContractPid == renConPid)[0];
  //   detail.receiveFlg = receiveFlg;

  //   this.rentalReceives.forEach(d => {
  //     var obj = d.details.filter(a => a.pid == detail.pid);
  //     if (obj != null) {
  //       obj.receiveFlg = receiveFlg;
  //       return false;
  //     }
  //   });
  // }

  /**
   * 入金フラグを変更
   * @param event 
   * @param rev 賃貸入金
   */
  changeReceiveFlg(event, rev: RentalReceive) {
    let receiveFlg = (event.checked ? '1' : '0');
    rev.receiveFlg = receiveFlg;
  }
  // 20231010 E_Update

  /**
   * 賃貸契約存在チェック
   * @param details 
   * @param renConPid 
   * @returns 
   */
  isExistRenContract(details, renConPid) {
    return details.filter(a => a.rentalContractPid == renConPid).length > 0;
  }

  /**
   * 賃料免除開始日の該当月以降は無効
   * @param receiveMonth 
   * @param roomRentExemptionStartDate 
   * @returns 
   */
  isDisableByRenContract(receiveMonth, roomRentExemptionStartDate) {
    return roomRentExemptionStartDate && roomRentExemptionStartDate.substring(0, 6) <= receiveMonth;
  }

  /**
  * 賃貸入金.入金日取得
  * @param details 賃貸入金
  * @param conPid 契約情報PID
  * @returns 
  */
  getReceiveDay(details, conPid) {
    return details.filter(a => a.rentalContractPid == conPid)[0].receiveDay;
  }

  /**
 * 賃貸入金.入金Pid
 * @param details 賃貸入金
 * @param conPid 契約情報PID
 * @returns 
 */
  getReceivePid(details, conPid) {
    return details.filter(a => a.rentalContractPid == conPid)[0].pid;
  }

  /**
   * 入金フラグを取得
   * @param details 
   * @param conPid 
   * @returns 
   */
  getReceiveFlg(details, conPid) {
    return details.filter(a => a.rentalContractPid == conPid)[0].receiveFlg;
  }

  // 20231010 S_Add
  /**
   * 立ち退き追加
   */
  addEvictionInfo(): void {
    const data = new EvictionInfo();
    data.rentalInfoPid = this.rental.pid;// 20231027 Add
    data.contractInfoPid = this.rental.contractInfoPid;
    data.tempLandInfoPid = this.rental.tempLandInfoPid;

    const dialogRef = this.dialog.open(EvictionInfoDetailComponent, {
      width: '98%',
      height: '550px',
      data: data
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      // 20231027 S_Add
      if (result && result.isSave) {
        this.evictions.push(result.data);
        // 20231101 S_Update
        // this.searchRentalReceive();
        this.searchRentalContract_Receive();
        // 20231101 E_Update
      }
      // 20231027 E_Add
    });
  }

  getRentalReceive(details, conPid): RentalReceive {
    return details.filter(a => a.rentalContractPid == conPid)[0];
  }

  convertBeforeShow() {
    // 20231027 S_Add
    if (this.rentalContracts != null) {
      this.rentalContracts.forEach(obj => {
        obj.rentPriceRefMapMap = Converter.numberToString(obj.rentPriceRefMap);
      });
    }
    // 20231027 E_Add

    for (var i = 0; i < this.rentalReceives.length; i++) {
      let rev = this.rentalReceives[i];
      let renByMonths: RentalReceive[] = [];

      for (var j = 0; j < this.rentalContracts.length; j++) {
        let con = this.rentalContracts[j];
        let revByMonth = this.getRentalReceive(rev.details, con.pid);
        if (revByMonth == null) {
          revByMonth = new RentalReceive();
        }
        else {
          revByMonth.isExistRenContractMap = this.isExistRenContract(rev.details, con.pid);
          // 20231101 S_Update
          // revByMonth.isDisableByRenContractMap = this.isDisableByRenContract(rev.receiveMonth, con.roomRentExemptionStartDate);
          revByMonth.isDisableByRenContractMap = this.isDisableByRenContract(rev.receiveMonth, con.roomRentExemptionStartDateEvicMap);
          // 20231101 E_Update
          revByMonth.receiveDayMap = Converter.stringToDate(revByMonth.receiveDay, 'yyyyMMdd');;
        }
        renByMonths.push(revByMonth);
      }

      this.rentalReceives[i].renByMonths = renByMonths;
    }
  }
  // 20231010 E_Add

  // 20231027 S_Add
  /**
   * 立ち退き詳細
   * @param loc : 立ち退き
   */
  showEvictionInfo(loc: EvictionInfo, pos: number) {
    const dialogRef = this.dialog.open(EvictionInfoDetailComponent, {
      width: '98%',
      height: '550px',
      data: <EvictionInfo>Util.deepCopy(loc, 'EvictionInfo')
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result.isSave || result.isDelete) {
          if (result.isSave) {
            this.evictions[pos] = new EvictionInfo(result.data);
          } else if (result.isDelete) {
            this.evictions.splice(pos, 1);
          }
          // 20231101 S_Update
          // this.searchRentalReceive();
          this.searchRentalContract_Receive();
          // 20231101 E_Update  
        }
        // キャンセルで戻っても謄本添付ファイルは最新を設定
        else {
        }
      }
    });
  }

  /**
   * 入力の度に物件を検索する
   */
  bukkenSearch() {
    this.bukkens = this.lands.filter(land => `${land.bukkenNo}:${land.bukkenName}`.includes(this.bukkenName));
    const lst = this.lands.filter(land => `${land.bukkenNo}:${land.bukkenName}` === this.bukkenName);
    if (lst.length === 1) {
      this.tempLandInfoPid = this.bukkenMap[this.bukkenName];
      this.loadContracts(this.tempLandInfoPid);
    }
    else {
      this.tempLandInfoPid = null;
      this.contracts = [];
    }
    this.rental.tempLandInfoPid = this.tempLandInfoPid;
    this.rental.contractInfoPid = null;
    this.rental.contractSellerInfoPid = null;
    this.rental.locationInfoPid = null;
  }
  loadContracts(tempLandInfoPid: number) {
    let cond = {
      searchFor: 'searchContractSimple'
      , tempLandInfoPid: tempLandInfoPid
    };

    this.service.commonSearch(cond).then(ret => {

      let lst: Code[] = [];
      ret.forEach(item => {
        lst.push(new Code({ codeDetail: item.pid, name: item.bukkenNo + '-' + item.contractNumber }))
      });

      this.contracts = lst;

      this.spinner.hide();
    });
  }
  searchByContract() {
    this.contractInfoPid = this.rental.contractInfoPid;

    const funcs = [];
    //地番　家屋番号を取得
    let cond = {
      searchFor: 'searchLocationNumber'
      , contractInfoPid: this.rental.contractInfoPid
      , isGetMore: 1
    };
    funcs.push(this.service.commonSearch(cond));

    //所有者名を取得
    cond.searchFor = 'searchSellerName';
    funcs.push(this.service.commonSearch(cond));

    Promise.all(funcs).then(values => {
      this.locationInfos = values[0];
      let pidsTemp = [];
      this.locationInfoPids = [];

      this.locationInfos.forEach(loc => {
        if ((loc.blockNumber != null && loc.blockNumber != '') || (loc.buildingNumber != null && loc.buildingNumber != '') || (loc.ridgePid != null && loc.address != null && loc.address != '')) {
          let pid = loc.ridgePid != null ? loc.ridgePid : loc.locationInfoPid;

          if (!pidsTemp.includes(pid)) {
            pidsTemp.push(pid);
            this.locationInfoPids.push(new Code({ codeDetail: pid, name: loc.ridgePid != null ? loc.address : ((loc.blockNumber ?? '') + ' ' + (loc.buildingNumber ?? '')) }));
          }
        }
      });

      this.contractSellerInfos = values[1];
      this.contractSellerInfoPids = this.contractSellerInfos.map(loc => new Code({ codeDetail: loc.pid, name: loc.contractorName }));

      this.spinner.hide();
    });
  }
  // 20231027 E_Add

  // 20240123 S_Add
  /**
   * 立ち退き削除
   * @param obj 立ち退き
   * @param pos 
   */
  deleteEvictionInfo(obj: EvictionInfo, pos: number) {
    const dlg = new Dialog({ title: '確認', message: '削除してよろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteEviction(obj).then(res => {
          this.evictions = this.evictions.filter(item => item.pid != obj.pid);
        });
      }
    });
  }
  // 20240123 E_Add  
}
