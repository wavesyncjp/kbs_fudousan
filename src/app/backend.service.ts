import { Injectable, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient} from '@angular/common/http';
import { Bukken, User, Code } from './models/bukken';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private readonly BaseUrl = 'http://localhost/koshiba_bds/Backend/api';
  // private readonly BaseUrl = 'http://wavesync.tokyo/backend/api';
  private loginUser: User;

  constructor(private http: HttpClient) { }

  // tslint:disable-next-line:no-output-native
  @Output() changeTitleEvent: EventEmitter<string> = new EventEmitter();

  @Output() changeLoginPageEvent: EventEmitter<boolean> = new EventEmitter();

  /**
   * ログインページ
   * @param isLogin ：ログインページ
   */
  isLoginPage(isLogin: boolean) {
    this.changeLoginPageEvent.emit(isLogin);
  }
  /**
   * ページタイトル変更（ページ遷移）
   * @param title ページタイトル
   */
  changeTitle(title: string) {
    this.changeTitleEvent.emit(title);
  }

  /**
   * ログインユーザー保持
   * @param user: ログインユーザー
   */
  setUser(user: User) {
    this.loginUser = user;
  }

  /**
   * ログイン
   * @param userId ログインユーザーID
   * @param password ログインパスワード
   */
  login(userId: string, password: string): Promise<User> {
    const loginApi = 'login.php';
    const body = {
      id: userId,
      pwd: password
    };
    const req = this.http.post<User>(`${this.BaseUrl}/${loginApi}`, body);
    return req.toPromise();
  }

  /**
   * ログインされているかどうかをチェック
   */
  checkLogin(): Observable<string> {
    const checkLogin = 'checklogin.php';
    const body = {
      userId: (this.loginUser ? this.loginUser.userId : ''),
      token: (this.loginUser ? this.loginUser.token : '')
    };
    return this.http.post<string>(`${this.BaseUrl}/${checkLogin}`, body);
  }

  /**
   * 物件検索
   */
  searchBukken(): Promise<Bukken[]> {
    const searchBukkenApi = 'bukken_search.php';
    const body = {};
    const req = this.http.post<Bukken[]>(`${this.BaseUrl}/${searchBukkenApi}`, body);
    return req.toPromise();
  }

  /**
   * システムコード取得
   */
  getCodes(codes: []): Promise<Code[]> {
    const getCodeApi = 'getcode.php';
    const body = {code: codes};
    const req = this.http.post<Code[]>(`${this.BaseUrl}/${getCodeApi}`, body);
    return req.toPromise();
  }

  /**
   * 帳票出力
   */
  export(): void {
    const downloadUrl = 'export_excel.php';
    this.http.get(`${this.BaseUrl}/${downloadUrl}`, {responseType: 'blob' as 'blob'}).pipe(map((data: any) => {
      const blob = new Blob([data], {
        type: 'application/octet-stream'
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'samplePDFFile.xlsx';
      link.click();
      window.URL.revokeObjectURL(link.href);

    })).subscribe(res => {
    });
  }

  /**
   * ファイルアップロード
   * @param bukkenId ：物件ID
   * @param file ：ファイル
   */
  uploadFile(bukkenId: number, file: File): Promise<object> {
    const uploadApi = 'file_upload.php';

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('bukkenId', bukkenId.toString());
    return this.http.post(`${this.BaseUrl}/${uploadApi}`, formData).toPromise();

  }

}
