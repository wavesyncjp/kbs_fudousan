import { Component, OnInit } from '@angular/core';
import { InfoDetailComponent } from '../info-detail/info-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog } from '@angular/material';
import { BaseComponent } from '../BaseComponent';
import { Code } from '../models/bukken';
import { Router } from '@angular/router';
import { Information } from '../models/information';

@Component({
  selector: 'app-info-list',
  templateUrl: './info-list.component.html',
  styleUrls: ['./info-list.component.css']
})
export class InfoListComponent extends BaseComponent {

  constructor(public router: Router,
              public dialog: MatDialog,
              public service: BackendService) {
    super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('インフォメーション');
    const funcs = [];
    funcs.push(this.service.getCodes(['005']));

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
    });
  }
  createNew() {
    const dialogRef = this.dialog.open(InfoDetailComponent, {
      width: '60%',
      height: '500px',
      data: new Information()
    });
  }
}

  

