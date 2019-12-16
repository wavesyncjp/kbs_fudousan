import { Component, OnInit, Inject } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Contractinfo } from '../models/contractinfo';
import { Code } from '../models/bukken';
import { Templandinfo } from '../models/templandinfo';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Dialog } from '../models/dialog';
import { MatDialog } from '@angular/material';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { Locationinfo } from '../models/locationinfo';

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.css']
})
export class ContractDetailComponent extends BaseComponent {

  public contract: Contractinfo;
  public data: Templandinfo;
  public pid: number;
  public bukkenid: number;

  constructor(public router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              public service: BackendService) {
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
    this.contract = new Contractinfo();

    const funcs = [];
    funcs.push(this.service.getCodes(['004', '006', '007', '008', '009']));
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

      // 物件あり場合
      if ( values.length > 1) {
        if (this.pid > 0) {
          this.contract = new Contractinfo(values[1] as Contractinfo);
          this.data = values[1].land;
        } else {
          this.data = new Templandinfo(values[1] as Templandinfo);
        }
      }

    });
  }

  save() {
    if (!this.validate()) {
      return;
    }
    const dlg = new Dialog({title: '確認', message: '契約情報を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {width: '500px', height: '250px', data: dlg});

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.contract.tempLandInfoPid = this.data.pid;
        this.contract.convertForSave(this.service.loginUser.userId);
        this.service.saveContract(this.contract).then(res => {

          const finishDlg = new Dialog({title: '完了', message: '契約情報を登録しました。'});
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(val => {
            this.contract = new Contractinfo(res);
            this.router.navigate(['/ctdetail'], {queryParams: {pid: this.contract.pid}});
          });

        });
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
    this.router.navigate(['/bukkens']);
  }
}
