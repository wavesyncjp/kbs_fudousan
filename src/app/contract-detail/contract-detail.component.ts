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

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class ContractDetailComponent extends BaseComponent {

  @ViewChild('topElement', {static: true}) topElement: ElementRef;

  public contract: Contractinfo;
  public data: Templandinfo;
  public pid: number;
  public bukkenid: number;
  delSellers = [];

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
    this.service.changeTitle('契約情報詳細');

    const elementList = document.querySelectorAll('.detail-div');
    const element = elementList[0] as HTMLElement;
    element.scrollIntoView();

    this.spinner.show();
    this.contract = new Contractinfo();

    const funcs = [];
    funcs.push(this.service.getCodes(['002', '003', '004', '006', '007', '008', '009', '011', '012']));
    funcs.push(this.service.getEmps(null));
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
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }
      this.emps = values[1];

      // 物件あり場合
      if ( values.length > 1) {
        if (this.pid > 0) {
          this.contract = new Contractinfo(values[2] as Contractinfo);
          this.contract.convert();
          if (this.contract.sellers == null || this.contract.sellers.length === 0) {
            this.contract.sellers = [];
            this.contract.sellers.push(new ContractSellerInfo());
          }
          this.data = values[2].land;
        } else {
          this.data = new Templandinfo(values[2] as Templandinfo);
          this.contract = new Contractinfo();
          this.contract.sellers = [];
          this.contract.sellers.push(new ContractSellerInfo());
        }
        this.convertData();
      }

      this.spinner.hide();

    });
  }

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
      } else {
        newLoc.contractDetail = new Contractdetailinfo();
      }
      locs.push(newLoc);
    });
    this.data.locations = locs;
  }

  /**
   * 登録
   */
  save() {
    if (!this.validate()) {
      return;
    }
    const dlg = new Dialog({title: '確認', message: '契約情報を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {

        this.spinner.show();

        this.contract.tempLandInfoPid = this.data.pid;
        this.convertForSave(); // 契約詳細⊕不可分データ準備
        this.contract.convertForSave(this.service.loginUser.userId, this.datepipe);
        this.service.saveContract(this.contract).then(res => {

          const finishDlg = new Dialog({title: '完了', message: '契約情報を登録しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(val => {
            this.spinner.hide();
            this.contract = new Contractinfo(res);
            this.convertData();
            this.contract.convert();
            this.router.navigate(['/ctdetail'], {queryParams: {pid: this.contract.pid}});
          });

        });
      }
    });

  }

  /**
   * 登録の為の変換
   */
  convertForSave() {
    const addList = [];
    const types = ['01', '02', '03'];
    this.data.locations.forEach(loc => {
      const detailList = this.contract.details.filter(detail => detail.locationInfoPid === loc.pid);

      // 削除
      if (detailList.length > 0) {
        if (types.indexOf(loc.contractDetail.contractDataType) < 0) {
          detailList[0].deleteUserId = this.service.loginUser.userId;
        } else {
          detailList[0] = loc.contractDetail;
        }
      } else {
        if (types.indexOf(loc.contractDetail.contractDataType) >= 0) {
          loc.contractDetail.locationInfoPid = loc.pid;
          addList.push(loc.contractDetail);
        }
      }
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
  }

  /**
   * チェック
   * @param event チェックイベント
   * @param item ：所有地
   * @param flg ：チェックフラグ
   */
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
    this.router.navigate(['/contracts'], {queryParams: {search: '1'}});
  }

  /**
   * 物件情報遷移
   */
  toBukken() {
    this.router.navigate(['/bkdetail'], {queryParams: {pid: this.data.pid}});
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

    const dlg = new Dialog({title: '確認', message: 'ファイルを削除しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px',　height: '250px',　data: dlg});

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
   */
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
  }
}
