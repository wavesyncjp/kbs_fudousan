// 20240131 S_Update
// import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit, Renderer2, ViewChildren, QueryList } from '@angular/core';
// 20240131 E_Update
import { MatRadioChange } from '@angular/material';
import { BackendService } from '../backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Contractinfo } from '../models/contractinfo';
import { Code } from '../models/bukken';
import { Templandinfo } from '../models/templandinfo';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Dialog } from '../models/dialog';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Locationinfo } from '../models/locationinfo';
import { NgxSpinnerService } from 'ngx-spinner';
import { Contractdetailinfo } from '../models/contractdetailinfo';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { ContractFile, ContractAttach } from '../models/mapattach';
import { SharerDialogComponent } from '../dialog/sharer-dialog/sharer-dialog.component';
import { ContractSellerInfo } from '../models/contractsellerinfo';
import { ContractTemplateComponent } from '../contract-template/contract-template.component';
import { isNullOrUndefined } from 'util';
import { CalcKotozeiDetailComponent } from '../calcKotozei-detail/calcKotozei-detail.component';
// 20230917 S_Add
import { EvictionInfo } from '../models/evictioninfo';
import { RentalInfo } from '../models/rentalinfo';
import { EvictionInfoDetailComponent } from '../eviction-detail/eviction-detail.component';
import { Util } from '../utils/util';
import { DepositInfo } from '../models/depositinfo';
// 20230917 E_Add
// 20240123 S_Add
import { CalRentalSettlementDetailComponent } from '../calRentalSettlement-detail/calRentalSettlement-detail.component';
// 20240123 E_Add
// 20240131 S_Add
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioGroup } from '@angular/material/radio';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { MultiSelectComponent } from 'ng-multiselect-dropdown';
import { RentalSelectComponent } from '../rental-select/rental-select.component';
// 20240131 E_Add
import { AttachFileDialogComponent } from '../dialog/attachFile-dialog/attachFile-dialog.component';// 20250418 Add

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})
// 20240131 S_Update
// export class ContractDetailComponent extends BaseComponent{
export class ContractDetailComponent extends BaseComponent implements AfterViewInit {
  @ViewChildren(MatCheckbox) checkboxes: QueryList<MatCheckbox>;
  @ViewChildren(MatRadioGroup) radioGroups: QueryList<MatRadioGroup>;
  @ViewChildren(MatDatepickerInput) datepickerInputs: QueryList<MatDatepickerInput<any>>;
  @ViewChildren(MultiSelectComponent) dropdowns: QueryList<MultiSelectComponent>;
  // 20240131 E_Update

  @ViewChild('topElement', { static: true }) topElement: ElementRef;

  public contract: Contractinfo;
  public data: Templandinfo;
  public locationsBk = [];// 20250616 Add

  // 20230917 S_Add
  public rentals: RentalInfo[];// 賃貸一覧
  public evictions: EvictionInfo[];// 立退き一覧
  // 20230917 E_Add
  public pid: number;
  public bukkenid: number;
  delSellers = [];
  dropdownSettings = {};//20200828 Add
  // 20230227 S_Add
  authority = '';
  // 20251215 S_Delete
  //enableAttachUser: boolean = false;
  // 20230227 E_Add
  // 20251215 E_Delete
  disableUser: boolean = false;// 20230317 Add
  disableRentalUser: boolean = false;// 20231002 Add
  public sumArea: number = 0;// 20230301 Add

  constructor(public router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public service: BackendService,
    private spinner: NgxSpinnerService,
    private renderer: Renderer2, //20240131
    public datepipe: DatePipe) {
    super(router, service, dialog);
    this.route.queryParams.subscribe(params => {
      this.pid = params.pid;
      this.bukkenid = params.bukkenid;
    });

    this.data = new Templandinfo();
    this.data.locations = [];
  }

  ngAfterViewInit() {
    if (this.disableUser) {
      const inputElements = document.querySelectorAll('input');
      inputElements.forEach((element: HTMLElement) => {
        this.renderer.setProperty(element, 'disabled', true);
      });

      const textareaElements = document.querySelectorAll('textarea');
      textareaElements.forEach((element: HTMLElement) => {
        this.renderer.setProperty(element, 'disabled', true);
      });

      const selectElements = document.querySelectorAll('select');
      selectElements.forEach((element: HTMLElement) => {
        this.renderer.setProperty(element, 'disabled', true);
      });

      if (this.checkboxes) {
        this.checkboxes.forEach((element: MatCheckbox) => {
          element.disabled = true;
        });
      }

      if (this.radioGroups) {
        this.radioGroups.forEach((element: MatRadioGroup) => {
          element.disabled = true;
        });
      }

      if (this.datepickerInputs) {
        this.datepickerInputs.forEach(element => {
          element.disabled = true;
        });
      }

      if (this.dropdowns) {
        this.dropdowns.forEach(element => {
          element.disabled = true;
        });
      }
    }
  }
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('契約情報詳細');

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();
    // 20230227 S_Add
    this.authority = this.service.loginUser.authority;
    // 20251215 S_Delete
    //this.enableAttachUser = (this.authority === '01' || this.authority === '02' || this.authority === '05');// 01:管理者,02:営業事務,05:経理
    // 20251215 E_Delete
    // 20230227 E_Add
    this.disableUser = (this.authority === '03');// 03:営業 20230317 Add
    this.disableRentalUser = (this.authority === '03' || this.authority === '04');// 03:営業,04:一般事務 20231002 Add
    this.contract = new Contractinfo();

    const funcs = [];
    funcs.push(this.service.getCodes(['002', '003', '004', '006', '007', '008', '009', '011', '012', '019', '026']));
    funcs.push(this.service.getEmps('1'));
    if (this.bukkenid > 0) {
      funcs.push(this.service.getLand(this.bukkenid));
    }
    // tslint:disable-next-line:one-line
    else if (this.pid > 0) {
      funcs.push(this.service.getContract(this.pid));
    }

    Promise.all(funcs).then(values => {

      const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a, b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }
      //20200828 S_Update
      /*
      this.users = values[1];
      */
      this.emps = values[1];
      //20200828 E_Update

      // 物件あり場合
      if (values.length > 1) {
        if (this.pid > 0) {
          this.contract = new Contractinfo(values[2] as Contractinfo);
          //20200828 S_Update
          /*
          this.contract.convert();
          */
          this.contract.convert(this.emps);
          //20200828 E_Update
          if (this.contract.sellers == null || this.contract.sellers.length === 0) {
            this.contract.sellers = [];
            this.contract.sellers.push(new ContractSellerInfo());
          }
          this.data = values[2].land;
          // 20230917 S_Add
          this.rentals = values[2].rentalsMap;
          this.evictions = values[2].evictionsMap;
          // 20230917 E_Add
        } else {
          this.data = new Templandinfo(values[2] as Templandinfo);
          this.contract = new Contractinfo();
          this.contract.convertDeposits();// 20231207
          this.contract.sellers = [];
          this.contract.sellers.push(new ContractSellerInfo());
        }
        this.sortLocationContract();// 20230509 Add
        this.convertData();
      }

      //20201009 - 登記名義人まとめ
      this.data.locations.forEach(me => {

        if (me.sharers != null && me.sharers.length > 1) {
          me.sharers = me.sharers.filter(fl => fl.buysellFlg === "1");
        }

      });
      //20201009: END - 登記名義人まとめ
      this.sumAreaProcess();// 20230301 Add
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
  // 20230509 S_Add
  sortLocationContract() {
    this.data.locations.sort((a, b) => {
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
  // 20230509 E_Add
  changeFlg(event: MatRadioChange) {
    if (event.value === '0') {
      this.contract.promptDecideContent = '';
    }
  }

  //数値にカンマを付ける作業
  // 20200709 S_Add
  changeValue(val) {
    val = this.numberFormat(val);
    return val;
  }
  // 20200709 E_Add

  /**
   * 契約情報＋所有地マージ
   */
  convertData() {

    const locs = [];
    this.data.locations.forEach(loc => {
      const newLoc = new Locationinfo(loc as Locationinfo);
      const lst = this.contract.details.filter(dt => dt.locationInfoPid === loc.pid);
      if (lst.length > 0) {
        newLoc.contractDetail = lst[0];
        newLoc.contractDetail02 = lst.filter(me => me.contractDataType === '02').length > 0 ? '02' : ''; //不可分選択
      } else {
        newLoc.contractDetail = new Contractdetailinfo();
      }
      if (loc.locationType !== '03') locs.push(newLoc);
    });
    this.data.locations = locs;
    this.backupLocations();// 20250616 Add
  }

  /**
   * チェックボックス変更
   * @param event ：イベント
   * @param flg ：フラグ
   売買対象flgChange/相続未登記ありnotChange/建物未登記ありyetChange*/
  flgChange1(event, flg: any) {
    flg.deposit1DayChk = (event.checked ? 1 : 0);
    this.contract.deposit1DayChk = flg.deposit1DayChk;
  }
  flgChange2(event, flg: any) {
    flg.deposit2DayChk = (event.checked ? 1 : 0);
    this.contract.deposit2DayChk = flg.deposit2DayChk;
  }
  // 20230511 S_Add
  flgChangeAttachFileChk(event, map: ContractAttach) {
    map.attachFileChk = (event.checked ? "1" : "0");
  }
  // 20230511 E_Add

  // 20210510 S_Add
  deposit3Change(event, flg: any) {
    flg.deposit3DayChk = (event.checked ? 1 : 0);
    this.contract.deposit3DayChk = flg.deposit3DayChk;
  }
  deposit4Change(event, flg: any) {
    flg.deposit4DayChk = (event.checked ? 1 : 0);
    this.contract.deposit4DayChk = flg.deposit4DayChk;
  }
  // 20210510 E_Add
  flgChange3(event, flg: any) {
    flg.earnestPriceDayChk = (event.checked ? 1 : 0);
    this.contract.earnestPriceDayChk = flg.earnestPriceDayChk;
  }
  flgFinish(event, flg: any) {
    flg.decisionDayChk = (event.checked ? 1 : 0);
    this.contract.decisionDayChk = flg.decisionDayChk;
  }
  flgCanncell(event, flg: any) {
    flg.canncellDayChk = (event.checked ? 1 : 0);
    this.contract.canncellDayChk = flg.canncellDayChk;
  }
  //  20230501 S_Add
  flgChangeFixedTaxDay(event, flg: any) {
    flg.fixedTaxDayChk = (event.checked ? 1 : 0);
    this.contract.fixedTaxDayChk = flg.fixedTaxDayChk;
  }
  //  20230501 E_Add

  //  20230418 S_Add
  flgCanncellDayChkAgree(event, flg: any) {
    flg.canncellDayChkAgree = (event.checked ? 1 : 0);
    this.contract.canncellDayChkAgree = flg.canncellDayChkAgree;
  }
  flgCanncellDayChkApproval(event, flg: any) {
    flg.canncellDayChkApproval = (event.checked ? 1 : 0);
    this.contract.canncellDayChkApproval = flg.canncellDayChkApproval;
  }
  //  20230418 E_Add

  // 20210728 S_Add
  retainageChange(event, flg: any) {
    flg.retainageDayChk = (event.checked ? 1 : 0);
    this.contract.retainageDayChk = flg.retainageDayChk;
  }
  // 20210728 E_Add
  // 20211104 S_Add
  flgChangeForSeller(event, seller: ContractSellerInfo, type) {
    if (type == 'contractorType') {
      seller.contractorType = String((event.checked ? 1 : 0));
    }
  }
  // 20211104 E_Add

  /**
   * 登録
   */
  save() {
    if (!this.validate()) {
      return;
    }
    const dlg = new Dialog({ title: '確認', message: '契約情報を登録しますが、よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {

        this.spinner.show();

        this.contract.tempLandInfoPid = this.data.pid;
        this.convertForSave(); // 契約詳細⊕不可分データ準備
        //20200828 S_Update
        /*
        this.contract.convertForSave(this.service.loginUser.userId, this.datepipe);
        */
        this.contract.convertForSave(this.service.loginUser.userId, this.datepipe, true);
        //20200828 E_Update
        this.service.saveContract(this.contract).then(res => {

          // 20231110 S_Add
          if (res.statusMap == 'NG') {
            this.spinner.hide();
            this.dialog.open(FinishDialogComponent, {
              width: '500px',
              height: '250px',
              data: new Dialog({ title: 'エラー', message: res.msgMap })
            });
          }
          else {
            // 20231110 E_Add
            const finishDlg = new Dialog({ title: '完了', message: '契約情報を登録しました。' });
            const dlgVal = this.dialog.open(FinishDialogComponent, {
              width: '500px',
              height: '250px',
              data: finishDlg
            });
            dlgVal.afterClosed().subscribe(val => {
              this.spinner.hide();
              this.contract = new Contractinfo(res);
              this.convertData();
              //20200828 S_Update
              /*
              this.contract.convert();
              */
              this.contract.convert(this.emps);
              //20200828 S_Update
              this.router.navigate(['/ctdetail'], { queryParams: { pid: this.contract.pid } });
            });
          }// 20231110 Add
        });
      }
    });

  }

  /**
   * 登録の為の変換
   */
  convertForSave() {
    const addList = [];
    //const types = ['01', '02', '03'];
    this.data.locations.forEach(loc => {

      //契約データ構成
      let lst = [];
      if (!this.isBlank(loc.contractDetail.contractDataType)) {
        loc.contractDetail.locationInfoPid = loc.pid;
        lst.push(loc.contractDetail);
        //不可分、低地両方チェック
        if (loc.contractDetail.contractDataType === '03' && loc.contractDetail02 === '02') {
          let contract02 = JSON.parse(JSON.stringify(loc.contractDetail)) as Contractdetailinfo;
          contract02.pid = 0;
          contract02.contractDataType = '02';
          contract02.contractArea = null;
          contract02.contractHave = 0;
          lst.push(contract02);
        }
      }

      const detailList = this.contract.details.filter(detail => detail.locationInfoPid === loc.pid);
      //更新
      if (detailList.length > 0) {
        //削除
        if (lst.length === 0) {
          detailList.forEach(me => {
            me.deleteUserId = this.service.loginUser.userId;
          });
        }
        else {
          //上書き
          if (detailList.length === lst.length) {
            for (let index = 0; index < detailList.length; index++) {
              detailList[index] = lst[index];
            }
          }
          else {
            detailList[0] = lst[0]; //1件目
            //1件削除
            if (detailList.length > lst.length) {
              detailList[1].deleteUserId = this.service.loginUser.userId;
            }
            else {
              addList.push(lst[1]);
            }
          }
        }
        //上書き：End        
      }
      //新規
      else {
        lst.forEach(data => {
          addList.push(data);
        });
      }

      /*
      // 削除
      if (detailList.length > 0) {

        if (types.indexOf(loc.contractDetail.contractDataType) < 0) {
          detailList[0].deleteUserId = this.service.loginUser.userId;
        } else {
          detailList[0] = loc.contractDetail;
        }       
      } 
      //追加
      else {

        //選択あり
        if (types.indexOf(loc.contractDetail.contractDataType) >= 0) {
          loc.contractDetail.locationInfoPid = loc.pid;
          addList.push(loc.contractDetail);          
        }
      }
      */

    });

    addList.forEach(data => {
      this.contract.details.push(data);
    });


    // 契約者
    if (this.delSellers.length > 0) {
      this.delSellers.forEach(del => {
        del.deleteUserId = this.service.loginUser.userId;
        this.contract.sellers.push(del);
      });
    }

    // 所有地 (仕入契約登記人情報登録のため)
    this.data.locations.forEach(loc => {
      if (loc.sharers.length > 0) {
        const val = {
          locationInfoPid: loc.pid,
          sharerInfoPid: loc.sharers.map(sr => sr.pid)
        };
        this.contract.locations.push(val);
      }
    });

    // 20250616 S_Add
    var locationsChanged = this.getLocationsChanged();
    this.contract.locationsChangedMap = locationsChanged;
    // 20250616 E_Add
  }

  // 20230301 S_Add
  /**
   * 地積合計
   */
  sumAreaProcess() {
    this.sumArea = 0;
    this.data.locations.forEach(me => {
      //土地
      if (me.locationType == '01' && me.contractDetail.contractDataType == '01') {
        if (me.contractDetail.contractHaveMap) {
          this.sumArea += Number(this.removeComma(me.contractDetail.contractHaveMap));
        }
        else {
          this.sumArea += Number(me.area);
        }
      }
    });
  }
  // 20230301 E_Add

  /**
   * チェック
   * @param event チェックイベント
   * @param item ：所有地
   * @param flg ：チェックフラグ
   */
  change(event, item: Locationinfo, flg) {

    if (event.checked) {
      if (flg === '01') {
        item.contractDetail.contractDataType = flg;
        item.contractDetail02 = '';
      }
      else if (flg === '02') {
        item.contractDetail02 = '02';
        if (this.isBlank(item.contractDetail.contractDataType)) {
          item.contractDetail.contractDataType = '02';
        }
        else if (item.contractDetail.contractDataType === '01') {
          item.contractDetail.contractDataType = '';
        }
      }
      else {
        item.contractDetail.contractDataType = flg;
      }
    }
    else {
      //不可分
      if (flg === '02') {
        item.contractDetail02 = '';
        if (item.contractDetail.contractDataType === '02') {
          item.contractDetail.contractDataType = '';
        }
      }
      else {
        item.contractDetail.contractDataType = '';
      }
    }


    if (item.contractDetail.contractDataType !== '03') {
      item.contractDetail.contractArea = null;
    }
    if (item.contractDetail.contractDataType !== '01') {
      item.contractDetail.contractHave = null;
    }
    this.sumAreaProcess();// 20230301 Add
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    // 20230418 S_Add
    //03:解除済04:解除済(等価交換)
    if (this.contract.contractNow == "03" || this.contract.contractNow == "04") {
      if (!(this.contract.canncellDayChkAgree == "1" || this.contract.canncellDayChkApproval == "1")) {
        this.errorMsgs.push('合意書締結済みもしくは、口頭・稟議取得済みに指定がない場合、契約状況に解除済は指定できません。');
      }
    }
    // 20230418 E_Add

    this.data.locations.forEach((loc, pos) => {
      if (loc.sharers == null || loc.sharers.length == 1) {
        return;
      }
      if ((loc.contractDetail.contractDataType === '01' || loc.contractDetail.contractDataType === '03')
        && (loc.contractDetail.registrants == null || loc.contractDetail.registrants.length == 0)) {
        if (loc.contractDetail.contractDataType === '01') {
          this.errorMsgs.push('売主選択のデータで登記人が選択されていません。');
          this.errors['contractDataType_01_' + pos] = true;
        }
        else {
          this.errorMsgs.push('底地選択のデータで登記人が選択されていません。');
          this.errors['contractDataType_03_' + pos] = true;
        }
      }
    });

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * 一覧へ戻る
   */
  backToList() {
    this.router.navigate(['/contracts'], { queryParams: { search: '1' } });
  }

  /**
   * 物件情報遷移
   */
  toBukken() {
    this.router.navigate(['/bkdetail'], { queryParams: { pid: this.data.pid } });
  }

  /**
   * ファイルアップロード
   * @param event ：ファイル
   */
  uploaded(event) {
    if (this.contract.contractFiles === null) {
      this.contract.contractFiles = [];
    }
    const contractFile: ContractFile = JSON.parse(JSON.stringify(event));
    this.contract.contractFiles.push(contractFile);
  }

  /**
   * 地図削除
   * @param map :　削除したい地図
   */
  deleteFile(map: ContractFile) {

    const dlg = new Dialog({ title: '確認', message: 'ファイルを削除しますが、よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteContractFile(map.pid).then(res => {
          this.contract.contractFiles.splice(this.contract.contractFiles.indexOf(map), 1);
        });
      }
    });
  }

  /**
   * 帳票
   */
  export() {

    //テンプレート選択
    const dialogRef = this.dialog.open(ContractTemplateComponent, {
      width: '450px',
      height: '200px',
      data: {
        pid: this.contract.pid,
        promptDecideFlg: this.contract.promptDecideFlg,
        indivisibleFlg: this.contract.indivisibleFlg,
        equiExchangeFlg: this.contract.equiExchangeFlg,
        tradingType: this.contract.tradingType
      }
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result && result['choose']) {
        this.spinner.show();
        this.service.exportContract(this.contract.pid, result['templatePid']).then(data => {

          /*
          var reader = new FileReader();
          reader.onload = function() {
              alert(reader.result);
          }
          reader.readAsText(data);
          */

          this.service.writeToFile(data, result['fileName']);
          this.spinner.hide();
        });
      }
    });

    /*
    const dlg = new Dialog({title: '確認', message: '契約書を出力しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportContract(this.contract.pid).then(data => {
          this.service.writeToFile(data);
          this.spinner.hide();
        });
      }
    });
    */

  }
  showSharer(loc: Locationinfo) {
    const dialogRef = this.dialog.open(SharerDialogComponent, {
      width: '600px',
      height: '400px',
      data: loc
    });
  }

  hasSharer(loc: Locationinfo) {
    return loc.sharers.length > 0 && loc.sharers.filter(s => s.buysellFlg === '1').length > 0;
  }

  /**
   * 契約者追加
   */
  addContractSeller() {
    if (this.contract.sellers == null) {
      this.contract.sellers = [];
    }
    this.contract.sellers.push(new ContractSellerInfo());
  }

  deleteContractSeller(sharerPos: number) {
    sharerPos++;// 20201001 Add
    const seller = this.contract.sellers[sharerPos];
    if (seller.pid > 0) {
      if (this.delSellers == null) {
        this.delSellers = [];
      }
      this.delSellers.push(seller);
    }
    this.contract.sellers.splice(sharerPos, 1);
  }

  // 20210905 S_Add
  /**
   * 計算
   */
  calcKotozei(): void {
    const dialogRef = this.dialog.open(CalcKotozeiDetailComponent, {
      width: '98%',
      height: '580px',
      data: { contract: this.contract, land: this.data }
    });
  }
  // 20210905 E_Add
  // 20211107 S_Delete
  /**
   * 決済案内出力
   */
  /*
  buyInfoExport() {
    const dlg = new Dialog({title: '確認', message: '決済案内を出力します。よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportBuyInfo(this.contract.pid).then(data => {
          this.service.writeToFile(data, "買取決済");
          this.spinner.hide();
        });
      }
    });
  }
  */
  // 20211107 E_Delete
  // 20230227 S_Add
  /**
   * 契約書等ファイルアップロード
   * @param event ：ファイル
   */
  attachUploaded(event) {
    if (this.contract.contractAttaches === null) {
      this.contract.contractAttaches = [];
    }
    const contractAttach: ContractAttach = JSON.parse(JSON.stringify(event));
    this.contract.contractAttaches.push(contractAttach);
  }

  /**
   * 契約書等削除
   * @param map :　削除したい契約書等
   */
  deleteAttach(map: ContractAttach) {

    const dlg = new Dialog({ title: '確認', message: 'ファイルを削除しますが、よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteContractAttach(map.pid).then(res => {
          this.contract.contractAttaches.splice(this.contract.contractAttaches.indexOf(map), 1);
        });
      }
    });
  }
  // 20230227 E_Add
  // 20230506 S_Add
  /**
   * 契約精算申請書作成
   */
  contractCalculateExport() {
    const dlg = new Dialog({ title: '確認', message: '契約精算申請書を出力します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportContractCalculate(this.contract.pid).then(data => {
          this.service.writeToFile(data, "契約精算申請書");
          this.spinner.hide();
        });
      }
    });
  }
  // 20230506 E_Add

  // 20230917 S_Add
  /**
   * 賃貸画面遷移
   * @param contractInfoPid: 仕入契約情報PID
   * @param tempLandInfoPid:土地情報PID
   */
  navigateRental() {
    this.router.navigate(['/rendetail'], { queryParams: { contractInfoPid: this.pid, tempLandInfoPid: this.data.pid } });
  }

  /**
   * 賃貸情報詳細
   * @param row: 賃貸データ
   */
  showDetailRental(row: RentalInfo) {
    this.router.navigate(['/rendetail'], { queryParams: { pid: row.pid, contractInfoPid: row.contractInfoPid } });
  }

  /**
   * 立ち退き追加
   */
  addEvictionInfo(): void {
    const data = new EvictionInfo();
    data.contractInfoPid = this.contract.pid;
    data.tempLandInfoPid = this.contract.tempLandInfoPid;

    const dialogRef = this.dialog.open(EvictionInfoDetailComponent, {
      width: '98%',
      height: '550px',
      data: data
    });

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isSave) {
        this.evictions.push(result.data);
        // this.convertForDisplay();
      }
    });
  }

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
            // this.resetRegistrant(pos);
          } else if (result.isDelete) {
            this.evictions.splice(pos, 1);
          }
          // this.convertForDisplay();
        }
        // キャンセルで戻っても謄本添付ファイルは最新を設定
        else {
          // const temp = new Locationinfo(result.data);
          // this.data.locations[pos].attachFiles = temp.attachFiles;
          this.evictions[pos].evictionInfoAttachCountMap = result.data.evictionInfoAttachCountMap;// 20250418 Add
        }
      }
    });
  }
  /**
   * 賃貸削除
   * @param obj 賃貸契約
   * @param pos 
   */
  deleteRentalInfo(obj: RentalInfo, pos: number) {
    const dlg = new Dialog({ title: '確認', message: '削除してよろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.rentalDelete(obj).then(res => {
          this.rentals.splice(pos, 1);

          this.evictions = this.evictions.filter(item => item.rentalInfoPid != obj.pid);
        });
      }
    });
  }
  // 20230917 E_Add

  // 20231016 S_Add
  /**
   * 取引成立台帳
   */
  exportRental(rentalInfoPid: number) {
    const dlg = new Dialog({ title: '確認', message: '取引成立台帳（賃貸）を出力します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportRental(rentalInfoPid).then(data => {
          this.service.writeToFile(data, "取引成立台帳（賃貸）");
          this.spinner.hide();
        });
      }
    });
  }
  // 20231016 E_Add

  // 20231115 S_Add
  /**
   * 入金管理表作成
   */
  exportRentalManage(rentalInfoPid: number) {
    const dlg = new Dialog({ title: '確認', message: '入金管理表を出力します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportRentalManage(rentalInfoPid).then(data => {
          this.service.writeToFile(data, "賃貸管理表");
          this.spinner.hide();
        });
      }
    });
  }
  // 20231115 E_Add

  // 20231128 S_Add
  depositDayChange(event, obj: any, idx: number) {
    obj.depositDayChk = (event.checked ? 1 : 0);
    this.contract.depositsMap[idx].depositDayChk = obj.depositDayChk;
  }

  depositChange(event, obj: any, idx: number) {
    obj.depositChk = (event.checked ? 1 : 0);
    this.contract.depositsMap[idx].depositChk = obj.depositChk;
  }
  getIndexJp(idx) {
    switch (idx) {
      case 0:
        return '①';
      case 1:
        return '②';
      case 2:
        return '③';
      case 3:
        return '④';
      case 4:
        return '⑤';
      case 5:
        return '⑥';
      case 6:
        return '⑦';
      case 7:
        return '⑧';
      case 8:
        return '⑨';
      case 9:
        return '⑩';
    }
  }
  addDeposit() {
    if (this.contract.depositsMap == null) {
      this.contract.depositsMap = [];
    }
    this.contract.depositsMap.push(new DepositInfo());
  }
  deleteDeposit(pos: number) {
    this.contract.depositsMap.splice(pos, 1);
  }
  // 20231128 E_Add

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
          // 20240229 S_Update
          // this.evictions = this.evictions.filter(item => item.pid != obj.pid);

          if (res.statusMap === 'NG') {
            this.dialog.open(FinishDialogComponent, {
              width: '500px', height: '250px',
              data: new Dialog({ title: 'エラー', message: res.msgMap })
            });
          }
          else {
            this.evictions = this.evictions.filter(item => item.pid != obj.pid);
          }
          // 20240229 E_Update
        });
      }
    });
  }

  /**
   * 賃料精算金の計算
   */
  calRentalSettlement() {
    const dialogRef = this.dialog.open(CalRentalSettlementDetailComponent, {
      width: '98%',
      height: '580px',
      data: { contract: this.contract, land: this.data }
    });
  }
  // 20240123 E_Add

  // 20240402 S_Add  
  /**
 * 建物名選択
 */
  selectRental() {

    //テンプレート選択
    const dialogRef = this.dialog.open(RentalSelectComponent, {
      width: '450px',
      height: '200px',
      data: this.rentals
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result && result['choose']) {
        //   this.spinner.show();
        //   this.service.exportContract(this.contract.pid, result['templatePid']).then(data => {
        //   this.service.writeToFile(data, result['fileName']);
        //   this.spinner.hide();
        // });

        // 20250418 S_Add
        const dlg = new Dialog({ title: '確認', message: '預り金一覧を出力します。よろしいですか？' });
        const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

        dialogRef.afterClosed().subscribe(resultSub => {
          if (dlg.choose) {
            this.spinner.show();
            this.service.exportDeposit(result["selectedRentalPid"]).then(data => {
              this.service.writeToFile(data, "預り金一覧");
              this.spinner.hide();
            });
          }
        });
        // 20250418 E_Add
      }
    });
  }
  // 20240402 E_Add  


  // 20250418 S_Add
  openAttachFileDialog(parentPid: number,fileType: number, attachFileType: string) {
      const dialogRef = this.dialog.open(AttachFileDialogComponent, {
      width: '60%',
      height: '400px',
      data: {parentPid, fileType, attachFileType}
      });
    }
  // 20250418 E_Add

  // 20250616 S_Add
  /**
   * 取引成立台帳
   */
  exportTransaction() {
    const dlg = new Dialog({ title: '確認', message: '取引成立台帳を出力します。よろしいですか？' });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', height: '250px', data: dlg });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();
        this.service.exportTransaction(this.data.pid, this.contract.pid).then(data => {
          this.service.writeToFile(data, "取引成立台帳");
          this.spinner.hide();
        });
      }
    });
  }
  /**
   * 相続未登記ありチェックボックス変更
   * @param event ：イベント
   * @param data ：所有地
  */
  notChange(event, data: any) {
    data.inheritanceNotyet = (event.checked ? 1 : 0);
  }

  backupLocations() {
    this.locationsBk = [];
    if(this.data != null && this.data.locations != null){
      this.data.locations.forEach(r => {
          this.locationsBk.push(<Locationinfo>Util.deepCopy(r, 'Locationinfo'));
      });
    }
  }

  getLocationsChanged() {
    let listChangeds = [];
    if(this.locationsBk.length > 0){
      this.data.locations.forEach(l => {
        let objBk = this.locationsBk.filter(b => b.pid == l.pid)[0];

        if (objBk.inheritanceNotyet != l.inheritanceNotyet) {
          listChangeds.push(l);
        }
      });
    }
    return listChangeds;
  }
  // 20250616 E_Add
}
