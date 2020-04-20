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
import { PaymentTypeListComponent } from './paymentType-list/paymentType-list.component';
import { PlanDetailComponent } from './plan-detail/plan-detail.component';
import { PayContractDetailComponent } from './paycontract-detail/paycontract-detail.component';
import { PayContractListComponent } from './paycontract-list/paycontract-list.component';
import { PlanListComponent } from './plan-list/plan-list.component';
import { BukkenplaninfoDetailComponent } from './bukkenplaninfo-detail/bukkenplaninfo-detail.component';

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
  { path: 'paymentTypes', component: PaymentTypeListComponent},
  { path: 'bukkenplans', component: BukkenplaninfoDetailComponent},

  { path: 'plans', component: PlanListComponent},
  { path: 'plandetail', component: PlanDetailComponent},
  { path: 'pays', component: PayContractListComponent},
  { path: 'paydetail', component: PayContractDetailComponent},
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
