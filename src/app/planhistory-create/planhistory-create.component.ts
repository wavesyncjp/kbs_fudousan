import { Component, OnInit,ViewChild,Inject} from '@angular/core';
import { PlanDetailComponent } from '../Plan-detail/Plan-detail.component';
import { BackendService } from '../backend.service';
import { MatDialog, MatTableDataSource, MAT_DATE_LOCALE, DateAdapter,MatTabGroup,MatDialogRef,MAT_DIALOG_DATA } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseComponent } from '../BaseComponent';
import { MatSort } from '@angular/material/sort';
import { Code } from '../models/bukken';
import { DatePipe } from '@angular/common';
import { Planinfo } from '../models/planinfo';
import { Router,ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';
import { Planinfohistory } from '../models/Planinfohistory';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';


@Component({
  selector: 'app-planhistory-create',
  templateUrl: './planhistory-create.component.html',
  styleUrls: ['./planhistory-create.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
})

export class PlanHistoryCreateComponent extends BaseComponent {
  @ViewChild(MatTabGroup, {static: true}) tabGroup: MatTabGroup;
  public plan:any;// 20200818 Add
  constructor(
    public router: Router,
    private route: ActivatedRoute,// 20200818 Add
    public service: BackendService,
    public dialogRef: MatDialogRef<PlanHistoryCreateComponent>,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA)
    public data: Planinfohistory,
    public datepipe: DatePipe){
      super(router, service,dialog);
      // 20200818 S_Add
      this.route.queryParams.subscribe(params => {
        this.plan = params.plan;
      });
      // 20200818 E_Add
  }
//    public plan:Planinfo;// 20200818 Delete

    //public plan:Planinfo;

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    const funcs = [];
    funcs.push(this.service.getCodes(['016']));
    /*
        funcs.push(this.service.getCodeNameMsts(null));//getPlanHistory
        */
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

      //this.sysCodeNameMsts = values[0];

      if (this.plan != null) {
        this.data = this.plan;
        this.data.createHistoryDayMap = new Date();
      }
      /*
      if (this.data == null) {
        this.data = new Planinfohistory();
        //this.data.depCode = '1';
      } 
      */ 

    });
  }
  /**追記
   * バリデーション
   */
  validate(): boolean {
    this.errorMsgs = [];
    this.errors = {};
    this.checkBlank(this.data.planHistoryName, 'planHistoryName', 'プラン履歴名は必須です。');
    if (this.errorMsgs.length > 0) {
      return false;
    }
    return true;
  }
  ok() {
    if (!this.validate()) {
      return;
    }

    // 登録
    const dlgObj = new Dialog({title: '確認', message: '登録しますが、よろしいですか？'});
    const dlg = this.dialog.open(ConfirmDialogComponent, {width: '500px',　height: '250px',　data: dlgObj});

    dlg.afterClosed().subscribe(result => {
      if (dlgObj.choose) {
        this.data.convertForSave(this.service.loginUser.userId, this.datepipe);
        this.service.savePlanHistory(this.data).then(res => {

          const finishDlg = new Dialog({ title: '完了', message: '事業収支情報を登録しました。' });
          const dlgVal = this.dialog.open(FinishDialogComponent, {
            width: '500px',
            height: '250px',
            data: finishDlg
          });
          dlgVal.afterClosed().subscribe(val => {
            this.spinner.hide();
            this.router.navigate(['/plandetailhistory'], {queryParams: {pid: this.data.pid}});
          });
        });
      }
        this.dialogRef.close(true);  
    });
  }

  cancel() {
    this.dialogRef.close();
  }
  
  
}