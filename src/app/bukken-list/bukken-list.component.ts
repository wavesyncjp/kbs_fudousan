import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, NgZone, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../backend.service';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MAT_DATE_LOCALE, DateAdapter, MatTabGroup, MatRadioChange, MatCheckbox } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

import { MatPaginatorIntlJa, JPDateAdapter } from '../adapters/adapters';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../BaseComponent';
import { Templandinfo } from '../models/templandinfo';
import { Code } from '../models/bukken';
import { DatePipe } from '@angular/common';
import { Util } from '../utils/util';
import { CsvTemplateComponent } from '../csv-template/csv-template.component';
// import html2canvas from 'html2canvas';// 20231111 Delete

declare var google: any;
declare var $: any;// 20231111 Add

@Component({
  selector: 'app-bukken-list',
  templateUrl: './bukken-list.component.html',
  styleUrls: ['./bukken-list.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: JPDateAdapter }
  ],
  encapsulation: ViewEncapsulation.None
})
export class BukkenListComponent extends BaseComponent {

  public cond = {
    bukkenNo: '',
    //20200828 S_Update
    //    contractBukkenNo:'',
    contractBukkenNo_Like: '',
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
    clctInfoStaffMap: [],
    //20200828 E_Add
    //20210113 S_Add
    bukkenListChk: '',
    importance: [],
    surveyRequestedDayChk: ''
    //20210113 E_Add
    // 20240201 S_Add
    , surveyRequested: ''
    , surveyDeliveryDayChk: ''
    // 20240201 E_Add
  };
  dropdownSettings = {};//20200828 Add
  search = '0';
  searched = false;
  selectedRowIndex = -1;
  //20221226 S_Update
  /*
  displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo','bukkenName', 'residence', 'remark1', 'remark2', 'mapFiles', 'pickDate', 'surveyRequestedDay','department', 'result', 'detail', 'csvCheck'];
  */
  displayedColumns: string[] = ['bukkenNo', 'contractBukkenNo', 'bukkenName', 'residence', 'remark2', 'mapFiles', 'startDate', 'surveyRequestedDay', 'staffName', 'result', 'detail', 'copy', 'csvCheck'];
  //20221226 E_Update
  dataSource = new MatTableDataSource<Templandinfo>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild(MatTabGroup, { static: true }) tabGroup: MatTabGroup;

  // 20210113 S_Add
  @ViewChild('cbxBukkenListChk', { static: true }) cbxBukkenListChk: MatCheckbox;
  @ViewChild('cbxSurveyRequestedDayChk', { static: true }) cbxSurveyRequestedDayChk: MatCheckbox;
  // 20210113 E_Add
  // 20240201 S_Add
  @ViewChild('cbxSurveyDeliveryDayChk', { static: true }) cbxSurveyDeliveryDayChk: MatCheckbox;
  // 20240201 E_Add

  // マップ
  @ViewChild('mapContainer', { static: true }) gmap: ElementRef;

  mapObj: any;
  infowindow: any;
  markers = [];
  //20200828 S_Add
  authority = '';
  disableUser: boolean = false;
  //20200828 E_Add
  enableUser: boolean = false;// 20210425 Add
  hasSearchItem: boolean = false;// 20201011 Add

  constructor(private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    public router: Router,
    private route: ActivatedRoute,
    public service: BackendService,
    public dialog: MatDialog,
    public datepipe: DatePipe,
    private spinner: NgxSpinnerService) {
    super(router, service, dialog);

    this.route.queryParams.subscribe(params => {
      this.search = params.search;
    });
  }
  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    this.loadScript('assets/js/jQuery.print.min.js');// 20231111 Add
    super.ngOnInit();

    //20200828 S_Add
    this.authority = this.service.loginUser.authority;
    this.disableUser = (this.authority === '03');
    //20200828 E_Add
    this.enableUser = (this.authority === '01');// 20210425 Add

    // tslint:disable-next-line:no-string-literal
    window['angularComponentReference'] = { component: this, zone: this.ngZone, openDetailFromMap: (pid) => this.showDetail2(pid), };

    this.service.changeTitle('物件情報一覧');
    this.dataSource.paginator = this.paginator;
    this.spinner.show();

    if (this.search === '1') {
      this.cond = this.service.searchCondition;
      if (this.cond == null) {
        this.resetCondition();
      }
    }

    const funcs = [];
    funcs.push(this.service.getCodes(['001', '028']));
    funcs.push(this.service.getDeps(null));
    funcs.push(this.service.getEmps(null));//20200828 Add

    Promise.all(funcs).then(values => {

      const codes = values[0] as Code[];
      if (codes !== null && codes.length > 0) {
        const uniqeCodes = [...new Set(codes.map(code => code.code))];
        uniqeCodes.forEach(code => {
          const lst = codes.filter(c => c.code === code);
          lst.sort((a, b) => Number(a.displayOrder) > Number(b.displayOrder) ? 1 : -1);
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
  // 20231111 S_Add
  private loadScript(scriptUrl: string) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    document.body.appendChild(script);
  }
  // 20231111 E_Add
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
      contractBukkenNo_Like: '',
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
      clctInfoStaffMap: [],
      //20200828 E_Add
      //20210113 S_Add
      bukkenListChk: '',
      importance: [],
      surveyRequestedDayChk: ''
      //20210113 E_Add
      // 20240201 S_Add
      , surveyRequested: ''
      , surveyDeliveryDayChk: ''
      // 20240201 E_Add
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

    //20210113 S_Add
    this.cond.bukkenListChk = this.cbxBukkenListChk.checked ? '1' : '';
    this.cond.surveyRequestedDayChk = this.cbxSurveyRequestedDayChk.checked ? '1' : '';
    //20210113 E_Add
    // 20240201 S_Add
    this.cond.surveyDeliveryDayChk = this.cbxSurveyDeliveryDayChk.checked ? '1' : '';
    // 20240201 E_Add
    this.service.searchLand(this.cond).then(res => {
      if (res !== null && res.length > 0) {
        let count = 0;// 20230919 Add
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
          if (!this.isBlank(obj.infoStaff)) {
            obj.infoStaff.split(',').forEach(me => {
              let lst = this.emps.filter(us => us.userId === me).map(me => me.userName);
              if (lst.length > 0) {
                staff.push(lst[0]);
              }
            });
            obj['staffName'] = staff.join(',');
          }
          else {
            obj['staffName'] = '';
          }
          //20200828 E_Add
          // 20230919 S_Add
          if (obj['latitude'] > 0) {
            ++count;
            obj['labelMap'] = count.toString();
          }
          // 20230919 E_Add
        });
      }
      this.service.searchCondition = this.cond;
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      this.searched = true;
      this.showMapMarker();
      this.updateMapCenter();// 20240123 Add
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
    this.router.navigate(['/bkdetail'], { queryParams: { pid: row.pid } });
  }

  showDetail2(id: number) {
    this.router.navigate(['/bkdetail'], { queryParams: { pid: id } });
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
      center: { lat: 35.6812, lng: 139.7671 },
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
    //20210117: 検索じゃなく、DBの値を表示
    this.dataSource.data.forEach(bk => {
      if (bk.latitude > 0) {
        this.setMarker({ lat: Number(bk.latitude), lng: Number(bk.longitude) }, bk);
      }
    });

  }

  showMaker(pos: number) {
    let bk = this.dataSource.data[pos];
    const addr = bk.residence !== '' ? bk.residence : bk.remark1.split(',')[0];
    const geocoder = new google.maps.Geocoder();
    const that = this;
    geocoder.geocode({ address: addr }, function (results: any, status: any) {
      if (status === google.maps.GeocoderStatus.OK) {
        const latVal = results[0].geometry.location.lat(); // 緯度を取得
        const lngVal = results[0].geometry.location.lng(); // 経度を取得
        const mark = {
          lat: latVal, // 緯度
          lng: lngVal // 経度
        };
        that.setMarker(mark, bk);
      }

      if (pos < that.dataSource.data.length - 1) {
        setTimeout(() => {
          that.showMaker(pos + 1);
        }, 400);
      }
    });
  }
  //20200902 E_Update

  // 20240123 S_Add
  updateMapCenterByLocation(map: any) {
    if (this.mapObj && map.latitude > 0) {
      const mapOptions = {
        center: { lat: Number(map.latitude), lng: Number(map.longitude) },
        zoom: 13,
      };

      this.mapObj.setOptions(mapOptions);
    }
  }
  updateMapCenter() {
    if (this.mapObj) {
      this.dataSource.data.forEach(bk => {
        if (bk.latitude > 0) {
          this.updateMapCenterByLocation(bk);
          return false;
        }
      });
    }
  }
  // 20240123 E_Add

  /**
   * ピン追加
   * @param latlng ：緯度経度
   * @param bk ：物件情報
   */
  setMarker(latlng: any, bk: Templandinfo) {
    const that = this;//20200902 Add
    const result = this.getCodeDetail('001', bk.result);
    // 20211128 S_Update
    //    const pin = (result === '01' ? 'pin-blue2.png' : result === '02' ? 'pin-green.png' : 'pin-pink.png');
    // 20230919 S_Update
    // const pin = (result === '01' ? 'pin-blue.png' : result === '02' ? 'pin-green.png' : result === '03' ? 'pin-purple.png' : result === '04' ? 'pin-yellow.png' : result === '05' ? 'pin-orange.png' : 'pin-pink.png');
    const pin = (result === '01' ? 'pin-blue.png' : result === '02' ? 'pin-green.png' : result === '03' ? 'pin-purple.png' : result === '04' ? 'pin-yellow.png' : result === '05' ? 'pin-red.png' : 'pin-pink.png');
    // 20230919 E_Update
    // 20211128 E_Update
    const marker = new google.maps.Marker({
      position: latlng,
      map: this.mapObj,
      icon: {
        url: 'assets/img/' + pin,
        scaledSize: new google.maps.Size(40, 40)
      }
      // 20231111 S_Add
      , label: {
        text: bk.labelMap,
        className: 'custom-marker-label'
      }
      , zIndex: 0
      // 20231111 E_Add
    });

    marker.addListener('click', function () {

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
  csvExport() {

    let lst = this.dataSource.data.filter(me => me['select']).map(me => Number(me.pid));
    if (lst.length === 0) return;

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

          // 20210125 S_Update 緯度経度取得停止
          // 20210121 S_Add 緯度経度取得
          /*
          if(result['csvName'] === '緯度経度取得') {
            this.getLatLngList(ret['data']);
          }
          else {
            this.spinner.hide();
            Util.stringToCSV(ret['data'], result['csvName']);
          }
          */
          //          this.spinner.hide();
          // 20210121 E_Add 緯度経度取得
          this.spinner.hide();
          Util.stringToCSV(ret['data'], result['csvName']);
          // 20210125 E_Update 緯度経度取得停止

        });
      }
    });
  }

  // 20210121 S_Add 緯度経度取得
  latlngDataList = []; //緯度経度結果
  latLngInterval: number; //監視タイマー
  originalList: string[]; //取得元配列
  pointer: number;
  getLatLngList(csvData: string) {
    this.pointer = 0;
    this.latlngDataList = [];
    this.originalList = csvData.split('\\r\\n');// CSVデータを改行区切りで配列にする
    this.getLatLng();

    let that = this;

    //結果を監視する。全部終えたらConsoleに出力
    this.latLngInterval = window.setInterval(() => {
      if (that.latlngDataList.length === that.originalList.length) {
        window.clearInterval(that.latLngInterval);
        //console.log(JSON.stringify(that.latlngDataList));
        this.spinner.hide();
        Util.stringToCSV(that.latlngDataList.join('\\r\\n'), '緯度経度');
      }
    }, 1000);
  }

  getLatLng() {
    let lineData = this.originalList[this.pointer];

    //CSVデータをカンマで区切った時に2個以上であれば区切った2個目をjuukyoに入れる
    let juukyo = lineData.split(',').length >= 2 ? lineData.split(',')[1] : '';
    //juukyoの両端のダブルクォーテーションを削除してjuukyoNewに入れる
    let juukyoNew = juukyo.replace('"', '').replace('"', '');

    let that = this;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: juukyoNew }, function (results: any, status: any) {
      //OK
      if (status === google.maps.GeocoderStatus.OK) {
        let latVal = results[0].geometry.location.lat(); // 緯度を取得
        let lngVal = results[0].geometry.location.lng(); // 経度を取得
        //        that.latlngDataList.push(lineData + ',"' + latVal + '","' + lngVal + '"');
        //        that.latlngDataList.push(lineData + ',"' + results[0].formatted_address + '","'  + latVal + '","' + lngVal + '"');
        that.latlngDataList.push(lineData + ',"' + results[0].formatted_address + '","' + latVal + '","' + lngVal + '","' + status + '"');
      }
      //エラー
      else {
        //        that.latlngDataList.push(lineData + ',"NODATA","0","0"');
        that.latlngDataList.push(lineData + ',"NODATA","0","0","' + status + '"');
      }

      //ポインタープラス
      if (that.pointer < that.originalList.length - 1) {
        //        that.pointer ++;
        //        if (status === google.maps.GeocoderStatus.OK) that.pointer ++;
        if (status === google.maps.GeocoderStatus.OK) {
          that.pointer++;
          setTimeout(() => {
            that.getLatLng();
          }, 100);
        }
        else {
          setTimeout(() => {
            that.getLatLng();
          }, 1000);
        }
      }
    });
  }
  // 20210121 E_Add 緯度経度取得

  // 20201011 S_Add
  /**
   * バリデーション
   */
  validate(): boolean {
    this.hasSearchItem = false;
    this.errorMsgs = [];

    if (!this.isBlank(this.cond.bukkenNo)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.contractBukkenNo_Like)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.bukkenName)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.address)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.residence)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.pickDate_From)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.pickDate_To)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.surveyRequestedDay_From)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.surveyRequestedDay_To)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.finishDate_From)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.finishDate_To)) this.hasSearchItem = true;
    // 20210112 S_Add
    if (!this.isBlank(this.cond.salesDecisionDay_From)) this.hasSearchItem = true;
    if (!this.isBlank(this.cond.salesDecisionDay_To)) this.hasSearchItem = true;
    if (this.cbxBukkenListChk.checked) this.hasSearchItem = true;
    if (this.cond.importance.length > 0) this.hasSearchItem = true;
    if (this.cbxSurveyRequestedDayChk.checked) this.hasSearchItem = true;
    // 20210112 E_Add
    // 20240201 S_Add
    if (!this.isBlank(this.cond.surveyRequested)) this.hasSearchItem = true;
    if (this.cbxSurveyDeliveryDayChk.checked) this.hasSearchItem = true;
    // 20240201 E_Add
    if (this.cond.department.length > 0) this.hasSearchItem = true;
    if (this.cond.result.length > 0) this.hasSearchItem = true;
    if (this.cond.clctInfoStaffMap.length > 0) this.hasSearchItem = true;

    if (!this.hasSearchItem) {
      this.errorMsgs.push('検索条件のいずれかを指定してください。');
      return false;
    }
    return true;
  }
  // 20201011 E_Add

  printMap() {
    /*
    var content = window.document.getElementById("map"); 
    var newWindow = window.open();
    newWindow.document.write(content.innerHTML); 
    newWindow.print();
    setTimeout(function () { newWindow.print(); newWindow.close(); }, 500);
    */

    // 20231111 S_Update
    // let printWin = window.open('', '');
    // let windowContent = '<!DOCTYPE html>';

    // html2canvas(document.querySelector("#map"), { useCORS: true }).then(canvas => {
    //   windowContent += '<html>'
    //   windowContent += '<head><title>Print canvas</title></head>';
    //   windowContent += '<body>'
    //   windowContent += '<img src="' + canvas.toDataURL() + '">';
    //   windowContent += '</body>';
    //   windowContent += '</html>';
    //   printWin.document.open();
    //   printWin.document.write(windowContent);
    //   printWin.document.close();
    //   printWin.focus();
    //   setTimeout(function () { printWin.print(); printWin.close(); }, 500);
    // });

    $.print(".print-class");
    // 20231111 E_Update
  }

  // 20210425 S_Add
  copyDetail(row: Templandinfo) {
    this.router.navigate(['/bkdetail'], { queryParams: { pid: row.pid, copyFlg: true } });
  }
  // 20210425 E_Add

  // 20230919 S_Add
  filterMap() {
    return this.dataSource.data.filter(item => item.latitude > 0);
  }

  getPickDate(bk) {
    let dayStr = '';
    if (!(bk.pickDate === undefined || bk.pickDate === '' || bk.pickDate == null)) {
      dayStr = this.formatDay(bk.pickDate, 'yyyy/MM/dd');
    }
    return dayStr;
  }

  getSurveyRequestedDay(bk) {
    let dayStr = '';
    if (!(bk.surveyRequestedDay === undefined || bk.surveyRequestedDay === '' || bk.surveyRequestedDay == null)) {
      dayStr = this.formatDay(bk.surveyRequestedDay, 'yyyy/MM/dd');
    }
    return dayStr;
  }

  showBukkenDetail(bk) {
    this.router.navigate(['/bkdetail'], { queryParams: { pid: bk.pid } });
  }
  // 20230919 E_Add
}

