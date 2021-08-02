import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { BukkenListComponent } from './bukken-list/bukken-list.component';
import { ContractListComponent } from './contract-list/contract-list.component';
import { BukkenDetailComponent } from './bukken-detail/bukken-detail.component';
import { BukkenUpdateComponent } from './bukken-update/bukken-update.component';
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
import { FbListComponent } from './fb-list/fb-list.component';
import { FbApprovalListComponent } from './fbApproval-list/fbApproval-list.component';
import { SortingListComponent } from './sorting-list/sorting-list.component';
import { PlanListComponent } from './plan-list/plan-list.component';
import { BukkenplaninfoListComponent } from './bukkenplaninfo-list/bukkenplaninfo-list.component';
import { PlanHistoryListComponent } from './planhistory-list/planhistory-list.component';
import { KanjyoListComponent } from './kanjyo-list/kanjyo-list.component';
import { KanjyoFixListComponent } from './kanjyoFix-list/kanjyoFix-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }
  , { path: 'login', component: LoginComponent}
  , { path: 'top', component: TopComponent}
  , { path: 'bukkens', component: BukkenListComponent}
  , { path: 'bkdetail', component: BukkenDetailComponent}
  , { path: 'bkupdate', component: BukkenUpdateComponent}
  , { path: 'contracts', component: ContractListComponent}
  , { path: 'ctdetail', component: ContractDetailComponent}
  , { path: 'infos', component: InfoListComponent}
  , { path: 'deps', component: DepListComponent}
  , { path: 'users', component: UserListComponent}
  , { path: 'codes', component: CodeListComponent}
  , { path: 'paymentTypes', component: PaymentTypeListComponent}
  , { path: 'bukkenplans', component: BukkenplaninfoListComponent}
  , { path: 'plans', component: PlanListComponent}
  , { path: 'plandetail', component: PlanDetailComponent}
  , { path: 'pays', component: PayContractListComponent}
  , { path: 'paydetail', component: PayContractDetailComponent}
  , { path: 'fb', component: FbListComponent}
  , { path: 'fbApproval', component: FbApprovalListComponent}
  , { path: 'sorting', component: SortingListComponent}
  , { path: 'planhistorylist', component: PlanHistoryListComponent}
  , { path: 'kanjyos', component: KanjyoListComponent}
  , { path: 'kanjyoFixs', component: KanjyoFixListComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'
    , relativeLinkResolution: 'legacy'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
