import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../BaseComponent';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { Information } from '../models/information';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { InfoDialogComponent } from '../dialog/info-dialog/info-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { Code } from '../models/bukken';
import { NoticeDetailComponent } from '../notice-detail/notice-detail.component';// 20211227 Add

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.css']
})

export class TopComponent extends BaseComponent {

  displayedColumns: string[] = ['infoDate', 'infoSubject', 'attachFileName'];
  dataSource = new MatTableDataSource<Information>();
  hasInfo = false;

  // 20211227 S_Add
  // 20220517 S_Update
  // displayedColumnsForNotice: string[] = ['infoDate', 'approvalFlg', 'infoSubject', 'attachFileName'];
  // 20231023 S_Update
  // displayedColumnsForNotice: string[] = ['infoDate', 'infoSubject', 'confirmFlg', 'approvalFlg', 'createUserId', 'answerTimeLimit', 'approvalDateTime'];
  displayedColumnsForNotice: string[] = ['infoDate', 'infoSubject', 'confirmFlg', 'approvalFlg', 'createUserId', 'answerTimeLimit'];
  // 20231023 E_Update
  // 20220517 E_Update
  dataSourceForNotice = new MatTableDataSource<Information>();
  hasNotice = false;
  authority = '';
  enableUser: boolean = false;
  // 20211227 E_Add
  // 20230213 S_Add
  // 20231023 S_Update
  // displayedColumnsForOsaka: string[] = ['infoDate', 'infoSubject', 'confirmFlg', 'approvalFlg', 'createUserId', 'answerTimeLimit', 'approvalDateTime'];
  displayedColumnsForOsaka: string[] = ['infoDate', 'infoSubject', 'confirmFlg', 'approvalFlg', 'createUserId', 'answerTimeLimit'];
  // 20231023 E_Update
  dataSourceForOsaka = new MatTableDataSource<Information>();
  hasOsaka = false;
  // 20230213 E_Add

  // 20231023 S_Add
  displayedColumnsForFukuoka: string[] = ['infoDate', 'infoSubject', 'confirmFlg', 'approvalFlg', 'createUserId', 'answerTimeLimit'];
  dataSourceForFukuoka = new MatTableDataSource<Information>();
  hasFukuoka = false;
  // 20231023 E_Add

   // 20250902 S_Add
  displayedColumnsForKyoto: string[] = ['infoDate', 'infoSubject', 'confirmFlg', 'approvalFlg', 'createUserId', 'answerTimeLimit'];
  dataSourceForKyoto = new MatTableDataSource<Information>();
  hasKyoto = false;
  // 20250902 E_Add
  // view: any[] = ['50%', '100%'];

  // options for the chart
  postChart = {
    showXAxis: true,
    showYAxis: true,
    gradient: false,
    showLegend: false,
    showXAxisLabel: true,
    xAxisLabel: '部署',
    showYAxisLabel: true,
    yAxisLabel: '契約件数',
    timeline: true,
    barPadding: 50,
    colorScheme: {
      domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
    },
    chartData: []
  };

  empChart = {
    showXAxis: true,
    showYAxis: true,
    gradient: false,
    showLegend: false,
    showXAxisLabel: true,
    xAxisLabel: '担当',
    showYAxisLabel: true,
    yAxisLabel: '契約件数',
    timeline: true,
    barPadding: 100,
    colorScheme: {
      domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
    },
    chartData: []
  };

  constructor(public router: Router,
    public dialog: MatDialog,
    public service: BackendService,
    private spinner: NgxSpinnerService) {
    super(router, service, dialog);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('ダッシュボード');
    this.service.isTopPage(true);

    const funcs = [];
    funcs.push(this.service.getDeps(null));
    // 20220517 S_Update
    // funcs.push(this.service.getEmps(null));
    funcs.push(this.service.getEmps('9'));
    // 20220517 E_Update

    Promise.all(funcs).then(values => {
      this.deps = values[0];
      this.emps = values[1];
      this.buildDepChart();
    });

    this.spinner.show();
    // this.service.searchInfo({count: 5, finishFlg: ['0'], today: '1'}).then(res => {
    // 20211227 S_Update
    // this.service.searchInfo({count: 5, finishFlg: ['0']}).then(res => {
    this.service.searchInfo({ count: 5, finishFlg: ['0'], infoType: 0 }).then(res => {
      // 20211227 E_Update
      this.dataSource.data = res;

      if (res !== undefined && res.length > 0) {
        this.hasInfo = true;
      }

      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });

    // 20211227 S_Add
    this.authority = this.service.loginUser.authority;
    this.enableUser = (this.authority === '01' || this.authority === '02');

    // コード
    funcs.push(this.service.getCodes(['038', '039']));
    Promise.all(funcs).then(values => {
      const codes = values[2] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a, b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
          this.sysCodes[code] = lst;
        });
      }
    });

    // お知らせ（名古屋支店）
    // 20230308 S_Update
    //    this.service.searchInfo({count: 10, finishFlg: ['0'], infoType: 1}).then(res => {
    this.service.searchInfo({ count: 0, finishFlg: ['0'], infoType: 1, sortType: '1' }).then(res => {
      // 20230308 E_Update
      this.dataSourceForNotice.data = res;

      if (res !== undefined && res.length > 0) {
        this.hasNotice = true;
      }

      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
    // 20211227 E_Add
    // 20230213 S_Add
    // お知らせ（大阪支店）
    // 20230308 S_Update
    //    this.service.searchInfo({count: 0, finishFlg: ['0'], infoType: 2}).then(res => {
    this.service.searchInfo({ count: 0, finishFlg: ['0'], infoType: 2, sortType: '1' }).then(res => {
      // 20230308 E_Update
      this.dataSourceForOsaka.data = res;

      if (res !== undefined && res.length > 0) {
        this.hasOsaka = true;
      }

      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
    // 20230213 E_Add

    // 20231023 S_Add
    // お知らせ（福岡支店）
    this.service.searchInfo({ count: 0, finishFlg: ['0'], infoType: 3, sortType: '1' }).then(res => {
      this.dataSourceForFukuoka.data = res;

      if (res !== undefined && res.length > 0) {
        this.hasFukuoka = true;
      }

      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
    // 20231023 S_Add

    // 20250902 S_Add
    // お知らせ（京都支店）
    this.service.searchInfo({ count: 0, finishFlg: ['0'], infoType: 4, sortType: '1' }).then(res => {
      this.dataSourceForKyoto.data = res;

      if (res !== undefined && res.length > 0) {
        this.hasKyoto = true;
      }

      setTimeout(() => {
        this.spinner.hide();
      }, 500);
    });
    // 20250902 S_Add
  }

  buildDepChart() {
    const data = [];
    this.deps.forEach(dep => {
      data.push({
        name: dep.depName,
        value: Math.round(Math.random() * 100)
      });
    });
    this.postChart.chartData = data;

    const empData = [];
    this.emps.forEach(emp => {
      empData.push({
        name: emp.userName,
        value: Math.round(Math.random() * 100)
      });
    });
    this.empChart.chartData = empData;
  }

  onSelect(event) {
    this.router.navigate(['/bukkens']);
  }

  openDialog(element: Information) {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '60%',
      height: '500px',
      data: element
    });
  }

  navigate(url: string) {
    this.router.navigate([`/${url}`]);
  }
  // 20231023 S_Add
  navigate2(url: string, infoType: string) {
    this.router.navigate([`/${url}`], { queryParams: { infoType: infoType } });
  }
  // 20231023 E_Add

  // 20211227 S_Add
  showNoticeDetail(row: Information) {
    const dialogRef = this.dialog.open(NoticeDetailComponent, {
      width: '60%',
      height: '580px',
      data: row
    });

    dialogRef.componentInstance.isHideSubjectDetail = true;// 20230306 Add

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ngOnInit();
      }
    });
  }
  // 20211227 E_Add
  // 20230213 S_Add
  showOsakaDetail(row: Information) {
    const dialogRef = this.dialog.open(NoticeDetailComponent, {
      width: '60%',
      height: '580px',
      data: row
    });

    dialogRef.componentInstance.isHideSubjectDetail = true;// 20230306 Add

    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ngOnInit();
      }
    });
  }
  // 20230213 E_Add
}
