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
         MatGridListModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatSelectModule, MatSnackBarModule, MatCheckboxModule
       } from '@angular/material';
import { BukkenListComponent } from './bukken-list/bukken-list.component';
import { BukkenDetailComponent } from './bukken-detail/bukken-detail.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ContractListComponent } from './contract-list/contract-list.component';
import { ContractDetailComponent } from './contract-detail/contract-detail.component';
import { SelectComponentComponent } from './uicomponent/select-component/select-component.component';
import { FileComponentComponent } from './uicomponent/file-component/file-component.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

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
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
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
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [BukkenDetailComponent, ContractDetailComponent, ConfirmDialogComponent],
})
export class AppModule { }
