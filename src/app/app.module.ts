import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

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
// 20200213 test S_Add
import { PlanDetailComponent } from './plan-detail/plan-detail.component';

import { PayContractListComponent } from './paycontract-list/paycontract-list.component';
import { PayContractDetailComponent } from './paycontract-detail/paycontract-detail.component';
// 20200213 test E_Add
// 20200226 test S_Add
import { PlanListComponent } from './plan-list/plan-list.component';
// 20200226 test E_Add
import{ BukkenplaninfoDetailComponent } from './bukkenplaninfo-detail/bukkenplaninfo-detail.component';
import{ BukkenplaninfoListComponent } from './bukkenplaninfo-list/bukkenplaninfo-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BukkenListComponent,
    BukkenDetailComponent,
    ContractListComponent,
    ContractDetailComponent,
    SelectComponentComponent,
    FileComponentComponent,
    ConfirmDialogComponent,
    TopComponent,
    InfoDialogComponent,
    InfoListComponent,
    InfoDetailComponent,
    DepListComponent,
    DepDetailComponent,
    UserListComponent,
    UserDetailComponent,
    CodeListComponent,
    CodeDetailComponent,
    FinishDialogComponent,
    SharerDialogComponent,
    LocationDetailComponent,
    PaymentTypeListComponent,
    PaymentTypeDetailComponent,
    // 20200213 test S_Add
    PlanDetailComponent,
    PayContractListComponent,
    PayContractDetailComponent,
    // 20200213 test E_Add
    // 20200226 test S_Add
    PlanListComponent,
    BukkenplaninfoDetailComponent,
    BukkenplaninfoListComponent,

    
    // 20200226 test E_Add
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    FormsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatGridListModule,
    NgxSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatTabsModule,
    MatSortModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
  entryComponents: [BukkenDetailComponent, ContractDetailComponent,
    ConfirmDialogComponent, InfoDialogComponent, InfoDetailComponent, DepDetailComponent,
    UserDetailComponent, CodeDetailComponent, FinishDialogComponent, SharerDialogComponent, LocationDetailComponent,
    PaymentTypeDetailComponent
    , PlanDetailComponent, PayContractDetailComponent,BukkenplaninfoDetailComponent// 20200213 test Add
  ],
})
export class AppModule { }
