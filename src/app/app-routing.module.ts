import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { BukkenListComponent } from './bukken-list/bukken-list.component';
import { ContractListComponent } from './contract-list/contract-list.component';
import { BukkenDetailComponent } from './bukken-detail/bukken-detail.component';
import { TopComponent } from './top/top.component';
import { InfoListComponent } from './info-list/info-list.component';
import { ContractDetailComponent } from './contract-detail/contract-detail.component';
import { DepListComponent } from './dep-list/dep-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { CodeListComponent } from './code-list/code-list.component';
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent},
  { path: 'top', component: TopComponent},
  { path: 'bukkens', component: BukkenListComponent},
  { path: 'bkdetail', component: BukkenDetailComponent},
  { path: 'contracts', component: ContractListComponent},
  { path: 'ctdetail', component: ContractDetailComponent},
  { path: 'infos', component: InfoListComponent},
  { path: 'deps', component: DepListComponent},
  { path: 'users', component: UserListComponent},
  { path: 'codes', component: CodeListComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
