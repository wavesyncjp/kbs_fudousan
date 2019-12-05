import { Component, OnInit, Inject } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Stockcontractinfo } from '../models/stockcontractinfo';
import { Code } from '../models/bukken';
import { Templandinfo } from '../models/templandinfo';
import { Locationinfo } from '../models/locationinfo';

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.css']
})
export class ContractDetailComponent extends BaseComponent {

  public contract: Stockcontractinfo;
  public data: Templandinfo;
  public pid: number;

  constructor(public router: Router,
              private route: ActivatedRoute,
              public service: BackendService) {
      super(router, service);
      this.route.queryParams.subscribe(params => {
        this.pid = params.pid;
      });

      this.data = new Templandinfo();
      this.data.locations = [];
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('契約情報詳細');
    this.contract = new Stockcontractinfo();

    const funcs = [];
    funcs.push(this.service.getCodes(['004', '006', '007']));
    funcs.push(this.service.getLand(this.pid));

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
        this.data = new Templandinfo(values[1] as Templandinfo);
      }

    });
  }

  /**
   * 一覧へ戻る
   */
  backToList() {
    this.router.navigate(['/bukkens']);
  }
}
