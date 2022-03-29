import { Injectable, EventEmitter, Output, Directive } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User, Code, Department, CodeNameMst, PaymentType, ReceiveType, Kanjyo, KanjyoFix, Bank} from './models/bukken';// 20210916 Add
import { Planinfo } from './models/planinfo';
import { Templandinfo, LandPlanInfo } from './models/templandinfo';
import { Information } from './models/information';
import { Contractinfo } from './models/contractinfo';
import { Converter } from './utils/converter';
import { Locationinfo } from './models/locationinfo';
import { Contractdetailinfo } from './models/contractdetailinfo';
import { Paycontractinfo } from './models/paycontractinfo';
import { Receivecontractinfo } from './models/receivecontractinfo';
import { Tax } from './models/tax';
import { ContractSellerInfo } from './models/contractsellerinfo';
import { Bukkensalesinfo } from './models/bukkensalesinfo';
import { Planinfohistory } from './models/Planinfohistory';
import { Planhistorylist } from './models/Planhistorylist';
import { Paycontractdetailinfo } from './models/paycontractdetailinfo';
import { Sorting } from './models/sorting';

@Directive()
@Injectable({
  providedIn: 'root'
})
export class BackendService {

  //private readonly BaseUrl = 'http://localhost/ksb-bds/kbs_backend/api';
  private readonly BaseUrl = 'http://wavesync.tokyo/backend/api';// テスト環境
  //private readonly BaseUrl = 'http://wavesync.site/backend/api';// デモ環境
  //private readonly BaseUrl = 'https://metpro.jp/backend/api';// 本番環境
  public loginUser: User;

  public searchCondition: any;

  constructor(private http: HttpClient) { }

  // tslint:disable-next-line:no-output-native
  @Output() changeTitleEvent: EventEmitter<string> = new EventEmitter();

  @Output() changeLoginPageEvent: EventEmitter<boolean> = new EventEmitter();

  @Output() changeTopPageEvent: EventEmitter<boolean> = new EventEmitter();

  @Output() afterLoginEvent: EventEmitter<boolean> = new EventEmitter();

  /**
   * ログインページ
   * @param isLogin ：ログインページ
   */
  isLoginPage(isLogin: boolean) {
    this.changeLoginPageEvent.emit(isLogin);
  }

  /**
   * ログインチェック
   */
  isLogin() {
    return this.loginUser != null;
  }

  /**
   * ログインページ
   * @param isLogin ：ログインページ
   */
  isTopPage(isTop: boolean) {
    this.changeTopPageEvent.emit(isTop);
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
    this.afterLoginEvent.emit(true);
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
   * 土地情報検索
   */
  searchLand(body: any): Promise<Templandinfo[]> {
    const searchLandApi = 'landsearch.php';
    const req = this.http.post<Templandinfo[]>(`${this.BaseUrl}/${searchLandApi}`, body);
    return req.toPromise();
  }

  /**
   * 土地情報取得
   * @param id 土地Id
   */
  getLand(id: number): Promise<Templandinfo> {
    const getLandApi = 'landget.php';
    const body = {
      pid: id
    };
    const req = this.http.post<Templandinfo>(`${this.BaseUrl}/${getLandApi}`, body);
    return req.toPromise();
  }  

  /**
   * 土地情報一覧取得
   * @param id 土地Id
   */
  getLands(name: string): Promise<Templandinfo[]> {
    const getLandApi = 'getland.php';
    const body = { bukkenName: name };
    const req = this.http.post<Templandinfo[]>(`${this.BaseUrl}/${getLandApi}`, body);
    return req.toPromise();
  }

  /**
   * 契約情報検索
   */
  searchContract(body: any): Promise<Templandinfo[]> {
    const api = 'landcontactsearch.php';
    const req = this.http.post<Templandinfo[]>(`${this.BaseUrl}/${api}`, body);
    return req.toPromise();
  }

  /**
   * 土地の契約情報取得
   * @param id 土地Id
   */
  getLandContract(id: number): Promise<Contractinfo[]> {
    const searchApi = 'contractsearch.php';
    const body = {
      tempLandInfoPid: id
    };
    const req = this.http.post<Contractinfo[]>(`${this.BaseUrl}/${searchApi}`, body);
    return req.toPromise();
  }

  /**
   * 土地情報登録
   * @param info ：土地情報
   */
  saveLand(info: Templandinfo): Promise<Templandinfo> {
    const saveLandApi = 'landsave.php';
    const req = this.http.post<Templandinfo>(`${this.BaseUrl}/${saveLandApi}`, info);
    return req.toPromise();
  }

  // 20210426 S_Add
  /**
   * 土地情報登録（コピー→保存）
   * @param info ：土地情報
   */
   saveLandByCopy(info: Templandinfo): Promise<Templandinfo> {
    const saveLandApi = 'landsavebycopy.php';
    const req = this.http.post<Templandinfo>(`${this.BaseUrl}/${saveLandApi}`, info);
    return req.toPromise();
  }
  // 20210426 E_Add

  /**
   * 契約情報取得
   */
  getContract(id: number): Promise<Contractinfo> {
    const getApi = 'contractget.php';
    const body = {
      pid: id
    };
    const req = this.http.post<Contractinfo>(`${this.BaseUrl}/${getApi}`, body);
    return req.toPromise();
  }

  /**
   * 契約情報取得
   */
  getContractByLand(id: number): Promise<string[]> {
    const getApi = 'contractGetByLand.php';
    const body = {
      tempLandInfoPid: id
    };
    const req = this.http.post<string[]>(`${this.BaseUrl}/${getApi}`, body);
    return req.toPromise();
  }

  /**
   * 土地情報登録
   * @param info ：土地情報
   */
  saveContract(info: Contractinfo): Promise<Contractinfo> {
    const saveApi = 'contractsave.php';
    const req = this.http.post<Contractinfo>(`${this.BaseUrl}/${saveApi}`, info);
    return req.toPromise();
  }

  /**
   * 部署取得
   */
  getDeps(depCode: string): Promise<Department[]> {
    const getDepApi = 'getdep.php';
    const body = { depCode: depCode };
    const req = this.http.post<Department[]>(`${this.BaseUrl}/${getDepApi}`, body);
    return req.toPromise();
  }

  /**
   * 社員取得
   */
  getEmps(activeUser: string): Promise<User[]> {
    const getDepApi = 'getemployee.php';
    const body = { activeUser: activeUser };
    const req = this.http.post<User[]>(`${this.BaseUrl}/${getDepApi}`, body);
    return req.toPromise();
  }

  /**
   * システムコード取得
   */
  getCodes(codes: string[]): Promise<Code[]> {
    const getCodeApi = 'getcode.php';
    const body = { code: codes };
    const req = this.http.post<Code[]>(`${this.BaseUrl}/${getCodeApi}`, body);
    return req.toPromise();
  }

  /**
   * システムコード名称マスタ取得
   */
  getCodeNameMsts(codes: string[]): Promise<CodeNameMst[]> {
    const getCodeApi = 'getcodenamemst.php';
    const body = { code: codes };
    const req = this.http.post<CodeNameMst[]>(`${this.BaseUrl}/${getCodeApi}`, body);
    return req.toPromise();
  }

  /**
   * 支払種別取得
   */
  getPaymentTypes(paymentCode: string): Promise<PaymentType[]> {
    const getDepApi = 'getpaymenttype.php';
    const body = { paymentCode: paymentCode };
    const req = this.http.post<PaymentType[]>(`${this.BaseUrl}/${getDepApi}`, body);
    return req.toPromise();
  }

  // 20210916 S_Add
  /**
   * 入金種別取得
   */
  getReceiveTypes(receiveCode: string): Promise<ReceiveType[]> {
    const getDepApi = 'getpreceivetype.php';
    const body = { receiveCode: receiveCode };
    const req = this.http.post<ReceiveType[]>(`${this.BaseUrl}/${getDepApi}`, body);
    return req.toPromise();
  }
  // 20210916 E_Add

  /**
   * 消費税マスタ取得
   */
  getTaxes(id: number): Promise<Tax[]> {
    const getTaxesApi = 'gettax.php';
    const body = { pid: id };
    const req = this.http.post<Tax[]>(`${this.BaseUrl}/${getTaxesApi}`, body);
    return req.toPromise();
  }

  /**
   * システムコード名称取得
   */
    /*
  getCodeNames(codes: string[]): Promise<Code[]> {
    const getCodeApi = 'getcode.php';
    const body = { code: codes };
    const req = this.http.post<Code[]>(`${this.BaseUrl}/${getCodeApi}`, body);
    return req.toPromise();
  }
  */

  /**
   * 帳票出力
   */
  export(): void {
    const downloadUrl = 'contractexport.php';
    this.http.post(`${this.BaseUrl}/${downloadUrl}`, {}, { responseType: 'blob' as 'blob' }).pipe(map((data: any) => {
      const blob = new Blob([data], {
        type: 'application/octet-stream'
      });

      const convert = new Converter();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = convert.formatDay(new Date(), 'yyyyMMddHHmmss') + '.xlsx';
      link.click();
      window.URL.revokeObjectURL(link.href);

    })).subscribe(res => {
    });
  }

  /**
   * 契約書出力
   * @param contractPid 契約Pid
   */
  exportContract(contractPid: number, templatePid: any): Promise<Blob> {
    const downloadUrl = 'contractexport.php';
    // tslint:disable-next-line:max-line-length
    const res = this.http.post(`${this.BaseUrl}/${downloadUrl}`, {pid: contractPid, templatePid: templatePid}, { responseType: 'blob' as 'blob' });
    return res.toPromise();
  }

  /**
   * 収支帳票
   * @param pid 収支Pid
   */
  exportPlan(planPid: number): Promise<Blob> {
    const downloadUrl = 'planexport.php';
    const res = this.http.post(`${this.BaseUrl}/${downloadUrl}`, {pid: planPid}, { responseType: 'blob' as 'blob' });
    return res.toPromise();
  }

  /**
   * 売買取引管理表　出力
   * @param pid 物件
   */
  exportSale(pid: number): Promise<Blob> {
    const downloadUrl = 'saleexport.php';
    const res = this.http.post(`${this.BaseUrl}/${downloadUrl}`, {pid: pid}, { responseType: 'blob' as 'blob' });
    return res.toPromise();
  }

  // 20210524 S_Add
  /**
   * 取引成立台帳　出力
   * @param pid 物件
   */
  exportTransaction(pid: number): Promise<Blob> {
    const downloadUrl = 'transactionexport.php';
    const res = this.http.post(`${this.BaseUrl}/${downloadUrl}`, {pid: pid}, { responseType: 'blob' as 'blob' });
    return res.toPromise();
  }
  // 20210524 E_Add

  writeToFile(data: any, fileName: string = '') {
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });

    if(fileName !== '') {
      fileName = fileName.replace('.xlsx', '') + '_';
    }

    const convert = new Converter();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName + convert.formatDay(new Date(), 'yyyyMMddHHmmss') + '.xlsx';
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  /**
   * ファイルアップロード
   * @param bukkenId ：物件ID
   * @param file ：ファイル
   */
  uploadFile(bukkenId: number, file: File, hasComment = false, comment = ''): Promise<object> {
    const uploadApi = 'file_upload.php';
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('bukkenId', bukkenId.toString());
    if (hasComment) {
      formData.append('comment', comment);
      formData.append('isAttach', '1');
    }
    return this.http.post(`${this.BaseUrl}/${uploadApi}`, formData).toPromise();
  }

  /**
   * 契約ファイルアップロード
   * @param contractInfoId ：契約ID
   * @param file ；ファイル
   */
  uploadContractFile(contractInfoId: number, file: File): Promise<object> {
    const uploadApi = 'contractFileUpload.php';
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('contractInfoId', contractInfoId.toString());
    return this.http.post(`${this.BaseUrl}/${uploadApi}`, formData).toPromise();
  }

  // 20210311 S_Add
  /**
   * 謄本ファイルアップロード
   * @param locationInfoId ：所在地情報ID
   * @param file ；ファイル
   */
  uploadLocationFile(locationInfoId: number, file: File): Promise<object> {
    const uploadApi = 'locationFileUpload.php';
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('locationInfoId', locationInfoId.toString());
    return this.http.post(`${this.BaseUrl}/${uploadApi}`, formData).toPromise();
  }
  // 20210311 E_Add

  // 20220329 S_Add
  /**
   * インフォメーション添付ファイルアップロード
   * @param infoPid ：インフォメーションPid
   * @param file ；ファイル
   */
   uploadInfoAttachFile(infoPid: number, file: File): Promise<object> {
    const uploadApi = 'infoAttachFileUpload.php';
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('infoPid', infoPid.toString());
    return this.http.post(`${this.BaseUrl}/${uploadApi}`, formData).toPromise();
  }
  // 20220329 E_Add

  /**
   * インフォメーションファイルアップロード
   * @param infoPid ：インフォメーションPid
   * @param file ：ファイル
   */
  uploadInfoFile(infoPid: number, file: File) {
    const uploadApi = 'infofile_upload.php';
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('infoId', infoPid.toString());
    return this.http.post(`${this.BaseUrl}/${uploadApi}`, formData).toPromise();
  }

  // 20211227 S_Add
    /**
   * 承認済ファイルアップロード
   * @param infoPid ：インフォメーションPid
   * @param file ：ファイル
   */
  uploadApprovedInfoFile(infoPid: number, file: File) {
    const uploadApi = 'approvedfile_upload.php';
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('infoId', infoPid.toString());
    return this.http.post(`${this.BaseUrl}/${uploadApi}`, formData).toPromise();
  }
  // 20211227 E_Add

  /**
   * システムコード取得
   */
  deleteFile(id: number, attach: boolean): Promise<object> {
    const deleteFileApi = 'deletefile.php';
    const body = { pid: id, isAttach: attach };
    const req = this.http.post<Code[]>(`${this.BaseUrl}/${deleteFileApi}`, body);
    return req.toPromise();
  }

  /**
   * 契約ファイル削除
   * @param id : 契約ID
   */
  deleteContractFile(id: number): Promise<object> {
    const deleteFileApi = 'deleteContractFile.php';
    const body = { pid: id };
    const req = this.http.post<Code[]>(`${this.BaseUrl}/${deleteFileApi}`, body);
    return req.toPromise();
  }

  // 20210311 S_Add
  /**
   * 謄本添付ファイル削除
   * @param id : 所在地情報ID
   */
  deleteLocationFile(id: number): Promise<object> {
    const deleteFileApi = 'deleteLocationFile.php';
    const body = { pid: id };
    const req = this.http.post<Code[]>(`${this.BaseUrl}/${deleteFileApi}`, body);
    return req.toPromise();
  }
  // 20210311 E_Add

  // 20220329 S_Add
  /**
   * 掲示板添付ファイル削除
   * @param id : 掲示板添付ファイルID
   */
   deleteInfoAttachFile(id: number): Promise<object> {
    const deleteFileApi = 'deleteInfoAttachFile.php';
    const body = { pid: id };
    const req = this.http.post<Code[]>(`${this.BaseUrl}/${deleteFileApi}`, body);
    return req.toPromise();
  }
  // 20220329 E_Add

  /**
   *  インフォメーション情報検索
   */
  searchInfo(cond: any): Promise<Information[]> {
    const searchApi = 'infosearch.php';
    const req = this.http.post<Information[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * インフォメーション情報登録
   * @param info ：インフォメーション情報
   */
  saveInfo(info: Information): Promise<Information> {
    const saveApi = 'infosave.php';
    const req = this.http.post<Information>(`${this.BaseUrl}/${saveApi}`, info);
    return req.toPromise();
  }

  /**
   * インフォメーション情報削除
   * @param id : 削除したいId
   */
  deleteInfo(id: number): Promise<void> {
    const deleteApi = 'infodelete.php';
    const req = this.http.post<void>(`${this.BaseUrl}/${deleteApi}`, { pid: id, deleteUserId: this.loginUser.userId });
    return req.toPromise();
  }

  /**
   * 部署取得
   */
  searchDep(cond: any): Promise<Department[]> {
    const searchApi = 'depsearch.php';
    const req = this.http.post<Department[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 部署情報登録
   * @param dep ：部署情報
   */
  saveDep(dep: Department): Promise<Department> {
    const saveApi = 'depsave.php';
    const req = this.http.post<Department>(`${this.BaseUrl}/${saveApi}`, dep);
    return req.toPromise();
  }

  /**
   * 部署情報削除
   * @param depCode : 削除したいdepCode
   */
  deleteDep(depCode: string): Promise<void> {
    const deleteApi = 'depdelete.php';
    const req = this.http.post<void>(`${this.BaseUrl}/${deleteApi}`, { depCode: depCode, deleteUserId: this.loginUser.userId });
    return req.toPromise();
  }

  /**
   * 社員取得
   */
  searchUser(cond: any): Promise<User[]> {
    const searchApi = 'usersearch.php';
    const req = this.http.post<User[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 社員情報登録
   * @param user ：社員情報
   */
  saveUser(user: User): Promise<User> {
    const saveApi = 'usersave.php';
    const req = this.http.post<User>(`${this.BaseUrl}/${saveApi}`, user);
    return req.toPromise();
  }

  /**
   * 社員情報削除
   * @param userId : 削除したいuserId
   */
  deleteUser(userId: number): Promise<void> {
    const deleteApi = 'userdelete.php';
    const req = this.http.post<void>(`${this.BaseUrl}/${deleteApi}`, { userId: userId, deleteUserId: this.loginUser.userId });
    return req.toPromise();
  }

  /**
   * コード取得
   */
  searchCode(cond: any): Promise<Code[]> {
    const searchApi = 'codesearch.php';
    const req = this.http.post<Code[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * コード情報登録
   * @param code ：コード情報
   */
  saveCode(code: Code): Promise<Code> {
    const saveApi = 'codesave.php';
    const req = this.http.post<Code>(`${this.BaseUrl}/${saveApi}`, code);
    return req.toPromise();
  }

  /**
   * コード情報削除
   * @param code : 削除したいcode
   */
  deleteCode(code: string, codeDetail: string): Promise<void> {
    const deleteApi = 'codedelete.php';
    const req = this.http.post<void>(`${this.BaseUrl}/${deleteApi}`, { code: code, codeDetail: codeDetail, deleteUserId: this.loginUser.userId });
    return req.toPromise();
  }

  /**
   * 所有者出力
   * @param sharers ：所有者
   */
  saveChooseSharer(sharerList: any, ctDetail: Contractdetailinfo) {
    const api = 'shareroutputsave.php';
    const body = {
      userId: this.loginUser.userId,
      sharers: sharerList,
      contractDetail: ctDetail
    };
    const req = this.http.post<Code>(`${this.BaseUrl}/${api}`, body);
    return req.toPromise();
  }

  /**
   * 所有地保存
   * @param loc　：所有地
   */
  saveLocation(locSave: Locationinfo) {
    const api = 'locationsave.php';
    const req = this.http.post(`${this.BaseUrl}/${api}`, locSave);
    return req.toPromise();
  }

  /**
   * 所有地削除
   * @param data ：所有地
   */
  deleteLocation(data: Locationinfo) {
    const api = 'locdelete.php';
    const req = this.http.post<any>(`${this.BaseUrl}/${api}`, {pid: data.pid, userPid: this.loginUser.userId});
    return req.toPromise();
  }

  /**
   * 所在地情報取得
   * @param cond 所在地情報取得
   */
  searchLocation(cond: any): Promise<Locationinfo[]> {
    const searchApi = 'locsearch.php';
    const req = this.http.post<Locationinfo[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 支払種別取得
   */
  searchPaymentType(cond: any): Promise<PaymentType[]> {
    const searchApi = 'paymenttypesearch.php';
    const req = this.http.post<PaymentType[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 支払種別登録
   * @param paymentType ：支払種別
   */
  savePaymentType(paymentType: PaymentType): Promise<PaymentType> {
    const saveApi = 'paymenttypesave.php';
    const req = this.http.post<PaymentType>(`${this.BaseUrl}/${saveApi}`, paymentType);
    return req.toPromise();
  }

  /**
   * 支払種別削除
   * @param paymentCode : 支払コード
   */
  deletePaymentType(paymentCode: string): Promise<void> {
    const deleteApi = 'paymenttypedelete.php';
    const req = this.http.post<void>(`${this.BaseUrl}/${deleteApi}`, { paymentCode: paymentCode, deleteUserId: this.loginUser.userId });
    return req.toPromise();
  }

  // 20210916 S_Add
  /**
   * 入金種別取得
   */
  searchReceiveType(cond: any): Promise<ReceiveType[]> {
    const searchApi = 'receivetypesearch.php';
    const req = this.http.post<ReceiveType[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 入金種別登録
   * @param receiveType ：入金種別
   */
  saveReceiveType(receiveType: ReceiveType): Promise<ReceiveType> {
    const saveApi = 'receivetypesave.php';
    const req = this.http.post<ReceiveType>(`${this.BaseUrl}/${saveApi}`, receiveType);
    return req.toPromise();
  }

  /**
   * 入金種別削除
   * @param receiveCode : 入金コード
   */
  deleteReceiveType(receiveCode: string): Promise<void> {
    const deleteApi = 'receivetypedelete.php';
    const req = this.http.post<void>(`${this.BaseUrl}/${deleteApi}`, { receiveCode: receiveCode, deleteUserId: this.loginUser.userId });
    return req.toPromise();
  }
  // 20210916 E_Add

  /**
   * 事業収支一覧取得
   */
  searchPlan(cond: any): Promise<Planinfo[]> {
    const searchApi = 'plansearch.php';
    const req = this.http.post<Planinfo[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  // 20200805 S_Add
  /**
   * 事業収支一覧取得（グリッド用）
   */
  searchPlanForGrid(cond: any): Promise<Planinfo[]> {
    const searchApi = 'plansearchforgrid.php';
    const req = this.http.post<Planinfo[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }
  // 20200805 E_Add

  /**
   * 事業収支履歴一覧取得（グリッド用）
   */
  searchPlanHistoryForGrid(cond: any): Promise<Planinfohistory[]> {
    const searchApi = 'planhistorysearchforgrid.php';
    const req = this.http.post<Planinfohistory[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 事業収支登録
   * @param plan ：事業収支
   */
  savePlan(plan: Planinfo): Promise<Planinfo> {
    const saveApi = 'plansave.php'; 
    const req = this.http.post<Planinfo>(`${this.BaseUrl}/${saveApi}`, plan);
    return req.toPromise();
  }

  /**
   * 事業収支履歴登録
   * @param planhistory ：事業収支履歴
   */
  savePlanHistory(planhistory: Planinfohistory): Promise<Planinfohistory> {
    const saveApi = 'planhistorysave.php'; 
    const req = this.http.post<Planinfohistory>(`${this.BaseUrl}/${saveApi}`, planhistory);
    return req.toPromise();
  }

  /**
   * 事業収支取得
   * @param id 事業収支情報Id
   */
  getPlan(id: number): Promise<Planinfo> {
    const getApi = 'planget.php';
    const body = {
      pid: id
    };
    const req = this.http.post<Planinfo>(`${this.BaseUrl}/${getApi}`, body);
    return req.toPromise();
  }

  /**
   * 事業収支履歴取得
   * @param id ：事業収支情報履歴Id
   */
  getPlanHistory(id: number): Promise<Planinfohistory[]> {
    const getApi = 'planhistoryget.php';
    const body = {
      pid: id
    };
    const req = this.http.post<Planinfohistory[]>(`${this.BaseUrl}/${getApi}`, body);
    return req.toPromise();
  }

  /**
   * 事業収支履歴取得（PopUp用）
   * @param id ：事業収支情報履歴Id
   */
  getPlanHistoryList(id: number): Promise<Planhistorylist[]> {
    
    const getApi = 'planhistorylistget.php';
    const body = {
      pid: id
    };
    const req = this.http.post<Planhistorylist[]>(`${this.BaseUrl}/${getApi}`, body);
    return req.toPromise();
  }

  /**
   * 事業収支削除
   * @param id : 事業収支情報Id
   */
  deletePlan(id: number): Promise<void> {
    const deleteApi = 'plandelete.php';
    const req = this.http.post<void>(`${this.BaseUrl}/${deleteApi}`, { pid: id, deleteUserId: this.loginUser.userId });
    return req.toPromise();
  }

  /**
   * 支払管理一覧取得
   */
  searchPayContract(cond: any): Promise<Paycontractinfo[]> {
    const searchApi = 'paycontractsearch.php';
    const req = this.http.post<Paycontractinfo[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 支払管理取得
   * @param id 支払管理情報Id
   */
  getPayContract(id: number): Promise<Paycontractinfo> {
    const getApi = 'paycontractget.php';
    const body = {
      pid: id
    };
    const req = this.http.post<Paycontractinfo>(`${this.BaseUrl}/${getApi}`, body);
    return req.toPromise();
  }

  /**
   * 支払管理登録
   * @param PayContract ：支払種別
   */
  savePayContract(PayContract: Paycontractinfo): Promise<Paycontractinfo> {
    const saveApi = 'paycontractsave.php';
    const req = this.http.post<Paycontractinfo>(`${this.BaseUrl}/${saveApi}`, PayContract);
    return req.toPromise();
  }

  /**
   * 支払管理削除
   * @param id 支払管理情報Id
   */
  deletePayContracte(id: number): Promise<void> {
    const deleteApi = 'paycontractdelete.php';
    const req = this.http.post<any>(`${this.BaseUrl}/${deleteApi}`, {pid: id, deleteUserId: this.loginUser.userId});
    return req.toPromise();
  }

  /**
   * 入金管理一覧取得
   */
  searchReceiveContract(cond: any): Promise<Receivecontractinfo[]> {
    const searchApi = 'receivecontractsearch.php';
    const req = this.http.post<Receivecontractinfo[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 入金管理取得
   * @param id 入金管理情報Id
   */
  getReceiveContract(id: number): Promise<Receivecontractinfo> {
    const getApi = 'receivecontractget.php';
    const body = {
      pid: id
    };
    const req = this.http.post<Receivecontractinfo>(`${this.BaseUrl}/${getApi}`, body);
    return req.toPromise();
  }

  /**
   * 入金管理登録
   * @param ReceiveContract ：入金種別
   */
  saveReceiveContract(ReceiveContract: Receivecontractinfo): Promise<Receivecontractinfo> {
    const saveApi = 'receivecontractsave.php';
    const req = this.http.post<Receivecontractinfo>(`${this.BaseUrl}/${saveApi}`, ReceiveContract);
    return req.toPromise();
  }

  /**
   * 入金管理削除
   * @param id 入金管理情報Id
   */
  deleteReceiveContracte(id: number): Promise<void> {
    const deleteApi = 'receivecontractdelete.php';
    const req = this.http.post<any>(`${this.BaseUrl}/${deleteApi}`, {pid: id, deleteUserId: this.loginUser.userId});
    return req.toPromise();
  }
  // 20210314 S_Add

  /**
   * 契約情報削除
   * @param id 契約情報Id
   */
  deleteContract(id: number): Promise<void> {
    const deleteApi = 'contractdelete.php';
    const req = this.http.post<any>(`${this.BaseUrl}/${deleteApi}`, {pid: id, deleteUserId: this.loginUser.userId});
    return req.toPromise();
  }
  // 20210314 E_Add

  /**
   * 物件契約者取得
   * @param tempLandInfoPid 物件Id
   */
  getBukkenSeller(tempLandInfoPid: number): Promise<ContractSellerInfo[]> {
    const api = 'sellerget.php';
    const req = this.http.post<ContractSellerInfo[]>(`${this.BaseUrl}/${api}`, {tempLandInfoPid: tempLandInfoPid});
    return req.toPromise();
  }

  /**
   * プラン情報取得
   * @param id 土地Id
   */
  getLandPlan(id: number): Promise<LandPlanInfo> {
    const getLandApi = 'landplanget.php';
    const body = {
      pid: id
    };
    const req = this.http.post<LandPlanInfo>(`${this.BaseUrl}/${getLandApi}`, body);
    return req.toPromise();
  }

  /**
   * 事業収支登録
   * @param plan ：事業収支
   */
  saveLandPlan(plan: LandPlanInfo): Promise<LandPlanInfo> {
    const saveApi = 'lanplansave.php'; 
    const req = this.http.post<LandPlanInfo>(`${this.BaseUrl}/${saveApi}`, plan);
    return req.toPromise();
  }

  /**
   * 売り契約登録
   * @param sale 売り契約
   */
  saveBukkenSale(sale: Bukkensalesinfo): Promise<Bukkensalesinfo> {
    const saveApi = 'lansalesave.php'; 
    const req = this.http.post<Bukkensalesinfo>(`${this.BaseUrl}/${saveApi}`, sale);
    return req.toPromise();
  }

  /**
   * 契約書
   */
  loadContractTemplate(data: any):  Promise<any[]>{
    const api = 'contracttemplate.php'; 
    const req = this.http.post<any[]>(`${this.BaseUrl}/${api}`, data);
    return req.toPromise();
  }

  /**
   * CSV選択
   */
  loadCsvTemplate(data: any):  Promise<any[]>{
    const api = 'csvtemplate.php'; 
    const req = this.http.post<any[]>(`${this.BaseUrl}/${api}`, data);
    return req.toPromise();
  }

  /**
   * CSV出力
   * @param id 物件ID
   * @param csvCode csvCode
   */
  exportCsv(ids: Number[], csvCode) : Promise<any> {
    const api = 'csvexport.php'; 
    let param = {
      ids: ids.join(','),
      csvCode: csvCode
    }
    const req = this.http.post<any>(`${this.BaseUrl}/${api}`, param);
    return req.toPromise();
  }

  // 20210628 S_Add
  /**
   * 勘定科目取得
   */
  searchKanjyo(cond: any): Promise<Kanjyo[]> {
    const searchApi = 'kanjyosearch.php';
    const req = this.http.post<Kanjyo[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 勘定科目登録
   * @param kanjyo ：勘定コード
   */
  saveKanjyo(kanjyo: Kanjyo): Promise<Kanjyo> {
    const saveApi = 'kanjyosave.php';
    const req = this.http.post<Kanjyo>(`${this.BaseUrl}/${saveApi}`, kanjyo);
    return req.toPromise();
  }
  
  /**
   * 勘定科目削除
   * @param kanjyoCode : 削除したいkanjyoCode
   */
  deleteKanjyo(kanjyoCode :string): Promise<void> {
    const deleteApi = 'kanjyodelete.php';
    const req = this.http.post<void>(`${this.BaseUrl}/${deleteApi}`, { kanjyoCode: kanjyoCode, deleteUserId: this.loginUser.userId });
    return req.toPromise();
  }

  /**
   * 勘定コード取得
   */
   getKanjyos(kanjyoCode: string): Promise<Kanjyo[]> {
    const getKanjyoApi = 'getkanjyo.php';
    const body = { kanjyoCode: kanjyoCode };
    const req = this.http.post<Kanjyo[]>(`${this.BaseUrl}/${getKanjyoApi}`, body);
    return req.toPromise();
  }

  /**
   * 貸方借方決定マスタ取得
   */
   searchKanjyoFix(cond: any): Promise<KanjyoFix[]> {
    const searchApi = 'kanjyofixsearch.php';
    const req = this.http.post<KanjyoFix[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 貸方借方決定マスタ登録
   * @param kanjyoFix
   */
  saveKanjyoFix(kanjyoFix: KanjyoFix): Promise<KanjyoFix> {
    const saveApi = 'kanjyofixsave.php';
    const req = this.http.post<KanjyoFix>(`${this.BaseUrl}/${saveApi}`, kanjyoFix);
    return req.toPromise();
  }
  
  /**
   * 貸方借方決定マスタ削除
   * @param id : 削除したいpid
   */
  deleteKanjyoFix(id :number): Promise<void> {
    const deleteApi = 'kanjyofixdelete.php';
    const req = this.http.post<void>(`${this.BaseUrl}/${deleteApi}`, { pid: id, deleteUserId: this.loginUser.userId });
    return req.toPromise();
  }
  // 20210628 E_Add

  // 20210719 S_Add
  /**
   * FB連携CSV発行データ取得
   */
  searchFb(cond: any): Promise<Paycontractdetailinfo[]> {
    const searchApi = 'fbsearch.php';
    const req = this.http.post<Paycontractdetailinfo[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 会計連携用CSV出力データ取得
   */
  searchSorting(cond: any): Promise<Sorting[]> {
    const searchApi = 'sortingsearch.php';
    const req = this.http.post<Sorting[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * FB承認
   * @param id 支払管理明細情報ID
   */
  fbApproval(ids: Number[]) : Promise<any> {
    const api = 'fbapproval.php';
    const param = {
      ids: ids
      ,updateUserId: this.loginUser.userId
    }
    const req = this.http.post<any>(`${this.BaseUrl}/${api}`, param);
    return req.toPromise();
  }

  /**
   * 出力日時設定
   * @param id 対象テーブルID
   * @param id 対象カラム名
   */
  setOutPutDate(ids: Number[], target: string) : Promise<any> {
    const api = 'setoutputdate.php';
    const param = {
      ids: ids
      ,target: target
      ,updateUserId: this.loginUser.userId
    }
    const req = this.http.post<any>(`${this.BaseUrl}/${api}`, param);
    return req.toPromise();
  }
  // 20210719 E_Add

  // 20210831 S_Add
  /**
   * 銀行マスタ取得
   */
   searchBank(cond: any): Promise<Bank[]> {
    const searchApi = 'banksearch.php';
    const req = this.http.post<Bank[]>(`${this.BaseUrl}/${searchApi}`, cond);
    return req.toPromise();
  }

  /**
   * 銀行マスタ登録
   * @param kanjyoFix
   */
  saveBank(bank: Bank): Promise<Bank> {
    const saveApi = 'banksave.php';
    const req = this.http.post<Bank>(`${this.BaseUrl}/${saveApi}`, bank);
    return req.toPromise();
  }
  
  /**
   * 銀行マスタ削除
   * @param id : 削除したいpid
   */
  deleteBank(id :number): Promise<void> {
    const deleteApi = 'bankdelete.php';
    const req = this.http.post<void>(`${this.BaseUrl}/${deleteApi}`, { pid: id, deleteUserId: this.loginUser.userId });
    return req.toPromise();
  }
  // 20210831 E_Add
  // 20210905 S_Add
  /**
   * 銀行マスタ取得
   */
   getBanks(contractType: string): Promise<Bank[]> {
    const getDepApi = 'getbank.php';
    const body = { contractType: contractType };
    const req = this.http.post<Bank[]>(`${this.BaseUrl}/${getDepApi}`, body);
    return req.toPromise();
  }
  // 20210905 E_Add
  // 20211020 S_Add
  /**
   * 決済案内出力
   * @param ids 契約Pid
   */
  /*
  exportBuyInfo(contractPid: number): Promise<Blob> {
    const downloadUrl = 'buyinfoexport.php';
    const res = this.http.post(`${this.BaseUrl}/${downloadUrl}`, {pid: contractPid}, { responseType: 'blob' as 'blob' });
    return res.toPromise();
  }
  */
  exportBuyInfo(ids: number[]): Promise<Blob> {
    const downloadUrl = 'buyinfoexport.php';
    const res = this.http.post(`${this.BaseUrl}/${downloadUrl}`, {ids: ids}, { responseType: 'blob' as 'blob' });
    return res.toPromise();
  }
  // 20211020 E_Add
}
