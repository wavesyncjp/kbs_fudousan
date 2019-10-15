import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { User } from '../models/bukken';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public user: User;

  constructor(
    private router: Router,
    public service: BackendService) {
  }

  ngOnInit() {
    this.user = new User();
    this.service.isLoginPage(true);
    this.service.changeTitle('ログイン');
  }

  login() {
    if (!this.user.loginId || this.user.loginId.trim() === '') {
      this.user.msg = '※ログインIDを入力してください。';
      return;
    }
    if (!this.user.password || this.user.password.trim() === '') {
      this.user.msg = '※パスワードを入力してください。';
      return;
    }

    const ret = this.service.login(this.user.loginId, this.user.password).then(res => {
      // ログイン失敗
      if (!res.result) {
        this.user.msg = res.msg;
      } else {
        this.service.setUser(res);
        this.router.navigate(['/bukkens']);
      }
    });
  }

}
