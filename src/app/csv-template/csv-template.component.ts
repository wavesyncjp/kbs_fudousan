import { Component, OnInit, Inject } from '@angular/core';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-csv-template',
  templateUrl: './csv-template.component.html',
  styleUrls: ['./csv-template.component.css']
})
export class CsvTemplateComponent extends BaseComponent {
  authority = '';
  templates: any[];
  list: any[];
  selectTemplate: string;

  constructor(public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<CsvTemplateComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any) { 
      super(router, service,dialog);
    }

  ngOnInit() {
    this.authority = this.service.loginUser.authority;
    this.loadTemplate();
  }

  loadTemplate() {
    this.service.loadCsvTemplate(this.data).then(ret => {
      this.templates = ret;
      if(this.authority !== '03') {
        this.list = ret.map(me => {return  {codeDetail: me['csvCode'], name: me['csvName']} });
      }
      //営業権限の場合
      else {
        // 20210106 S_Update
        /*this.list = ret.filter(me => me['csvCode'] !== '0104').map(me => {return {codeDetail: me['csvCode'], name: me['csvName']} });*/
        this.list = ret.filter(me => me['csvCode'] !== '0104' && me['csvCode'] !== '0105').map(me => {return {codeDetail: me['csvCode'], name: me['csvName']} });
        // 20210106 E_Update
      }
    });
  }

  ok() {
    if(this.isBlank(this.selectTemplate)) {
      return;
    }
    const me = this.templates.filter(me => me['csvCode'] === this.selectTemplate)[0];
    this.dialogRef.close({choose: true, csvCode: me['csvCode'], csvName: me['csvName']});
  }

  cancel() {
    this.dialogRef.close();
  }

}
