declare var google: any;
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
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

  public cond: any;
  search = '0';
  searched = false;
  selectedRowIndex = -1;
  displayedColumns: string[] = ['bukkenNo', 'bukkenName', 'remark1', 'remark2', 'mapFiles', 'pickDate', 'department', 'result', 'detail'];
  dataSource = new MatTableDataSource<Templandinfo>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild(MatTabGroup, {static: true}) tabGroup: MatTabGroup;

  // マップ
  @ViewChild('mapContainer', {static: true}) gmap: ElementRef;
  mapObj: any;
  infowindow: any;
  markers = [];

  constructor(public router: Router,
              private route: ActivatedRoute,
              public service: BackendService,
              public dialog: MatDialog,
              private spinner: NgxSpinnerService) {
                super(router, service);

                this.route.queryParams.subscribe(params => {
                  this.search = params.search;
                });
  }
  ngOnInit() {
    super.ngOnInit();
    this.service.changeTitle('土地情報一覧');
    this.dataSource.paginator = this.paginator;
    this.spinner.show();
    // 初回検索
    this.cond = {
        bukkenNo: '',
        bukkenName: '',
        address: '',
        pickDateMap: new Date(),
        pickDate: '',
        department: [],
        result: ['01']
     };
    if (this.search === '1') {
      this.cond = this.service.searchCondition;
    }

    const funcs = [];
    funcs.push(this.service.getCodes(['001']));
    funcs.push(this.service.getDeps(null));

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

      this.cond.pickDateMap = null;
      this.spinner.hide();
      if (this.search === '1') {
        this.searchBukken();
      }

    });

    this.mapInitializer();
  }

  highlight(row) {
    this.selectedRowIndex = row.pid;
  }

  /**
   * 物件検索
   */
  searchBukken() {
    this.spinner.show();

    this.markers.forEach(marker => {
      marker.setMap(null);
      marker = null;
    });
    this.markers = [];

   
    this.cond.pickDate = this.cond.pickDateMap != null ? this.cond.pickDateMap.toLocaleDateString() : null;
    this.service.searchLand(this.cond).then(res => {
      if (res !== null && res.length > 0) {
        res.forEach(obj => {
          if (obj.department !== null && obj.department !== '') {
            obj.department = this.deps.filter((c) => c.depCode === obj.department).map(c => c.depName)[0];
          }
          if (obj.result !== null && obj.result !== '') {
            const lst = obj.result.split(',');
            obj.result = this.getCode('001').filter((c) => lst.includes(c.codeDetail)).map(c => c.name).join(',');
          }
        });
      }
      this.dataSource.data = res;
      this.dataSource.sort = this.sort;
      this.searched = true;
      this.showMapMarker();
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
    this.service.searchCondition = this.cond;
    this.router.navigate(['/bkdetail'], {queryParams: {pid: row.pid}});
  }

  showDetail2(id: number) {
    this.service.searchCondition = this.cond;
    this.router.navigate(['/bkdetail'], {queryParams: {pid: id}});
  }

  /**
   * 土地新規登録
   */
  createNew() {
    this.service.searchCondition = this.cond;
    this.router.navigate(['/bkdetail']);
  }

  switchTab(event: MatRadioChange) {
    if (event.value === 1) {
      this.tabGroup.selectedIndex = 0;
    } else {
      this.tabGroup.selectedIndex = 1;
    }
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

  showMapMarker() {
     this.dataSource.data.forEach(bk => {
      const addr = bk.remark1.split(',')[0];
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
   setMarker(latlng: any, bk: Templandinfo) {
    const marker = new google.maps.Marker({
      position: latlng,
      map: this.mapObj
    });

    marker.addListener('click', function() {

      let dayStr = '';
      if (!(bk.pickDate === undefined || bk.pickDate === '' || bk.pickDate == null)) {
        const parseVal = new Date(bk.pickDate);
        dayStr = parseVal.toLocaleDateString();
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
                      <tr><th class="label">所在地</th><th>${bk.remark1.split(',')[0]}</th></tr>
                      <tr><th class="label">地番</th><th>${bk.remark2.split(',')[0]}</th></tr>
                      <tr><th class="label">地図情報</th><th>${linkStr.join('   ')}</th></tr>
                      <tr><th><br></th><th></th></tr>
                      <tr><th class="label">情報収集日</th><th>${dayStr}</th></tr>
                      <tr><th class="label">担当部署</th><th>${bk.department}</th></tr>
                    </table>
                  </div>`
      });
      infowindow.open(this.mapObj, marker);
    });
    this.markers.push(marker);
  }

  // マップエンド

}
