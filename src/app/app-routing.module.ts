import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { BukkenListComponent } from './bukken-list/bukken-list.component';
import { ContractListComponent } from './contract-list/contract-list.component';
import { BukkenDetailComponent } from './bukken-detail/bukken-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent},
  { path: 'bukkens', component: BukkenListComponent},
  { path: 'bkdetail', component: BukkenDetailComponent},
  { path: 'contracts', component: ContractListComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
