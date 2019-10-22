import { Component, OnInit, Inject } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material';
import { BackendService } from '../backend.service';
import { JPDateAdapter } from '../adapters/adapters';
import { Router } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { NgxSpinnerService } from 'ngx-spinner';
import { Checklib } from '../utils/checklib';
import { Templandinfo } from '../models/templandinfo';
import { Locationinfo } from '../models/locationinfo';

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
  public errors: string[] = [];

  constructor(public router: Router,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
    super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('土地情報詳細');
    this.spinner.show();

    // コード取得
    this.service.getCodes(null).then(codes => {
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
      }
    });

    if (!this.data) {
      this.data = new Templandinfo();
      this.data.bukkenNo = '99';
    }
    if (!this.data.locations || this.data.locations.length === 0) {
      this.data.locations = [];
      this.data.locations.push(new Locationinfo());
    }
  }

  /**
   * システムコード取得
   * @param code ：コード
   */
  getCode(code: string) {
    return this.sysCodes[code];
  }

  onNoClick(): void {
    // this.dialogRef.close();
  }

  addLocation(): void {
    this.data.locations.push(new Locationinfo());
  }

  removeLocation(): void {
    if (this.data.locations.length > 1) {
      this.data.locations.pop();
    }
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
  }

  /**
   * バリデーション
   */
  validate(): boolean {
    this.errors = [];

    if (Checklib.isBlank(this.data.bukkenName)) {
      this.errors.push('物件名は必須です。');
    }

    return false;
  }

}
