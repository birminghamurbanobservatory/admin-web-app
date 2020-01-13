import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from './auth.guard';
import {AccountComponent} from './account/account.component';
import {LandingComponent} from './landing/landing.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {InterceptorService} from './interceptor.service';
import {DeploymentComponent} from './deployment/deployment.component';


const routes: Routes = [
  {
    // TODO: Could potentially have guard here, that if they're already logged in then take them to the deployments section. If they're logged in, but have no permissions, then take them to an info page. I'll probably still need to have a intermeditary manage route, e.g. /manage/deployments, this manage component will have a sidebar and logout button, then the deployment, sensors components, etc can nested inside this.
    path: '',
    component: LandingComponent
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'deployments',
    component: DeploymentComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ]
})
export class AppRoutingModule { }
