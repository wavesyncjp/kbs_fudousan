import { Component, ViewChild, ViewEncapsulation, NgZone } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter, MatCheckbox } from '@angular/material';
import { DatePipe } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { BackendService } from '../backend.service';
import { Dialog } from '../models/dialog';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { FinishDialogComponent } from '../dialog/finish-dialog/finish-dialog.component';
import { ErrorDialogComponent } from '../dialog/error-dialog/error-dialog.component';
import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';
import { BaseComponent } from '../BaseComponent';
import { Templandinfo } from '../models/templandinfo';
import { Code } from '../models/bukken';

@Component({
  selector: 'app-bukken-update',
  templateUrl: './bukken-update.component.html',
  styleUrls: ['./bukken-update.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
  encapsulation: ViewEncapsulation.None
})
export class BukkenUpdateComponent extends BaseComponent {

  depCodes: Code[];

  // 検索条件
  public cond = {
    department: [],
    clctInfoStaff: [],
    clctInfoStaffMap: [],
    notStaffChk: '',
    bukkenNo: '',
    bukkenName: '',
    residence: '',
    contractBukkenNo_Like:'',
    result: []
  };

  // 変更情報
  public param = {
    depCode: '',
    clctInfoStaffMap: []
  };

  dropdownSettings = {};
  searched = false;
  selectedRowIndex = -1;

  displayedColumns: string[] = ['checkBox', 'department', 'staffName', 'bukkenNo', 'contractBukkenNo','bukkenName', 'residence', 'result', 'pickDate', 'mapFiles'];
  dataSource = new MatTableDataSource<Templandinfo>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('cbxNotStaffChk', {static: true}) cbxNotStaffChk: MatCheckbox;

  public data: Templandinfo;
  hasSearchItem: boolean = false;// 検索条件バリデーション

  constructor(private ngZone: NgZone,
              public router: Router,
              private route: ActivatedRoute,
              public service: BackendService,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              private spinner: NgxSpinnerService) {
                super(router, service,dialog);
  }
  
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('担当割付・変更');
    this.dataSource.paginator = this.paginator;
    this.spinner.show();

    const funcs = [];
    funcs.push(this.service.getCodes(['001']));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getEmps(null));

    Promise.all(funcs).then(values => {
      // コードマスタ
      const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a , b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }
      // 部署
      this.deps = values[1];
      // ユーザー
      this.emps = values[2];

      this.depCodes = this.getDeps();

      this.spinner.hide();
    });

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'userId',
      textField: 'userName',
      searchPlaceholderText: '検索',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: false
    };
  }

  /**
   * 行データマウスオーバー
   */
  highlight(row) {
    this.selectedRowIndex = row.pid;
  }

  /**
   * 検索
   */
  searchBukken() {
    if (!this.validate()) return;
    
    this.spinner.show();

    // 【ノート】
    // 検索条件編集

    // 物件担当者
    this.cond.clctInfoStaff = this.cond.clctInfoStaffMap.map(me => me.userId);

    this.service.searchLand(this.cond).then(res => {
      if (res !== null && res.length > 0) {
        res.forEach(obj => {
          // 【ノート】
          // 検索結果編集

          // 担当部署
          if (obj.department !== null && obj.department !== '') {
            obj.department = this.deps.filter((c) => c.depCode === obj.department).map(c => c.depName)[0];
          }

          // 物件担当者
          let staff = [];
          if(!this.isBlank(obj.infoStaff)) {
            obj.infoStaff.split(',').forEach(me => {
              let lst = this.emps.filter(us=>us.userId === me).map(me => me.userName);
              if(lst.length > 0) {
                staff.push(lst[0]);
              }
            });
            obj['staffName'] = staff.join(',');
          }
          else {
            obj['staffName'] = '';
          }

          // 結果
          if (obj.result !== null && obj.result !== '') {
            const lst = obj.result.split(',');
            obj.result = this.getCode('001').filter((c) => lst.includes(c.codeDetail)).map(c => c.name).join(',');
          }

          //チェックボックス初期値ON
          obj['select'] = true;
        });
      }
      this.service.searchCondition = this.cond;
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      this.searched = true;

      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
  }

  /**
   * 変更ボタン処理
   */
  change(){
    // 選択データからpidを取得
    let lst = this.dataSource.data.filter(me => me['select']).map(me => Number(me.pid));
    if(lst.length === 0) return;

    if(this.isBlank(this.param.depCode) && this.param.clctInfoStaffMap.length == 0) {
      const dlg = new Dialog({title: '警告', message: '担当部署もしくは、物件担当者を指定してください。'});
      this.dialog.open(ErrorDialogComponent, {
        width: '500px',
        height: '250px',
        data: dlg
      });
      return;
    }

    if(lst.length > 500) {
      const dlg = new Dialog({title: '警告', message: '最大件数は500件となります。件数を減らして実行してください。'});
      this.dialog.open(ErrorDialogComponent, {
        width: '500px',
        height: '250px',
        data: dlg
      });
      return;
    }

    const dlg = new Dialog({title: '確認', message: '担当を変更します。よろしいですか？'});
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '250px',
      data: dlg
    });

    dialogRef.afterClosed().subscribe(result => {
      if (dlg.choose) {
        this.spinner.show();

        // 対象データを取得
        const funcsGet = [];
        lst.forEach(pid => {
          funcsGet.push(this.service.getLand(pid));
        });

        const funcsSave = [];

        Promise.all(funcsGet).then(values => {
          // 対象データを更新
          for (let i = 0; i < lst.length; i++) {
            this.data = values[i];
            if(!this.isBlank(this.param.depCode)) this.data.department = this.param.depCode;
            if(this.param.clctInfoStaffMap.length > 0) this.data.infoStaff = this.param.clctInfoStaffMap.map(me => me['userId']).join(',');
            this.data.updateUserId = this.service.loginUser.userId;
            
            funcsSave.push(this.service.saveLand(this.data));
          }

          Promise.all(funcsSave).then(values => {
            this.spinner.hide();
            const finishDlg = new Dialog({title: '完了', message: '担当を変更しました。'});
            const dlgVal = this.dialog.open(FinishDialogComponent, {
              width: '500px',
              height: '250px',
              data: finishDlg
            });
  
            dlgVal.afterClosed().subscribe(res => {
              // 再検索
              this.searchBukken();
            });
          });
        });
      }
    });
  }

  /**
   * 検索条件バリデーション
   */
  validate(): boolean {
    this.hasSearchItem = false;
    this.errorMsgs = [];

    if(this.cond.department.length > 0) this.hasSearchItem = true;
    if(this.cond.clctInfoStaffMap.length > 0) this.hasSearchItem = true;
    if(this.cbxNotStaffChk.checked) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.bukkenNo)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.bukkenName)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.residence)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.contractBukkenNo_Like)) this.hasSearchItem = true;
    if(this.cond.result.length > 0) this.hasSearchItem = true;

    if (!this.hasSearchItem) {
      this.errorMsgs.push('検索条件のいずれかを指定してください。');
      return false;
    }
    return true;
  }

  /**
   * チェックボックスON/OFF
   */
  changeFlg(event, flgType: string) {
    if(flgType === 'notStaffChk') {
      if(event.checked) {
        this.cond.notStaffChk = '1';
        this.cond.clctInfoStaffMap = [];// 物件担当者を初期化
      }
      else {
        this.cond.notStaffChk = '0';
      }
    }
  }

  /**
   * コンボボックス変更
   */
  changeItem(event, dropdownType: string) {
    if(dropdownType === 'clctInfoStaff') {
      if(this.cond.clctInfoStaffMap.length > 0) this.cond.notStaffChk = '0';
    }
  }
}

