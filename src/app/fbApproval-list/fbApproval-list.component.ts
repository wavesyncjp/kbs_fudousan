import { Component, ViewChild } from '@angular/core';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter, MatCheckbox} from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { Router,ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';
import { Code } from '../models/bukken';
import { Paycontractdetailinfo } from '../models/paycontractdetailinfo';

@Component({
  selector: 'app-fbApproval-list',
  templateUrl: './fbApproval-list.component.html',
  styleUrls: ['./fbApproval-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class FbApprovalListComponent extends BaseComponent {
  public cond = {
    contractDay: '',
    contractDayMap:　'',
    supplierName_Like: '',
    paymentCode: '',
    bukkenNo: '',
    contractBukkenNo: '',
    bukkenName_Like: '' ,
    fbApprovalFlg: ['0'],
  };
  search = '0';
  searched = false;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['contractDay', 'bukkenNo', 'contractBukkenNo', 'bukkenName', 'supplierName', 'paymentCode', 'payPriceTax', 'fbApprovalFlg', 'fbApprovalCheck'];
  dataSource = new MatTableDataSource<Paycontractdetailinfo>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild('cbxFinishFlg', {static: true})
  cbxFinishFlg: MatCheckbox;
  constructor(public router: Router,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              private route: ActivatedRoute,
              public service: BackendService,
              private spinner: NgxSpinnerService) {
    super(router, service,dialog);
    this.route.queryParams.subscribe(params => {
      this.search = params.search;
    });
  }

  paymentTypes: Code[];
  Codes: Code[];

  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('FB連携承認');
    this.dataSource.paginator = this.paginator;

    if (this.search === '1') {
      this.cond = this.service.searchCondition;
      if(this.cond == null) {
        this.resetCondition();
      }
    }

    const funcs = [];
    // 20241024 S_Update
    // funcs.push(this.service.searchPaymentType({payContractEntryFlg: '1'}));
    funcs.push(this.service.searchPaymentType({isAllData: '1'}));
    // 20241024 E_Update
    funcs.push(this.service.getCodes(['032']));

    Promise.all(funcs).then(values => {
      const codes = values[1] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }
      this.payTypes = values[0];
      this.paymentTypes = this.getPaymentTypes();
    });

    if (this.search === '1') {
      this.searchFb();
    }
  }

  /**
   * 検索条件リセット
   */
  resetCondition() {
    this.cond = {
      contractDay: '',
      contractDayMap:　'',
      supplierName_Like: '',
      paymentCode: '',
      bukkenNo: '',
      contractBukkenNo: '',
      bukkenName_Like: '' ,
      fbApprovalFlg: ['1'],
     };
  }

  /**
   * 検索
   */
  searchFb() {
    this.spinner.show();
    this.cond.contractDay = this.cond.contractDayMap != null ? this.datepipe.transform(this.cond.contractDayMap, 'yyyyMMdd') : "";
    this.service.searchFb(this.cond).then(res => {
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      this.searched = true;
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }

  /**
   * 承認
   */
  fbApproval() {
    let lst = this.dataSource.data.filter(me => me['select']).map(me => Number(me.pid));
    if(lst.length === 0) return;

    const dlg = new Dialog({title: '確認', message: '承認します。よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.service.fbApproval(lst).then(res => {
          this.searchFb();
        });
      }
    });
  }
}
