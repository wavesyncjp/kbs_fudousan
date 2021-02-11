import { Component, ViewChild, ElementRef } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Code } from '../models/bukken';
import { Templandinfo } from '../models/templandinfo';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Dialog } from '../models/dialog';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';
import { Paycontractinfo } from '../models/paycontractinfo';
import { Paycontractdetailinfo } from '../models/paycontractdetailinfo';

@Component({
  selector: 'app-paycontract-detail',
  templateUrl: './paycontract-detail.component.html',
  styleUrls: ['./paycontract-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class PayContractDetailComponent extends BaseComponent {

  @ViewChild('topElement', {static: true}) topElement: ElementRef;

  public authority: string = '';
  public paycontract: Paycontractinfo;
  public paycontractdetail: Paycontractdetailinfo;
  public data: Templandinfo;
  public pid: number;
  public bukkenid: number;
  delDetails = [];
  bukkens = [];
  bukkenMap: { [key: string]: number; } = {};
  public bukkenName : string;
  public payTax : number;
  maxDate : number;
  taxRate : number;
  taxEffectiveDay : String;
  effectiveDay : String;

  sellers: Code[];

  constructor(public router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              public service: BackendService,
              private spinner: NgxSpinnerService,
              public datepipe: DatePipe) {
      super(router, service,dialog);
      this.route.queryParams.subscribe(params => {
        this.pid = params.pid;
        this.bukkenid = params.bukkenid;
      });
      /*
      this.data = new Templandinfo();
      this.data.locations = [];
      */
      this.paycontract = new Paycontractinfo();
      this.paycontract.taxEffectiveDayMap = new Date();
  }

  // 20210211 S_Add
  userIds: Code[];
  depCodes: Code[];
  paymentTypes: Code[];
  // 20210211 E_Add

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('支払管理詳細');
    this.authority = this.service.loginUser.authority;

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();
    /*
    this.paycontract = new Paycontractinfo();
    this.paycontract.taxEffectiveDayMap = new Date();
    */

    const funcs = [];
    funcs.push(this.service.getCodes(['002', '003', '004', '006', '007', '008', '009', '011', '012','015','026']));
    funcs.push(this.service.getEmps(null));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getPaymentTypes(null));
    funcs.push(this.service.getLands(null));   // 物件情報一覧の取得
    funcs.push(this.service.getTaxes(null));   // 消費税一覧の取得

    // 20210211 S_Add
    this.userIds = this.getUsers();
    this.depCodes = this.getDeps();
    this.paymentTypes = this.getPaymentTypes();
    // 20210211 E_Add

    if (this.bukkenid > 0) {
      funcs.push(this.service.getLand(this.bukkenid));
    }
    // tslint:disable-next-line:one-line
    else if (this.pid > 0) {
      funcs.push(this.service.getPayContract(this.pid));
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

      this.users = values[1];
      this.deps = values[2];
      this.payTypes = values[3];
      this.lands = values[4];
      this.taxes = values[5];

      //入力の際に表示される物件名称を取得するための処理
      this.bukkens = this.lands
      
      // データが存在する場合
      if ( values.length > 6) {
        if (this.pid > 0) {
          this.paycontract = new Paycontractinfo(values[6] as Paycontractinfo);
          this.paycontract.convert();
          this.bukkenName = `${values[6].land.bukkenNo}:${values[6].land.bukkenName}`;

          //Seller
          this.loadSellers(this.paycontract.tempLandInfoPid);

        }
        /* 
        else {
          this.paycontract = new Paycontractinfo();
        }
        */
      }

      //明細情報が存在しない場合
      if (this.paycontract.details == null || this.paycontract.details.length == 0) {
        this.paycontract.details = [];
        this.paycontract.details.push(new Paycontractdetailinfo());
      }

      //物件名称をキーにpidをmapに保持していく
      this.lands.forEach((land) => {
        this.bukkenMap[land.bukkenNo + ':' + land.bukkenName] = land.pid
      });
      

      this.spinner.hide();

    });
  }

  loadSellers(landId: number) {
    this.service.getBukkenSeller(landId).then(ret => {

      const ids = ret.map(data => data.contractInfoPid).filter((id, i, arr) => arr.indexOf(id) === i);
      let lst : Code[] = [];

      ids.forEach(id => {
        const rt = ret.filter(data => data.contractInfoPid === id && data.contractorName != null && data.contractorName !== '').map(data => {return  { id: data.pid, name: data.contractorName} });
        if(rt.length > 0) {
          lst.push(new Code({codeDetail: rt.map(cd => cd.id).join(','), name: rt.map(cd => cd.name).join(',') }))
        }        

      });

      this.sellers = lst;

    });
  }
  
  

  /**
   * 明細情報追加
   */
  addPayContractDetail() {
    if (this.paycontract.details == null) {
      this.paycontract.details = [];
    }
    this.paycontract.details.push(new Paycontractdetailinfo());
  }

  /**
   * 明細情報削除
   */
  deletePayContractDetail(sharerPos: number) {
    const detail = this.paycontract.details[sharerPos+1];
    if (detail.pid > 0) {
      if (this.delDetails == null) {
        this.delDetails = [];
      }
      this.delDetails.push(detail);
    }
    this.paycontract.details.splice(sharerPos+1, 1);
  }

  /**
   * 登録
   */
  save() {
    if (!this.validate()) {
       return;
    }
    const dlg = new Dialog({title: '確認', message: '支払管理情報を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {

        this.spinner.show();

        this.convertForSave();
        this.paycontract.convertForSave(this.service.loginUser.userId, this.datepipe);   //saveのために日付型のconvertを行う
        this.service.savePayContract(this.paycontract).then(res => {

          const finishDlg = new Dialog({title: '完了', message: '支払管理情報を登録しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(val => {
            this.spinner.hide();
            this.paycontract = new Paycontractinfo(res);
            //this.convertData();
            this.paycontract.convert();
            this.router.navigate(['/paydetail'], {queryParams: {pid: this.paycontract.pid}});
          });

        });
      }
    });

  }

  /**
   * 登録の為の変換
   */
  convertForSave() {
    // 削除データ追加
    if (this.delDetails.length > 0) {
      this.delDetails.forEach(del => {
        del.deleteUserId = this.service.loginUser.userId;
        this.paycontract.details.push(del);
      });
    }

    //入力された物件名称から物件pid
    this.paycontract.tempLandInfoPid = this.bukkenMap[this.bukkenName]
    if (this.paycontract.tempLandInfoPid == null || this.paycontract.tempLandInfoPid == 0){
      this.paycontract.tempLandInfoPid = null
    }
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    if(this.bukkenName != null && this.bukkenName.length != 0){
      if (this.bukkenMap[this.bukkenName] == null || this.bukkenMap[this.bukkenName] == 0){
        this.errorMsgs.push('物件名称がマスタに登録されていません。マスタへの登録を行ってください。');
      }
    }

    this.paycontract.details.forEach((detail, pos) => {
      if( detail.paymentCode == null　|| detail.paymentCode.length == 0 ) {
        this.errorMsgs.push('支払種別は必須入力の項目です。');
        this.errors['detail.paymentCode_' + pos] = true;
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
    this.router.navigate(['/pays'], {queryParams: {search: '1'}});
  }

  /**
   * 入力の度に物件を検索する
   */
  bukkenSearch() {    
    this.bukkens = this.lands.filter(land => `${land.bukkenNo}:${land.bukkenName}`.includes(this.bukkenName));
    const lst = this.lands.filter(land => `${land.bukkenNo}:${land.bukkenName}` === this.bukkenName);
    if(lst.length === 1) {
      this.loadSellers(this.bukkenMap[this.bukkenName]);
    }
    else {
      this.sellers = [];
      if(this.paycontract != null && this.paycontract.details.length > 0) {
        this.paycontract.details.forEach(me => {
          me.contractor = '';
        });
      }
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
   * 税額を自動計算する
   */
  // 20200921 S_Update
  /*
  taxCalc(detail: Paycontractdetailinfo){
    
    detail.payPrice = this.getNumber(this.removeComma(detail.payPriceMap));
    //detail.payPriceTax = this.removeComma(detail.payPriceTaxMap);
    this.paycontract.taxEffectiveDay = this.paycontract.taxEffectiveDayMap != null ? this.datepipe.transform(this.paycontract.taxEffectiveDayMap, 'yyyyMMdd') : null;
    if (detail.payPrice > 0) {
      this.taxRate = 0;
      if(!this.isBlank(this.paycontract.taxEffectiveDay)) {
        var taxtData =this.taxes.filter(me => me.effectiveDay <= this.paycontract.taxEffectiveDay).sort((a,b) => String(b.effectiveDay).localeCompare(a.effectiveDay))[0];
        this.taxRate = taxtData.taxRate;
      }

      let lst = this.payTypes.filter(me => me.paymentCode === detail.paymentCode && me.taxFlg === "1");
      detail.payPriceTax = detail.payPrice;
      //taxFlgが1ではない場合
      if(lst.length == 0) {
        detail.payPriceTaxMap = this.numberFormat(detail.payPriceTax);
      }
      else {
        detail.payPriceTax = Number(detail.payPrice) + Number(Math.floor(detail.payPrice * (this.taxRate / 100)));
        detail.payPriceTaxMap =this.numberFormat(detail.payPriceTax);
      }
      detail.payTaxMap = this.numberFormat(detail.payPriceTax - detail.payPrice);
    }
    else
    {
      detail.payPriceTax = null;
      detail.payTax = null;
    }
  }
  */

  taxCalc(detail: Paycontractdetailinfo){
    
    let payPriceTax = this.getNumber(this.removeComma(detail.payPriceTaxMap));
    let taxEffectiveDay = this.paycontract.taxEffectiveDayMap != null ? this.datepipe.transform(this.paycontract.taxEffectiveDayMap, 'yyyyMMdd') : null;
    
    if (payPriceTax > 0) {
      // 支払金額(税抜)<-支払金額(税込)
      detail.payPrice = payPriceTax;
      detail.payTax = 0;
      
      // 税率
      this.taxRate = 0;
      if(!this.isBlank(taxEffectiveDay)) {
        var tax = this.taxes.filter(me => me.effectiveDay <= taxEffectiveDay).sort((a,b) => String(b.effectiveDay).localeCompare(a.effectiveDay))[0];
        this.taxRate = tax.taxRate;
      }
      // 支払種別
      let lst = this.payTypes.filter(me => me.paymentCode === detail.paymentCode && me.taxFlg === "1");
      
      // 支払種別が課税対象の場合
      if(lst.length > 0) {
        // 支払金額(税抜)=支払金額(税込)÷(1+消費税率)
        detail.payPrice = Math.ceil(payPriceTax / (1 + this.taxRate / 100));
        // 消費税=支払金額(税込)-支払金額(税抜)
        detail.payTax = payPriceTax - detail.payPrice;
      }
    }
    else
    {
      detail.payPrice = null;
      detail.payTax = null;
    }
    detail.payPriceMap = this.numberFormat(detail.payPrice);
    detail.payTaxMap = this.numberFormat(detail.payTax);
  }
  // 20200921 E_Update

  // 20200921 S_Delete
  /*
  taxOnlyCalc(event, detail: Paycontractdetailinfo) {
    
    detail.payPrice = this.getNumber(this.removeComma(detail.payPriceMap));
    detail.payPriceTax = this.getNumber(this.removeComma(detail.payPriceTaxMap));
    if(detail.payPrice >= 0 && detail.payPriceTax >= 0) {
      detail.payTax = detail.payPriceTax - detail.payPrice;
      detail.payTaxMap = this.numberFormat(detail.payTax);
    }
  }
  */
  // 20200921 S_Delete

  /**20200714 S_Add
   * 税額を自動計算する
  
  taxCalc(detail: Paycontractdetailinfo){
    
    this.paycontract.taxEffectiveDay = this.paycontract.taxEffectiveDayMap != null ? this.datepipe.transform(this.paycontract.taxEffectiveDayMap, 'yyyyMMdd') : null;
    this.removeComma(detail.payPriceMap);
    this.removeComma(detail.payPriceTaxMap);
    this.removeComma(detail.payTaxMap);
    
    if (!isNullOrUndefined(detail.payPriceMap)) {
      this.taxRate = 0;
      if(!this.isBlank(this.paycontract.taxEffectiveDay)) {
        var taxtData =this.taxes.filter(me => me.effectiveDay <= this.paycontract.taxEffectiveDay).sort((a,b) => String(b.effectiveDay).localeCompare(a.effectiveDay))[0];
        this.taxRate = taxtData.taxRate;
      }             

      let lst = this.payTypes.filter(me => me.paymentCode === detail.paymentCode && me.taxFlg === "1");
      //taxFlgが1ではない場合
      if(lst.length == 0) {

        detail.payPriceTaxMap = detail.payPriceMap;
      }
      else {
        const val = (this.getNumber(detail.payPriceMap)) + (Math.floor(this.getNumber(detail.payPriceMap) * (this.taxRate / 100)));
        detail.payPriceTaxMap = this.numberFormat(val); 
        return detail.payPriceTaxMap;              
      }
      this.removeComma(detail.payPriceTaxMap);      
      const val = (this.getNumber(detail.payPriceTaxMap)  - this.getNumber(detail.payPriceMap));
      detail.payTaxMap = this.numberFormat(val);
      return detail.payTaxMap;
      
    }
    else
    {
      detail.payPriceTaxMap = null;
      detail.payTaxMap = null;
    }
  }
  

  taxOnlyCalc(event, detail: Paycontractdetailinfo) {
    this.removeComma(detail.payPriceMap);
    this.removeComma(detail.payPriceTaxMap);
    this.removeComma(detail.payTaxMap);
    if(!isNullOrUndefined(detail.payPriceMap) && !isNullOrUndefined(detail.payPriceTaxMap)) {
      const val = this.getNumber(detail.payPriceTaxMap)  - this.getNumber(detail.payPriceMap);
      detail.payTaxMap = this.numberFormat(val);
      return detail.payTaxMap;
    }    
  }
  //20200714 E_Add*/

  changeTaxEffectiveDay(event) {
    this.paycontract.details.forEach(detail => {
      this.taxCalc(detail);
    });
  }
}