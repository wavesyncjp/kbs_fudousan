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

  templates: any[];
  list: any[];
  selectTemplate: string;

  constructor(public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<CsvTemplateComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any) { 
      super(router, service);
    }

  ngOnInit() {
    this.loadTemplate();
  }

  loadTemplate() {    
    this.service.loadCsvTemplate(this.data).then(ret => {
      this.templates = ret;
      this.list = ret.map(me => {return  {codeDetail: me['csvCode'], name: me['csvName']} });      
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
