import { Component, OnInit, Inject } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MatDialog, MAT_DATE_FORMATS } from '@angular/material';
import { BackendService } from '../backend.service';
import { JPDateAdapter } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { Checklib } from '../utils/checklib';
import { Templandinfo } from '../models/templandinfo';
import { Locationinfo } from '../models/locationinfo';
import { Stockcontractinfo } from '../models/stockcontractinfo';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Code } from '../models/bukken';

@Component({
  selector: 'app-bukken-detail',
  templateUrl: './bukken-detail.component.html',
  styleUrls: ['./bukken-detail.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
})
export class BukkenDetailComponent extends BaseComponent {
  public data: Templandinfo;
  public sysCodes = {};
  public deps = [];
  public emps = [];
  public errors: string[] = [];
  public pid: number;

  constructor(public router: Router,
              private route: ActivatedRoute,
              public service: BackendService,
              public dialog: MatDialog,
              private spinner: NgxSpinnerService) {
    super(router, service);

    this.route.queryParams.subscribe(params => {
      this.pid = params.pid;
    });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('土地情報詳細');
    this.spinner.show();

    const funcs = [];
    funcs.push(this.service.getCodes(null));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getEmps(null));
    if (this.pid > 0) {
      funcs.push(this.service.getLand(this.pid));
    }
    Promise.all(funcs).then(values => {

      // コード
      const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }

      // 部署
      this.deps = values[1];

      // 社員
      this.emps = values[2];

      // 物件あり場合
      if ( values.length > 3) {
        this.data = new Templandinfo(values[3] as Templandinfo);
        this.data.convert();
      } else {
        this.data = new Templandinfo();
      }

      // 物件位置情報
      if (!this.data.locations || this.data.locations.length === 0) {
        this.data.locations = [];

        const loc = new Locationinfo();
        loc.contract = new Stockcontractinfo();

        this.data.locations.push(loc);
      }

      setTimeout(() => {
        this.spinner.hide();
      }, 1000);

    });
  }

  /**
   * システムコード取得
   * @param code ：コード
   */
  getCode(code: string) {
    return this.sysCodes[code];
  }

  /**
   * 部署変換
   */
  getDeps() {
    if (this.deps) {
      return this.deps.map(dep => new Code({code: dep.depCode, name: dep.depName}));
    } else {
      return [];
    }
  }

  onNoClick(): void {
    // this.dialogRef.close();
  }

  addLocation(): void {
    const loc = new Locationinfo();
    loc.contract = new Stockcontractinfo();
    this.data.locations.push(loc);
  }

  removeLocation(): void {
    const dlg = new Dialog({title: '確認', message: '所在地情報情報を削除しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        if (this.data.locations.length > 1) {
          this.data.locations.pop();
        }
      }
    });
  }

  /**
   * 一覧へ戻る
   */
  backToList() {
    this.router.navigate(['/bukkens']);
  }

  /**
   * データ保存
   */
  save() {
    if (!this.validate()) {
      return;
    }

    const dlg = new Dialog({title: '確認', message: '土地情報を登録しますが、よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        // 土地情報登録
        this.data.convertForSave();
        this.service.saveLand(this.data).then(ret => {
          this.router.navigate(['/bukkens']);
        });
      }
    });

  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errors = [];

    if (Checklib.isBlank(this.data.bukkenName)) {
      this.errors.push('物件名は必須です。');
    }
    if (this.errors.length > 0) {
      return false;
    }
    return true;
  }

  /**
   * 契約トグル
   * @param loc：位置情報
   */
  switchContract(loc: Locationinfo) {
    loc.hasContract = !loc.hasContract;
  }

}
