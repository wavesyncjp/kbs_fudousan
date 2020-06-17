import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
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
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
    //funcs.push(this.service.getLands(null));   // 物件情報一覧の取得
    funcs.push(this.service.getTaxes(null));   // 消費税一覧の取得

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
      //this.lands = values[4];
      this.taxes = values[4];

      //入力の際に表示される物件名称を取得するための処理
      //this.bukkens = this.lands
      
      // データが存在する場合
      if ( values.length > 5) {
        if (this.pid > 0) {
          this.paycontract = new Paycontractinfo(values[5] as Paycontractinfo);
          this.paycontract.convert();
          this.bukkenName = values[5].land.bukkenName;

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
      if(this.lands != null) {
        this.lands.forEach((land) => {
          this.bukkenMap[land.bukkenName] = land.pid
        });
      }
      

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
    if(this.bukkenName == null || this.bukkenName.length < 1) return;

    this.service.getLands(this.bukkenName).then(ret => {
      this.lands = ret;
      this.bukkens = this.lands;

      this.lands.forEach((land) => {
        this.bukkenMap[land.bukkenName] = land.pid
      });
      
      const lst = this.lands.filter(land => land.bukkenName === this.bukkenName);
      if(lst.length === 1) {
        this.loadSellers(this.bukkenMap[this.bukkenName]);
      }
      else {
        this.sellers = [];
      }

    }).then(e => {
    });

    //this.bukkens = this.lands.filter(land => land.bukkenName.includes(this.bukkenName));
  }

  /**
   * 税額を自動計算する
   */
  taxCalc(detail: Paycontractdetailinfo){
    
    this.paycontract.taxEffectiveDay = this.paycontract.taxEffectiveDayMap != null ? this.datepipe.transform(this.paycontract.taxEffectiveDayMap, 'yyyyMMdd') : null;
    if (detail.payPrice > 0) {
      this.taxRate = 0;
      if(!this.isBlank(this.paycontract.taxEffectiveDay)) {
        var taxtData =this.taxes.filter(me => me.effectiveDay <= this.paycontract.taxEffectiveDay).sort((a,b) => String(b.effectiveDay).localeCompare(a.effectiveDay))[0];
        this.taxRate = taxtData.taxRate;
      }             

      let lst = this.payTypes.filter(me => me.paymentCode === detail.paymentCode && me.taxFlg === "1");
      //taxFlgが1ではない場合
      if(lst.length == 0) {
        detail.payPriceTax = detail.payPrice;
      }
      else {
        detail.payPriceTax = Number(detail.payPrice) + Number(Math.floor(detail.payPrice * (this.taxRate / 100)));              
      }      
      detail.payTax = detail.payPriceTax  - detail.payPrice;
      
    }
    else
    {
      detail.payPriceTax = null;
      detail.payTax = null;
    }
  }

  taxOnlyCalc(event, detail: Paycontractdetailinfo) {
    if(detail.payPrice >= 0 && detail.payPriceTax >= 0) {
      detail.payTax = detail.payPriceTax  - detail.payPrice;
    }    
  }

  changeTaxEffectiveDay(event) {
    this.paycontract.details.forEach(detail => {
      this.taxCalc(detail);
    });
  }
}