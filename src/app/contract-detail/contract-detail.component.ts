import { Component, OnInit, Inject } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Stockcontractinfo } from '../models/stockcontractinfo';

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.css']
})
export class ContractDetailComponent extends BaseComponent {

  public contract: Stockcontractinfo;

  constructor(public router: Router,
              public service: BackendService) {
      super(router, service);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('契約情報詳細');
    this.contract = new Stockcontractinfo();
  }
}
