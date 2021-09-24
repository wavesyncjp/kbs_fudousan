import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, MatExpansionModule, MatCardModule, MatToolbarModule, MatSidenavModule, MatListModule,
         MatTableModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDialogModule,
         MatGridListModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatSelectModule, MatSnackBarModule, MatCheckboxModule,
         MatTabsModule, MatSortModule
       } from '@angular/material';
import { BukkenListComponent } from './bukken-list/bukken-list.component';
import { BukkenDetailComponent } from './bukken-detail/bukken-detail.component';
import { BukkenUpdateComponent } from './bukken-update/bukken-update.component';// 20210207 Add
import { NgxSpinnerModule } from 'ngx-spinner';
import { ContractListComponent } from './contract-list/contract-list.component';
import { ContractDetailComponent } from './contract-detail/contract-detail.component';
import { SelectComponentComponent } from './uicomponent/select-component/select-component.component';
import { FileComponentComponent } from './uicomponent/file-component/file-component.component';
import { ConfirmDialogComponent } from './dialog/confirm-dialog/confirm-dialog.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TopComponent } from './top/top.component';
import { InfoDialogComponent } from './dialog/info-dialog/info-dialog.component';
import { InfoListComponent } from './info-list/info-list.component';
import { InfoDetailComponent } from './info-detail/info-detail.component';
import { DepListComponent } from './dep-list/dep-list.component';
import { DepDetailComponent } from './dep-detail/dep-detail.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { CodeListComponent } from './code-list/code-list.component';
import { CodeDetailComponent } from './code-detail/code-detail.component';
import { FinishDialogComponent } from './dialog/finish-dialog/finish-dialog.component';
import { DatePipe } from '@angular/common';
import { SharerDialogComponent } from './dialog/sharer-dialog/sharer-dialog.component';
import { LocationDetailComponent } from './location-detail/location-detail.component';
import { PaymentTypeListComponent } from './paymentType-list/paymentType-list.component';
import { PaymentTypeDetailComponent } from './paymentType-detail/paymentType-detail.component';
// 20210916 S_Add
import { ReceiveTypeListComponent } from './receiveType-list/receiveType-list.component';
import { ReceiveTypeDetailComponent } from './receiveType-detail/receiveType-detail.component';
// 20210916 E_Add
// 20200213 S_Add
import { PlanDetailComponent } from './plan-detail/plan-detail.component';
import { PayContractListComponent } from './paycontract-list/paycontract-list.component';
import { PayContractDetailComponent } from './paycontract-detail/paycontract-detail.component';
// 20200213 E_Add
// 20210916 S_Add
import { ReceiveContractListComponent } from './receivecontract-list/receivecontract-list.component';
import { ReceiveContractDetailComponent } from './receivecontract-detail/receivecontract-detail.component';
// 20210916 E_Add
// 20200226 S_Add
import { PlanListComponent } from './plan-list/plan-list.component';
// 20200226 E_Add
import{ BukkenplaninfoDetailComponent } from './bukkenplaninfo-detail/bukkenplaninfo-detail.component';
import{ BukkenplaninfoListComponent } from './bukkenplaninfo-list/bukkenplaninfo-list.component';
import { ContractTemplateComponent } from './contract-template/contract-template.component';
import { CsvTemplateComponent } from './csv-template/csv-template.component';
import { ErrorDialogComponent } from './dialog/error-dialog/error-dialog.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';// 20200731 Add
import { LabelComponentComponent } from './uicomponent/label-component/label-component.component';// 20200907 Add
// 20200911 S_Add
import { PlanHistoryCreateComponent } from './planhistory-create/planhistory-create.component';
import { PlanHistoryListComponent } from './planhistory-list/planhistory-list.component';
import { DndDirective } from './utils/dnd.directive';
// 20200911 E_Add
// 20210628 S_Add
import { KanjyoListComponent } from './kanjyo-list/kanjyo-list.component';
import { KanjyoDetailComponent } from './kanjyo-detail/kanjyo-detail.component';
import { KanjyoFixListComponent } from './kanjyoFix-list/kanjyoFix-list.component';
import { KanjyoFixDetailComponent } from './kanjyoFix-detail/kanjyoFix-detail.component';
// 20210628 E_Add
// 20210719 S_Add
import { FbListComponent } from './fb-list/fb-list.component';
import { FbApprovalListComponent } from './fbApproval-list/fbApproval-list.component';
import { SortingListComponent } from './sorting-list/sorting-list.component';
import { SortingDetailComponent } from './sorting-detail/sorting-detail.component';
// 20210719 E_Add
// 20210831 S_Add
import { BankListComponent } from './bank-list/bank-list.component';
import { BankDetailComponent } from './bank-detail/bank-detail.component';
// 20210831 E_Add
import { CalcKotozeiDetailComponent } from './calcKotozei-detail/calcKotozei-detail.component';

@NgModule({
  declarations: [
    AppComponent
    , LoginComponent
    , BukkenListComponent
    , BukkenDetailComponent
    , BukkenUpdateComponent// 20210207 Add
    , ContractListComponent
    , ContractDetailComponent
    , SelectComponentComponent
    , FileComponentComponent
    , ConfirmDialogComponent
    , TopComponent
    , InfoDialogComponent
    , InfoListComponent
    , InfoDetailComponent
    , DepListComponent
    , DepDetailComponent
    , UserListComponent
    , UserDetailComponent
    , CodeListComponent
    , CodeDetailComponent
    // 20210628 S_Add
    , KanjyoListComponent
    , KanjyoDetailComponent
    , KanjyoFixListComponent
    , KanjyoFixDetailComponent
    // 20210628 E_Add
    // 20210719 S_Add
    , FbApprovalListComponent
    , FbListComponent
    , SortingListComponent
    , SortingDetailComponent
    // 20210719 E_Add
    // 20210831 S_Add
    , BankListComponent
    , BankDetailComponent
    // 20210831 E_Add
    , FinishDialogComponent
    , SharerDialogComponent
    , LocationDetailComponent
    , PaymentTypeListComponent
    , PaymentTypeDetailComponent
    // 20210916 S_Add
    , ReceiveTypeListComponent
    , ReceiveTypeDetailComponent
    // 20210916 E_Add
    , PlanDetailComponent
    , PayContractListComponent
    , PayContractDetailComponent
    // 20210916 S_Add
    , ReceiveContractListComponent
    , ReceiveContractDetailComponent
    // 20210916 E_Add
    , PlanListComponent
    , BukkenplaninfoDetailComponent
    , BukkenplaninfoListComponent
    , ContractTemplateComponent
    , CsvTemplateComponent
    , ErrorDialogComponent
    , LabelComponentComponent
    , PlanHistoryCreateComponent
    , PlanHistoryListComponent
    , DndDirective
    , CalcKotozeiDetailComponent
  ],
  imports: [
    BrowserModule
    , AppRoutingModule
    , HttpClientModule
    , BrowserAnimationsModule
    , NgxChartsModule
    , FormsModule
    , MatToolbarModule
    , MatSidenavModule
    , MatListModule
    , MatCardModule
    , MatTableModule
    , MatPaginatorModule
    , MatExpansionModule
    , MatDividerModule
    , MatFormFieldModule
    , MatInputModule
    , MatButtonModule
    , MatIconModule
    , MatDialogModule
    , MatGridListModule
    , NgxSpinnerModule
    , MatDatepickerModule
    , MatNativeDateModule
    , MatRadioModule
    , MatSelectModule
    , MatSnackBarModule
    , MatCheckboxModule
    , MatTabsModule
    , MatSortModule
    , NgMultiSelectDropDownModule.forRoot()// 20200731 Add
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
  entryComponents: [
    BukkenDetailComponent
    , ContractDetailComponent
    , ConfirmDialogComponent
    , InfoDialogComponent
    , InfoDetailComponent
    , DepDetailComponent
    , UserDetailComponent
    , CodeDetailComponent
    // 20210628 S_Add
    , KanjyoDetailComponent
    , KanjyoFixDetailComponent
    // 20210628 E_Add
    , SortingDetailComponent // 20210719 Add
    , BankDetailComponent // 20210831 Add
    , FinishDialogComponent
    , SharerDialogComponent
    , LocationDetailComponent
    , PaymentTypeDetailComponent
    , ReceiveTypeDetailComponent// 20210916 Add
    , PlanDetailComponent
    , PayContractDetailComponent
    , ReceiveContractDetailComponent // 20210916 Add
    , BukkenplaninfoDetailComponent
    , ContractTemplateComponent
    , CsvTemplateComponent
    , ErrorDialogComponent
    , PlanHistoryCreateComponent
    , PlanHistoryListComponent
    , CalcKotozeiDetailComponent
  ],
})
export class AppModule { }
