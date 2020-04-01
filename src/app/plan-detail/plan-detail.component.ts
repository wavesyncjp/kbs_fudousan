import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
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
import { ContractFile } from '../models/mapattach';
import { SharerDialogComponent } from '../dialog/sharer-dialog/sharer-dialog.component';
import { ContractSellerInfo } from '../models/contractsellerinfo';
import { Planinfo } from '../models/planinfo';
import { Plandetail } from '../models/plandetail';



@Component({
  selector: 'app-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class PlanDetailComponent extends BaseComponent {

  @ViewChild('topElement', {static: true}) topElement: ElementRef;

  // 20200222 S_Add
  cond = {
    bukkenNo: '',
    bukkenName: '',
    contractNumber: '',
    vacationDayMap: null,
    vacationDay: '',
    contractDay: '',
    contractDayMap: null
  };

  public contract: Contractinfo;
  public data: Templandinfo;
  public pid: number;
  public bukkenid: number;
  public plan: Planinfo;
  public plandetail: Plandetail;
  public bukkenName : string;
  bukkens = [];
  bukkenMap: { [key: string]: number; } = {};
  delSellers = [];
  delDetails = [];

  constructor(public router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public datepipe: DatePipe) {
      super(router, service);
      this.route.queryParams.subscribe(params => {
        this.pid = params.pid;
        this.bukkenid = params.bukkenid;
      });

      this.data = new Templandinfo();
      this.data.locations = [];
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('事業収支詳細');

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();
    this.plan = new Planinfo();

    const funcs = [];
    funcs.push(this.service.getCodes(['011','016','017','018','020']));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getEmps(null));
    
    funcs.push(this.service.getPaymentTypes(null));
    if (this.bukkenid > 0) {
      funcs.push(this.service.getLand(this.bukkenid));
    }
    // tslint:disable-next-line:one-line
    else if (this.pid > 0) {
      funcs.push(this.service.getPlan(this.pid));
    }

    Promise.all(funcs).then(values => {

      const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }
      // 20200222 S_Update
      //      this.emps = values[1];
      this.deps = values[1];
      this.emps = values[2];
      this.plan = values[3];
    
      
     //入力の際に表示される物件名称を取得するための処理
     this.bukkens = this.lands
      
     // データが存在する場合
     if ( values.length > 4) {
       if (this.pid > 0) {
         this.plan = new Planinfo(values[4] as Planinfo);
         this.plan.convert();
         this.bukkenName = values[4].land.bukkenName;
       } else {
         this.plan = new Planinfo();
       }
     }

     //明細情報が存在しない場合
     if (this.plan.details == null || this.plan.details.length == 0) {
       this.plan.details = [];
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "1001";//
       this.plandetail.backNumber = "1";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "1002";//
       this.plandetail.backNumber = "2";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "1003";//
       this.plandetail.backNumber = "3";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "1004";//
       this.plandetail.backNumber = "4";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "1005";//
       this.plandetail.backNumber = "5";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "1101";//
       this.plandetail.backNumber = "11";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "1102";//
       this.plandetail.backNumber = "12";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "1103";//
       this.plandetail.backNumber = "13";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "1104";//
       this.plandetail.backNumber = "14";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "1105";//
       this.plandetail.backNumber = "15";
       this.plan.details.push(this.plandetail);
       this.plandetail.paymentCode = "2001";//
       this.plandetail.backNumber = "21";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2002";//
       this.plandetail.backNumber = "22";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2003";//
       this.plandetail.backNumber = "23";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2004";//
       this.plandetail.backNumber = "24";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2005";//
       this.plandetail.backNumber = "25";
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2006";//
       this.plandetail.backNumber = "26";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2007";//
       this.plandetail.backNumber = "27";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2008";//
       this.plandetail.backNumber = "28";
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2101";//
       this.plandetail.backNumber = "31";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2102";//
       this.plandetail.backNumber = "32";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2103";//
       this.plandetail.backNumber = "33";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2104";//
       this.plandetail.backNumber = "34";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "2105";//
       this.plandetail.backNumber = "35";
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3001";//
       this.plandetail.backNumber = "41";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3002";//
       this.plandetail.backNumber = "42";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3003";//
       this.plandetail.backNumber = "43";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3004";//
       this.plandetail.backNumber = "44";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3005";//
       this.plandetail.backNumber = "45";
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3006";//
       this.plandetail.backNumber = "46";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3007";//
       this.plandetail.backNumber = "47";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3008";//
       this.plandetail.backNumber = "48";
       this.plandetail = new Plandetail();
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3009";//
       this.plandetail.backNumber = "49";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3010";//
       this.plandetail.backNumber = "50";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3011";//
       this.plandetail.backNumber = "51";
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3101";//
       this.plandetail.backNumber = "61";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3102";//
       this.plandetail.backNumber = "62";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3103";//
       this.plandetail.backNumber = "63";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3104";//
       this.plandetail.backNumber = "64";
       this.plan.details.push(this.plandetail);
       this.plandetail = new Plandetail();
       this.plandetail.paymentCode = "3105";//
       this.plandetail.backNumber = "65";
      }

   

     //物件名称をキーにpidをmapに保持していく
     this.lands.forEach((land) => {
       this.bukkenMap[land.bukkenName] = land.pid
     });

     this.spinner.hide();

   });
 }
  
/*坪数計算*/
  changeVal(val) {
    if (this.isNumberStr(val)) {
      return Math.floor(Number(val) * 0.3025 * 100 ) / 100;
    }
    else {
      return '';
    }
  }
  //20200331 ADD まだ機能しない為、再考
  
  getNumber( val ) {
    if(val == null || val === '' || isNaN(val) ) return 0;
    return Number(val);
  }
  changeSum(val1, val2, val3, val4, val5) {
  return this.getNumber(val1) + this.getNumber(val2) + this.getNumber(val3) + this.getNumber(val4) + this.getNumber(val5);
}


  
  /**
   * 契約情報＋所有地マージ
  
  convertData() {

    const locs = [];
    this.data.locations.forEach(loc => {
      const newLoc = new Locationinfo(loc as Locationinfo);
      const lst = this.contract.details.filter(dt => dt.locationInfoPid === loc.pid);
      if (lst.length > 0) {
        newLoc.contractDetail = lst[0];
      } else {
        newLoc.contractDetail = new Contractdetailinfo();
      }
      locs.push(newLoc);
    });
    this.data.locations = locs;
  }
  */
  /**
   * 登録
   */
  save() {
    if (!this.validate()) {
      return;
    }
    const dlg = new Dialog({title: '確認', message: '事業収支情報を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {

        this.spinner.show();

        this.plan.tempLandInfoPid = this.data.pid;
        this.convertForSave(); // 契約詳細⊕不可分データ準備
        this.plan.convertForSave(this.service.loginUser.userId, this.datepipe);
        this.service.savePlan(this.plan).then(res => {

          const finishDlg = new Dialog({title: '完了', message: '事業収支情報を登録しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(val => {
            this.spinner.hide();
            this.plan = new Planinfo(res);
            /*this.convertData();*/
            this.plan.convert();
            this.router.navigate(['/plans'], {queryParams: {pid: this.contract.pid}});
          });

        });
      }
    });

  }

  /**
   * 登録の為の変換
   */
  convertForSave() {
    
    this.plan.tempLandInfoPid = this.bukkenMap[this.bukkenName]
    if (this.plan.tempLandInfoPid == null || this.plan.tempLandInfoPid == 0){
      this.plan.tempLandInfoPid = null
    }
    
  }


  /**
   * チェック
   * @param event チェックイベント
   * @param item ：所有地
   * @param flg ：チェックフラグ
   
  change(event, item: Locationinfo, flg) {
    if (event.checked) {
      item.contractDetail.contractDataType = flg;
    } else {
      item.contractDetail.contractDataType = '';
    }
    if (item.contractDetail.contractDataType !== '03') {
      item.contractDetail.contractArea = null;
    }
  }
*/
  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    this.data.locations.forEach((loc, pos) => {
      if(loc.sharers == null || loc.sharers.length == 1) {
        return;
      }
      if((loc.contractDetail.contractDataType === '01' || loc.contractDetail.contractDataType === '03') 
        && (loc.contractDetail.registrants == null || loc.contractDetail.registrants.length == 0)) {
          if(loc.contractDetail.contractDataType === '01') {
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
    this.router.navigate(['/plans'], {queryParams: {search: '1'}});
  }

  /**
   * 物件情報遷移
   
  toBukken() {
    this.router.navigate(['/bkdetail'], {queryParams: {pid: this.data.pid}});
  }
*/
  /**
   * ファイルアップロード
   * @param event ：ファイル
   
  uploaded(event) {
    if (this.contract.contractFiles === null) {
      this.contract.contractFiles = [];
    }
    const contractFile: ContractFile = JSON.parse(JSON.stringify(event));
    this.contract.contractFiles.push(contractFile);
  }*/

  /**
   * 地図削除
   * @param map :　削除したい地図
   
  deleteFile(map: ContractFile) {

    const dlg = new Dialog({title: '確認', message: 'ファイルを削除しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px',　height: '250px',　data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.deleteContractFile(map.pid).then(res => {
          this.contract.contractFiles.splice(this.contract.contractFiles.indexOf(map), 1);
        });
      }
    });
  }*/

  /**
   * 帳票
   */
  export() {

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
   *
  
  addContractSeller() {
    if (this.contract.sellers == null) {
      this.contract.sellers = [];
    }
    this.contract.sellers.push(new ContractSellerInfo());
  }

  deleteContractSeller(sharerPos: number) {
    const seller = this.contract.sellers[sharerPos];
    if (seller.pid > 0) {
      if (this.delSellers == null) {
        this.delSellers = [];
      }
      this.delSellers.push(seller);
    }
    this.contract.sellers.splice(sharerPos, 1);
  } */
}
