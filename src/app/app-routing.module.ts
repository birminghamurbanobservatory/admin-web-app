import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from './auth.guard';
import {AccountComponent} from './account/account.component';
import {LandingComponent} from './landing/landing.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {InterceptorService} from './interceptor.service';


const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'account',
    component: AccountComponent,
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
