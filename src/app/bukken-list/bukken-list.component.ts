declare var google: any;
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, NgZone } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../backend.service';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter, MatTabGroup, MatRadioChange } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Templandinfo } from '../models/templandinfo';
import { Code } from '../models/bukken';
import { DatePipe } from '@angular/common';
import { utils } from 'protractor';
import { Util } from '../utils/util';
import { CsvTemplateComponent } from '../csv-template/csv-template.component';

@Component({
  selector: 'app-bukken-list',
  templateUrl: './bukken-list.component.html',
  styleUrls: ['./bukken-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: JPDateAdapter}
  ],
  encapsulation: ViewEncapsulation.None
})
export class BukkenListComponent extends BaseComponent {

  public cond = {
    bukkenNo: '',
    //20200828 S_Update
//    contractBukkenNo:'',
    contractBukkenNo_Like:'',
    //20200828 E_Update
    bukkenName: '',
    residence: '',
    address: '',
    pickDate_From: '',
    pickDateSearch_From: '',
    pickDate_To: '',
    pickDateSearch_To: '',
    surveyRequestedDay_From: '',
    surveyRequestedDaySearch_From: '',
    surveyRequestedDay_To: '',
    surveyRequestedDaySearch_To: '',
    //20200913 S_Add
    finishDate_From: '',
    finishDateSearch_From: '',
    finishDate_To: '',
    finishDateSearch_To: '',
    //20200913 E_Add
    //20210112 S_Add
    salesDecisionDay_From: '',
    salesDecisionDaySearch_From: '',
    salesDecisionDay_To: '',
    salesDecisionDaySearch_To: '',
    //20210112 E_Add
//    pickDateMap: new Date(),
//    pickDate: '',
    department: [],
    // 20201011 S_Update
//    result: ['01'],
    result: [],
    // 20201011 E_Update
    mode: 1,
    //20200828 S_Add
    clctInfoStaff: [],
    clctInfoStaffMap: []
    //20200828 E_Add
 };
  dropdownSettings = {};//20200828 Add
  search = '0';
  searched = false;
  selectedRowIndex = -1;
  //20200828 S_Update
  /*
  displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo','bukkenName', 'residence', 'remark1', 'remark2', 'mapFiles', 'pickDate', 'surveyRequestedDay','department', 'result', 'detail', 'csvCheck'];
  */
  displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo','bukkenName', 'residence', 'remark2', 'mapFiles', 'pickDate', 'surveyRequestedDay', 'staffName', 'result', 'detail', 'csvCheck'];
  //20200828 E_Update
  dataSource = new MatTableDataSource<Templandinfo>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild(MatTabGroup, {static: true}) tabGroup: MatTabGroup;

  // マップ
  @ViewChild('mapContainer', {static: true}) gmap: ElementRef;
  mapObj: any;
  infowindow: any;
  markers = [];
  //20200828 S_Add
  authority = '';
  disableUser: boolean = false;
  //20200828 E_Add
  hasSearchItem: boolean = false;// 20201011 Add

  constructor(private ngZone: NgZone,
              public router: Router,
              private route: ActivatedRoute,
              public service: BackendService,
              public dialog: MatDialog,
              public datepipe: DatePipe,
              private spinner: NgxSpinnerService) {
                super(router, service,dialog);

                this.route.queryParams.subscribe(params => {
                  this.search = params.search;
                });
  }
  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    super.ngOnInit();

    //20200828 S_Add
    this.authority = this.service.loginUser.authority;
    this.disableUser = (this.authority === '03');
    //20200828 E_Add

    // tslint:disable-next-line:no-string-literal
    window['angularComponentReference'] = { component: this, zone: this.ngZone, openDetailFromMap: (pid) => this.showDetail2(pid), };

    this.service.changeTitle('物件情報一覧');
    this.dataSource.paginator = this.paginator;
    this.spinner.show();

    if (this.search === '1') {
      this.cond = this.service.searchCondition;
      if(this.cond == null) {
        this.resetCondition();
      }
    }

    const funcs = [];
    funcs.push(this.service.getCodes(['001']));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getEmps(null));//20200828 Add

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

      this.deps = values[1];
      //20200828 S_Add
      // 社員
      this.emps = values[2];
      //20200828 E_Add

//      this.cond.pickDateMap = null;
      this.spinner.hide();
      if (this.search === '1') {
        this.searchBukken();
      }

    });

    this.mapInitializer();

    //20200828 S_Add
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'userId',
      textField: 'userName',
      searchPlaceholderText: '検索',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: false
    };
    //20200828 E_Add
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }

  /**
   * 検索条件リセット
   */
  resetCondition() {
    this.cond = {
      bukkenNo: '',
      //20200828 S_Update
//      contractBukkenNo:'',
      contractBukkenNo_Like:'',
      //20200828 E_Update
      bukkenName: '',
      residence: '',
      address: '',
      pickDate_From: '',
      pickDateSearch_From: '',
      pickDate_To: '',
      pickDateSearch_To: '',
      surveyRequestedDay_From: '',
      surveyRequestedDaySearch_From: '',
      surveyRequestedDay_To: '',
      surveyRequestedDaySearch_To: '',
      //20200913 S_Add
      finishDate_From: '',
      finishDateSearch_From: '',
      finishDate_To: '',
      finishDateSearch_To: '',
      //20200913 E_Add
      //20210112 S_Add
      salesDecisionDay_From: '',
      salesDecisionDaySearch_From: '',
      salesDecisionDay_To: '',
      salesDecisionDaySearch_To: '',
      //20210112 E_Add
//      pickDateMap: new Date(),
//      pickDate: '',
      department: [],
      // 20201011 S_Update
//      result: ['01'],
      result: [],
      // 20201011 E_Update
      mode: 1,
      //20200828 S_Add
      clctInfoStaff: [],
      clctInfoStaffMap: []
      //20200828 E_Add
   };
  }

  /**
   * 物件検索
   */
  searchBukken() {
    // 20201011 S_Add
    if (!this.validate()) return;
    // 20201011 E_Add
    
    this.spinner.show();

    this.markers.forEach(marker => {
      marker.setMap(null);
      marker = null;
    });
    this.markers = [];

//    this.cond.pickDate = this.cond.pickDateMap != null ? this.cond.pickDateMap.toLocaleDateString() : null;
    this.cond.pickDateSearch_From = this.cond.pickDate_From != null ? this.datepipe.transform(this.cond.pickDate_From, 'yyyyMMdd') : "";
    this.cond.pickDateSearch_To = this.cond.pickDate_To != null ? this.datepipe.transform(this.cond.pickDate_To, 'yyyyMMdd') : "";
    this.cond.surveyRequestedDaySearch_From = this.cond.surveyRequestedDay_From != null ? this.datepipe.transform(this.cond.surveyRequestedDay_From, 'yyyyMMdd') : "";
    this.cond.surveyRequestedDaySearch_To = this.cond.surveyRequestedDay_To != null ? this.datepipe.transform(this.cond.surveyRequestedDay_To, 'yyyyMMdd') : "";
    //20200913 S_Add
    this.cond.finishDateSearch_From = this.cond.finishDate_From != null ? this.datepipe.transform(this.cond.finishDate_From, 'yyyyMMdd') : "";
    this.cond.finishDateSearch_To = this.cond.finishDate_To != null ? this.datepipe.transform(this.cond.finishDate_To, 'yyyyMMdd') : "";
    //20200913 E_Add
    //20210112 S_Add
    this.cond.salesDecisionDaySearch_From = this.cond.salesDecisionDay_From != null ? this.datepipe.transform(this.cond.salesDecisionDay_From, 'yyyyMMdd') : "";
    this.cond.salesDecisionDaySearch_To = this.cond.salesDecisionDay_To != null ? this.datepipe.transform(this.cond.salesDecisionDay_To, 'yyyyMMdd') : "";
    //20210112 E_Add
    this.cond.clctInfoStaff = this.cond.clctInfoStaffMap.map(me => me.userId);//20200828 Add

    this.service.searchLand(this.cond).then(res => {
      if (res !== null && res.length > 0) {
        res.forEach(obj => {
          //20200828 S_Delete
          /*
          if (obj.department !== null && obj.department !== '') {
            obj.department = this.deps.filter((c) => c.depCode === obj.department).map(c => c.depName)[0];
          }
          */
          //20200828 E_Delete
          if (obj.result !== null && obj.result !== '') {
            const lst = obj.result.split(',');
            obj.result = this.getCode('001').filter((c) => lst.includes(c.codeDetail)).map(c => c.name).join(',');
          }

          //CSVチェック
          obj['select'] = true;

          //20200828 S_Add
          //物件担当
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
          //20200828 E_Add
        });
      }
      this.service.searchCondition = this.cond;
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      this.searched = true;
      this.showMapMarker();
      // モード
      if (this.cond.mode === 2 && this.tabGroup.selectedIndex === 0) {
        this.tabGroup.selectedIndex = 1;
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 500);

    });
  }

  /**
   * 物件詳細
   * @param row: 物件データ
   */
  showDetail(row: Templandinfo) {
    this.router.navigate(['/bkdetail'], {queryParams: {pid: row.pid}});
  }

  showDetail2(id: number) {
    this.router.navigate(['/bkdetail'], {queryParams: {pid: id}});
  }

  /**
   * 土地新規登録
   */
  createNew() {
    this.router.navigate(['/bkdetail']);
  }

  switchTab(event: MatRadioChange) {
    if (event.value === 1) {
      this.tabGroup.selectedIndex = 0;
    } else {
      this.tabGroup.selectedIndex = 1;
    }
    this.cond.mode = event.value;
    this.service.searchCondition = this.cond;
  }

  /**
   * 出力
   */
  export() {
    this.service.export();
  }

  // マップスタート
  mapInitializer() {
    const mapOptions = {
      center: {lat: 35.6812, lng: 139.7671},
      zoom: 13,
    };
    this.mapObj = new google.maps.Map(this.gmap.nativeElement, mapOptions);
  }

  //20200902 S_Update
  /*
  showMapMarker() {
    this.dataSource.data.forEach(bk => {
      const addr = bk.residence !== '' ? bk.residence : bk.remark1.split(',')[0];
      const geocoder = new google.maps.Geocoder();
      const that = this;
      geocoder.geocode({address : addr}, function(results: any, status: any) {
        if (status === google.maps.GeocoderStatus.OK) {
          const latVal = results[0].geometry.location.lat(); // 緯度を取得
          const lngVal = results[0].geometry.location.lng(); // 経度を取得
          const mark = {
            lat: latVal, // 緯度
            lng: lngVal // 経度
          };
          that.setMarker(mark, bk);
        }
      });
    });
  }
  */
  showMapMarker() {
    //10件以下
    if(this.dataSource.data.length <= 10) {
      this.dataSource.data.forEach(bk => {
        const addr = bk.residence !== '' ? bk.residence : bk.remark1.split(',')[0];
        const geocoder = new google.maps.Geocoder();
        const that = this;
        geocoder.geocode({address : addr}, function(results: any, status: any) {
          if (status === google.maps.GeocoderStatus.OK) {
            const latVal = results[0].geometry.location.lat(); // 緯度を取得
            const lngVal = results[0].geometry.location.lng(); // 経度を取得
            const mark = {
              lat: latVal, // 緯度
              lng: lngVal // 経度
            };
            that.setMarker(mark, bk);
          }
        });
      });
    }
    //10件以上
    else {
      this.showMaker(0);
    }
  }

  showMaker(pos: number){
    let bk = this.dataSource.data[pos];
    const addr = bk.residence !== '' ? bk.residence : bk.remark1.split(',')[0];
    const geocoder = new google.maps.Geocoder();
    const that = this;
    geocoder.geocode({address : addr}, function(results: any, status: any) {
      if (status === google.maps.GeocoderStatus.OK) {
        const latVal = results[0].geometry.location.lat(); // 緯度を取得
        const lngVal = results[0].geometry.location.lng(); // 経度を取得
        const mark = {
          lat: latVal, // 緯度
          lng: lngVal // 経度
        };
        that.setMarker(mark, bk);
      }

      if(pos < that.dataSource.data.length - 1) {
          setTimeout(() => {
            that.showMaker(pos+1);
          }, 400);
      }
    });
  }
  //20200902 E_Update

   /**
    * ピン追加
    * @param latlng ：緯度経度
    * @param bk ：物件情報
    */
   setMarker(latlng: any, bk: Templandinfo) {
    const that = this;//20200902 Add
    const result = this.getCodeDetail('001', bk.result);
    const pin = (result === '01' ? 'pin-blue2.png' : result === '02' ? 'pin-green.png' : 'pin-pink.png');
    const marker = new google.maps.Marker({
      position: latlng,
      map: this.mapObj,
      icon: {
        url: 'assets/img/' + pin,
        scaledSize: new google.maps.Size(40, 40)
      }
    });

    marker.addListener('click', function() {

      let dayStr = '';
      if (!(bk.pickDate === undefined || bk.pickDate === '' || bk.pickDate == null)) {
        //20200902 S_Update
        /*
        const parseVal = new Date(bk.pickDate);
        dayStr = parseVal.toLocaleDateString();
        */
        dayStr = that.formatDay(bk.pickDate, 'yyyy/MM/dd');
        //20200902 E_Update
      }

      let requestedStr = '';
      if (!(bk.surveyRequestedDay === undefined || bk.surveyRequestedDay === '' || bk.surveyRequestedDay == null)) {
        //20200902 S_Update
        /*
        const parseVal = new Date(bk.surveyRequestedDay);
        requestedStr = parseVal.toLocaleDateString();
        */
        dayStr = that.formatDay(bk.surveyRequestedDay, 'yyyy/MM/dd');
        //20200902 E_Update
      }

      const linkStr = [];
      bk.mapFiles.forEach(file => {
        linkStr.push(`<a href="${file.mapFilePath + file.mapFileName}" target="_blank">${file.mapFileName}</a>`);
      });

      const infowindow = new google.maps.InfoWindow({
        content: `<div class="map-equip">
                    <table>
                      <tr><th class="label">物件コード</th><th>${bk.bukkenNo}</th></tr>
                      <tr><th class="label">物件名</th><th>${bk.bukkenName}</th></tr>
                      <tr><th class="label">契約物件番号</th><th>${bk.contractBukkenNo}</th></tr>
                      <tr><th class="label">住居表示</th><th>${bk.residence}</th></tr>
                      <tr><th class="label">所在地</th><th>${bk.remark1.split(',')[0]}</th></tr>
                      <tr><th class="label">地番</th><th>${bk.remark2.split(',')[0]}</th></tr>
                      <tr><th class="label">地図情報</th><th>${linkStr.join('   ')}</th></tr>
                      <tr><th><br></th><th></th></tr>
                      <tr><th class="label">情報収集日</th><th>${dayStr}</th></tr>
                      <tr><th class="label">測量依頼日</th><th>${requestedStr}</th></tr>
                      <tr><th class="label">物件担当者</th><th>${bk['staffName']}</th></tr>
                      <tr><th class="label">結果</th><th>${bk['result']}</th></tr>
                      <tr><th class="label"></th><th><a href="javascript:openDetailFromMap(${bk.pid})">詳細</a></th></tr>
                    </table>
                  </div>`
      });
      infowindow.open(this.mapObj, marker);
    });
    //20200902 S_Update
//    this.markers.push(marker);
    that.markers.push(marker);
    //20200902 E_Update
  }

  // マップエンド

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
        type: '01'
      }
    });
    // 再検索
    dialogRef.afterClosed().subscribe(result => {
      if (result && result['choose']) {
        this.spinner.show();
        this.service.exportCsv(lst, result['csvCode']).then(ret => {
          Util.stringToCSV(ret['data'], result['csvName']);
          this.spinner.hide();
        });
      }
    });
  }

  // 20201011 S_Add
  /**
   * バリデーション
   */
  validate(): boolean {
    this.hasSearchItem = false;
    this.errorMsgs = [];
    
    if(!this.isBlank(this.cond.bukkenNo)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.contractBukkenNo_Like)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.bukkenName)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.address)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.residence)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.pickDate_From)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.pickDate_To)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.surveyRequestedDay_From)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.surveyRequestedDay_To)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.finishDate_From)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.finishDate_To)) this.hasSearchItem = true;
    // 20210112 S_Add
    if(!this.isBlank(this.cond.salesDecisionDay_From)) this.hasSearchItem = true;
    if(!this.isBlank(this.cond.salesDecisionDay_To)) this.hasSearchItem = true;
    // 20210112 E_Add
    if(this.cond.department.length > 0) this.hasSearchItem = true;
    if(this.cond.result.length > 0) this.hasSearchItem = true;
    if(this.cond.clctInfoStaffMap.length > 0) this.hasSearchItem = true;
    
    if (!this.hasSearchItem) {
      this.errorMsgs.push('検索条件のいずれかを指定してください。');
      return false;
    }
    return true;
  }
  // 20201011 E_Add
}

