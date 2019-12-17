import { Component, OnInit, Inject } from '@angular/core';
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
import { Locationinfo, ContractData } from '../models/locationinfo';
import { NgxSpinnerService } from 'ngx-spinner';
import { Contractdetailinfo } from '../models/contractdetailinfo';
import { Contractdependinfo } from '../models/contractdependinfo';
import { DatePipe } from '@angular/common';
import { JPDateAdapter } from '../adapters/adapters';

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

  public contract: Contractinfo;
  public data: Templandinfo;
  public otherLocs: string[] = [];
  public pid: number;
  public bukkenid: number;

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
    this.spinner.show();
    this.contract = new Contractinfo();

    const funcs = [];
    funcs.push(this.service.getCodes(['004', '006', '007', '008', '009']));
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
          this.data = values[2].land;
        } else {
          this.data = new Templandinfo(values[2] as Templandinfo);
          this.contract = new Contractinfo();
        }
        this.convertData();

        // 他契約の契約詳細
        this.service.getContractByLand(this.data.pid).then(res => {

          const ids = this.contract.details.map(data => data.locationInfoPid);
          this.otherLocs = res.filter(pid => !ids.includes(pid as unknown as number));
          console.log(this.otherLocs);

          setTimeout(() => {
            this.spinner.hide();
          }, 200);
        });

      }

    });
  }

  /**
   * 契約情報＋所有地マージ
   */
  convertData() {

    const locs = [];
    this.data.locations.forEach(loc => {
      const newLoc = new Locationinfo(loc as Locationinfo);
      newLoc.contractData = new ContractData();
      locs.push(newLoc);
    });
    this.data.locations = locs;

    this.data.locations.forEach(loc => {
      // 契約詳細情報
      if (this.contract.details !== undefined && this.contract.details.length > 0) {
        const lst = this.contract.details.filter(dt => dt.locationInfoPid === loc.pid);
        if (lst.length > 0) {
          loc.copyContracDetail(lst[0]);
        }
      }
      // 契約不可分
      if (this.contract.depends !== undefined && this.contract.depends.length > 0) {
        const lst = this.contract.depends.filter(dt => dt.locationInfoPid === loc.pid);
        if (lst.length > 0) {
          loc.copyContracDepend(lst[0]);
        }
      }

    });
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
            this.contract = new Contractinfo(res);
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
    this.data.locations.forEach(loc => {
      const detailList = this.contract.details.filter(detail => detail.locationInfoPid === loc.pid);
      const dependList = this.contract.depends.filter(depend => depend.locationInfoPid === loc.pid);

      if (!(loc.isContract || loc.isDepend)) {
        // 契約削除
        if (detailList.length > 0) {
          detailList[0].deleteUserId = this.service.loginUser.userId;
        }

        // 不可分削除
        if (dependList.length > 0) {
          dependList[0].deleteUserId = this.service.loginUser.userId;
        }
      }
      // 契約選択
      // tslint:disable-next-line:one-line
      else if (loc.isContract) {
        // 契約更新
        if (detailList.length > 0) {
          loc.copyContracDetailForSave(detailList[0]);
        }
        // 新規登録
        // tslint:disable-next-line:one-line
        else {
          const data = new Contractdetailinfo();
          loc.copyContracDetailForSave(data);
          this.contract.details.push(data);
        }

        // 不可分削除
        if (dependList.length > 0) {
          dependList[0].deleteUserId = this.service.loginUser.userId;
        }
      }
      // 不可分選択
      // tslint:disable-next-line:one-line
      else {
        // 契約削除
        if (detailList.length > 0) {
          detailList[0].deleteUserId = this.service.loginUser.userId;
        }

        // 不可分更新
        if (dependList.length > 0) {
          loc.copyContracDependForSave(dependList[0]);
        }
        // 不可分新規登録
        // tslint:disable-next-line:one-line
        else {
          const data = new Contractdependinfo();
          loc.copyContracDependForSave(data);
          this.contract.depends.push(data);
        }
      }

    });
  }

  change(item: Locationinfo, isContract) {
    if (isContract) {
      item.isDepend = false;
    } else {
      item.isContract = false;
    }
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};

    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * 一覧へ戻る
   */
  backToList() {
    this.router.navigate(['/bkdetail'], {queryParams: {pid: this.data.pid}});
  }
}
