import { Component, ViewChild } from '@angular/core';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { Router,ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';
import { Util } from '../utils/util';
import { CsvTemplateComponent } from '../csv-template/csv-template.component';
import { Code } from '../models/bukken';
import { Sorting } from '../models/sorting';
import { SortingDetailComponent } from '../sorting-detail/sorting-detail.component';

@Component({
  selector: 'app-sorting-list',
  templateUrl: './sorting-list.component.html',
  styleUrls: ['./sorting-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class SortingListComponent extends BaseComponent {
  public cond = {
    transactionDate: '',
    transactionDateMap:　'',
    contractType: '',
    paymentCode: '',
    creditorKanjyoCode: '',
    debtorKanjyoCode: '',
    bukkenNo: '',
    contractBukkenNo: '',
    bukkenName_Like: '' ,
    outPutFlg: ['0']
  };
  search = '0';
  searched = false;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['transactionDate', 'bukkenNo', 'contractBukkenNo', 'bukkenName', 'paymentCode', 'creditorKanjyoCode', 'debtorKanjyoCode', 'debtorTax', 'creditorTax', 'outPutFlg', 'outPutDate', 'detail', 'csvCheck'];
  dataSource = new MatTableDataSource<Sorting>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

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
  kanjyoCodes: Code[];

  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('会計連携用CSV出力');
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
    funcs.push(this.service.getCodes(['030','031']));
    funcs.push(this.service.getKanjyos(null));
    
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
      this.kanjyos = values[2];

      this.paymentTypes = this.getPaymentTypes();
      this.kanjyoCodes = this.getKanjyos();
    });

    if (this.search === '1') {
      this.searchSorting();
    }
  }

  /**
   * 検索条件リセット
   */
  resetCondition() {
    this.cond = {
      transactionDate: '',
      transactionDateMap:　'',
      contractType: '',
      paymentCode: '',
      creditorKanjyoCode: '',
      debtorKanjyoCode: '',
      bukkenNo: '',
      contractBukkenNo: '',
      bukkenName_Like: '' ,
      outPutFlg: ['0']
       };
  }

  /**
   * 検索
   */
  searchSorting() {
    this.spinner.show();
    this.cond.transactionDate = this.cond.transactionDateMap != null ? this.datepipe.transform(this.cond.transactionDateMap, 'yyyyMMdd') : null;
    this.service.searchSorting(this.cond).then(res => {
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
  * 詳細
  */
  showDetail(row: Sorting) {
    const dialogRef = this.dialog.open(SortingDetailComponent, {
      width: '1250px',
      height: '500px',
      data: row
    });
  }

  /**
   * CSV出力
   */
  csvExport(){
    let lst = this.dataSource.data.filter(me => me['select']).map(me => Number(me.pid));
    if(lst.length === 0) return;
    
    //テンプレート選択
    const dialogRef = this.dialog.open(CsvTemplateComponent, {
      width: '450px',
      height: '200px',
      data: {
        type: '05'
      }
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result && result['choose']) {
        this.spinner.show();
        this.service.exportCsv(lst, result['csvCode']).then(ret => {
          Util.stringToCSV(ret['data'], result['csvName']);
          this.service.setOutPutDate(lst, 'outPutFlg').then(res => {
            this.spinner.hide();
            this.searchSorting();
          });
        });
      }
    });
  }
}
