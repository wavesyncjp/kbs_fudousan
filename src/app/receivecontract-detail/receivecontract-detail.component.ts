import { Component, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
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
import { Receivecontractinfo } from '../models/receivecontractinfo';
import { Receivecontractdetailinfo } from '../models/receivecontractdetailinfo';
import { MultiSelectComponent } from 'ng-multiselect-dropdown';

declare var $: any;

@Component({
  selector: 'app-receivecontract-detail',
  templateUrl: './receivecontract-detail.component.html',
  styleUrls: ['./receivecontract-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class ReceiveContractDetailComponent extends BaseComponent {

  @ViewChild('topElement', {static: true}) topElement: ElementRef;

  @ViewChildren(MultiSelectComponent) selectors: QueryList<MultiSelectComponent>;

  public authority: string = '';
  public receivecontract: Receivecontractinfo;
  public receivecontractdetail: Receivecontractdetailinfo;
  public data: Templandinfo;
  public pid: number;
  public bukkenid: number;
  delDetails = [];
  bukkens = [];
  bukkenMap: { [key: string]: number; } = {};
  public bukkenName : string;
  public receiveTax : number;
  maxDate : number;
  taxRate : number;
  taxEffectiveDay : String;
  effectiveDay : String;

  sellers: Code[];

  dropdownSettings = {
    singleSelection: false,
    idField: 'codeDetail',
    textField: 'name',
    searchPlaceholderText: '検索',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    enableCheckAll: false
  };

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
      this.receivecontract = new Receivecontractinfo();
      this.receivecontract.taxEffectiveDayMap = new Date();
  }

  userIds: Code[];
  depCodes: Code[];
  receiveTypes: Code[];

  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('入金管理詳細');
    this.authority = this.service.loginUser.authority;

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();

    const funcs = [];
    funcs.push(this.service.getCodes(['015']));
    funcs.push(this.service.getEmps('1'));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.searchReceiveType(null));
    funcs.push(this.service.getLands(null));   // 物件情報一覧の取得
    funcs.push(this.service.getTaxes(null));   // 消費税一覧の取得

    if (this.bukkenid > 0) {
      funcs.push(this.service.getLand(this.bukkenid));
    }
    else if (this.pid > 0) {
      funcs.push(this.service.getReceiveContract(this.pid));
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
      this.recTypes = values[3];
      this.lands = values[4];
      this.taxes = values[5];

      this.userIds = this.getUsers();
      this.depCodes = this.getDeps();
      this.receiveTypes = this.getReceiveTypes();

      //入力の際に表示される物件名称を取得するための処理
      this.bukkens = this.lands
      
      // データが存在する場合
      if ( values.length > 6) {
        if (this.pid > 0) {
          this.receivecontract = new Receivecontractinfo(values[6] as Receivecontractinfo);
          this.receivecontract.convert();
          this.bukkenName = `${values[6].land.bukkenNo}:${values[6].land.bukkenName}`;

          this.initReceiveContract();

          //Seller
          this.loadSellers(this.receivecontract.tempLandInfoPid);
        }
        else if(this.bukkenid > 0) {
          const templandinfo = new Templandinfo(values[6] as Templandinfo);
          this.bukkenName = templandinfo.bukkenNo + ':' + templandinfo.bukkenName;
          this.receivecontract.depCode = templandinfo.department;
          var infoStaffs = templandinfo.infoStaff.split(",");
          this.receivecontract.userId = this.getNumber(infoStaffs[0]);

          this.initReceiveContract();

          //Seller
          this.loadSellers(templandinfo.pid);
        }
        else {
          this.initReceiveContract();
          this.spinner.hide();
        }
      }
      else {
        this.initReceiveContract();
        this.spinner.hide();
      }
      
      //物件名称をキーにpidをmapに保持していく
      this.lands.forEach((land) => {
        this.bukkenMap[land.bukkenNo + ':' + land.bukkenName] = land.pid
      });
    });
  }

  /**
   * 契約情報を初期化
   */
  initReceiveContract() {
    //明細情報が存在しない場合
    if (this.receivecontract.details == null || this.receivecontract.details.length == 0) {
      this.receivecontract.details = [];
      this.receivecontract.details.push(new Receivecontractdetailinfo());
    }
  }

  loadSellers(landId: number) {
    this.service.getBukkenSeller(landId).then(ret => {

      const ids = ret.map(data => data.contractInfoPid).filter((id, i, arr) => arr.indexOf(id) === i);
      let lst : Code[] = [];

      ids.forEach(id => {
        const rt = ret.filter(data => data.contractInfoPid === id && data.contractorName != null && data.contractorName !== '').map(data => {return  { id: data.pid, name: data.contractorName} });
        if(rt.length > 0) {
          lst.push(new Code({codeDetail: rt.map(cd => cd.id).join('_'), name: rt.map(cd => cd.name).join(',') }))
        }
      });

      this.sellers = lst;
      //契約者反映
      let ctDetails = [];
      this.receivecontract.details.forEach(me => {
        ctDetails.push(new Receivecontractdetailinfo(me));
      });
      this.receivecontract.details = ctDetails;
      this.convertContractor()
      this.resetBinding();

      this.spinner.hide();
    });
  }

  /**
   * 契約者反映
   */
  convertContractor() {
    this.receivecontract.details.forEach(me => {
      if(me.contractorMap != null && me.contractorMap.length > 0) {

        let lst = [];

        me.contractorMap.forEach(ct => {
          const names = this.sellers.filter(sl => sl.codeDetail === ct.codeDetail).map(ct => ct.name);
          if(names.length > 0) {
            lst.push(new Code({codeDetail: ct.codeDetail, name: names[0]}));
          }
        });
        me.contractorMap = lst;
      }
    });
  }

  /**
   * 明細情報追加
   */
  addReceiveContractDetail() {
    if (this.receivecontract.details == null) {
      this.receivecontract.details = [];
    }
    this.receivecontract.details.push(new Receivecontractdetailinfo());

    this.resetBinding();
  }

  /**
   * 契約者のデータ再バインディング
   */
  resetBinding() {
    window.setTimeout(() => {
      this.selectors.forEach(element => {
        element.settings = this.dropdownSettings;
        element.data = this.sellers;
      });
    }, 500); 
  }

  /**
   * 明細情報削除
   */
  deleteReceiveContractDetail(sharerPos: number) {
    const detail = this.receivecontract.details[sharerPos+1];
    if (detail.pid > 0) {
      if (this.delDetails == null) {
        this.delDetails = [];
      }
      this.delDetails.push(detail);
    }
    this.receivecontract.details.splice(sharerPos+1, 1);
  }

  /**
   * 登録
   */
  save() {
    if (!this.validate()) {
       return;
    }
    const dlg = new Dialog({title: '確認', message: '入金管理情報を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {

        this.spinner.show();

        this.convertForSave();
        this.receivecontract.convertForSave(this.service.loginUser.userId, this.datepipe);   //saveのために日付型のconvertを行う
        this.service.saveReceiveContract(this.receivecontract).then(res => {

          const finishDlg = new Dialog({title: '完了', message: '入金管理情報を登録しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(val => {
            this.spinner.hide();
            this.receivecontract = new Receivecontractinfo(res);
            this.receivecontract.convert();
            this.convertContractor();
            this.resetBinding();
            this.router.navigate(['/receivedetail'], {queryParams: {pid: this.receivecontract.pid}});
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
        this.receivecontract.details.push(del);
      });
    }

    //入力された物件名称から物件pid
    this.receivecontract.tempLandInfoPid = this.bukkenMap[this.bukkenName];
    if (this.receivecontract.tempLandInfoPid == null || this.receivecontract.tempLandInfoPid == 0) {
      this.receivecontract.tempLandInfoPid = null
    }
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    if (this.bukkenName != null && this.bukkenName.length != 0) {
      if (this.bukkenMap[this.bukkenName] == null || this.bukkenMap[this.bukkenName] == 0) {
        this.errorMsgs.push('物件名称がマスタに登録されていません。マスタへの登録を行ってください。');
      }
    }

    this.receivecontract.details.forEach((detail, pos) => {
      if( detail.receiveCode == null　|| detail.receiveCode.length == 0 ) {
        this.errorMsgs.push('入金種別は必須入力の項目です。');
        this.errors['detail.receiveCode_' + pos] = true;
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
    this.router.navigate(['/receives'], {queryParams: {search: '1'}});
  }

  /**
   * 入力の度に物件を検索する
   */
  bukkenSearch() {
    this.bukkens = this.lands.filter(land => `${land.bukkenNo}:${land.bukkenName}`.includes(this.bukkenName));
    const lst = this.lands.filter(land => `${land.bukkenNo}:${land.bukkenName}` === this.bukkenName);
    if(lst.length === 1) {
      this.loadSellers(this.bukkenMap[this.bukkenName]);
      this.receivecontract.tempLandInfoPid = this.bukkenMap[this.bukkenName];
    }
    else {
      this.sellers = [];
      if(this.receivecontract != null && this.receivecontract.details.length > 0) {
        this.receivecontract.details.forEach(me => {
          me.contractor = '';
        });
      }
      this.receivecontract.tempLandInfoPid = 0;
    }

    //物件名削除⇒契約者リセット
    if(this.isBlank(this.bukkenName)) {
      this.receivecontract.details.forEach(me => me.contractorMap = []);
    }

  }
  //数値にカンマを付ける作業
  changeValue(val) {
    val = this.numberFormat(val);
    return val;
  }

  taxCalc(detail: Receivecontractdetailinfo){

    let receivePriceTax = this.getNumber(this.removeComma(detail.receivePriceTaxMap));
    let taxEffectiveDay = this.receivecontract.taxEffectiveDayMap != null ? this.datepipe.transform(this.receivecontract.taxEffectiveDayMap, 'yyyyMMdd') : null;

    if (receivePriceTax > 0) {
      // 入金金額(税抜)<-入金金額(税込)
      detail.receivePrice = receivePriceTax;
      detail.receiveTax = 0;

      // 税率
      this.taxRate = 0;
      if(!this.isBlank(taxEffectiveDay)) {
        var tax = this.taxes.filter(me => me.effectiveDay <= taxEffectiveDay).sort((a,b) => String(b.effectiveDay).localeCompare(a.effectiveDay))[0];
        this.taxRate = tax.taxRate;
      }
      // 入金種別
      let lst = this.recTypes.filter(me => me.receiveCode === detail.receiveCode);

      // 入金種別が課税対象の場合
      if(lst.length > 0) {
        // 入金金額(税抜)=入金金額(税込)÷(1+消費税率)
        detail.receivePrice = Math.ceil(receivePriceTax / (1 + this.taxRate / 100));
        // 消費税=入金金額(税込)-入金金額(税抜)
        detail.receiveTax = receivePriceTax - detail.receivePrice;
      }
    }
    else
    {
      detail.receivePrice = null;
      detail.receiveTax = null;
    }
    detail.receivePriceMap = this.numberFormat(detail.receivePrice);
    detail.receiveTaxMap = this.numberFormat(detail.receiveTax);
  }

  changeTaxEffectiveDay(event) {
    this.receivecontract.details.forEach(detail => {
      this.taxCalc(detail);
    });
  }

  contractorClick(event) {
    let pr = $(event.target).closest('div.multiselect-dropdown');
    let lst = pr.find('div.dropdown-list');
    lst.css({left: pr.offset().left + 10, top: pr.offset().top + 20});
  }
}
