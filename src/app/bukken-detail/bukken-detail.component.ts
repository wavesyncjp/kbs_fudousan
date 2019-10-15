import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter, MAT_DATE_LOCALE } from '@angular/material';
import { Bukken, BukkenDescription } from '../models/bukken';
import { BackendService } from '../backend.service';
import { JPDateAdapter } from '../adapters/adapters';
import { Router } from '@angular/router';
import { BaseComponent } from '../BaseComponent';

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
  public data: Bukken;

  constructor(public router: Router,
              public service: BackendService) {
    super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('土地情報詳細');
    if (!this.data) {
      this.data = new Bukken();
    }
    if (!this.data.descriptions || this.data.descriptions.length === 0) {
      this.data.descriptions = [];
      this.data.descriptions.push(new BukkenDescription());
    }
  }

  onNoClick(): void {
    // this.dialogRef.close();
  }

  addDescription(): void {
    this.data.descriptions.push(new BukkenDescription());
  }

  backToList() {
    this.router.navigate(['/bukkens']);
  }
}
