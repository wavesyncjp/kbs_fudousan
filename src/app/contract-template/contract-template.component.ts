import { Component, OnInit, Inject } from '@angular/core';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-contract-template',
  templateUrl: './contract-template.component.html',
  styleUrls: ['./contract-template.component.css']
})
export class ContractTemplateComponent extends BaseComponent {

  templates: any[];
  list: any[];
  selectTemplate: string;

  constructor(public router: Router,
              public service: BackendService,
              public dialogRef: MatDialogRef<ContractTemplateComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any) { 
      super(router, service);
    }

  ngOnInit() {
    this.loadTemplate();
  }

  loadTemplate() {    
    this.service.loadContractTemplate(this.data).then(ret => {
      this.templates = ret;
      this.list = ret.map(me => {return  {codeDetail: me['reportFormName'], name: me['displayName']} });      
    });
  }

  ok() {
    if(this.isBlank(this.selectTemplate)) {
      return;
    }
    const me = this.templates.filter(me => me['reportFormName'] === this.selectTemplate)[0];
    this.dialogRef.close({choose: true, templatePid: me['pid'], fileName: me['fileName']});
  }

  cancel() {
    this.dialogRef.close();
  }

}
