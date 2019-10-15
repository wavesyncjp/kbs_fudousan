import { Component, ChangeDetectorRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { BackendService } from './backend.service';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('snav', {static: true}) public snav: MatSidenav;

  title = '不動産管理システム';
  isLogin = false;
  mobileQuery: MediaQueryList;

  private mobileQueryListener: () => void;

  constructor(public service: BackendService,
              changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
              private router: Router) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);
  }

  ngOnInit() {
    this.service.changeTitleEvent.subscribe(title => {
      this.title = `不動産管理システム：${title}`;
    });

    this.service.changeLoginPageEvent.subscribe(isLogin => {
      this.isLogin = isLogin;
      if (this.isLogin) {
        this.snav.close();
      }
    });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }

  logout() {
    this.router.navigate(['/login']);
  }

  navigate(url: string) {
    this.router.navigate([`/${url}`]);
  }

}
