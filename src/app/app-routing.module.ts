import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from './auth/auth.guard';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptorService} from './auth/auth-interceptor.service';
import {CallbackComponent} from './callback/callback.component';
import {ApiErrorInterceptor} from './utils/api-error-interceptor.interceptor';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'deployments',
    pathMatch: 'full'
  },
  {
    path: 'deployments',
    loadChildren: () => import('./deployment/deployment.module').then(m => m.DeploymentModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'permanent-hosts',
    loadChildren: () => import('./permanent-host/permanent-host.module').then(m => m.PermanentHostModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'sensors',
    loadChildren: () => import('./sensor/sensor.module').then(m => m.SensorModule),
    canActivate: [AuthGuard] // canLoad is probably better here, but I'm struggling to implement it
  },
  {
    path: 'unknown-sensors',
    loadChildren: () => import('./unknown-sensor/unknown-sensor.module').then(m => m.UnknownSensorModule),
    canActivate: [AuthGuard] // canLoad is probably better here, but I'm struggling to implement it
  },
  {
    path: 'platforms',
    loadChildren: () => import('./platform/platform.module').then(m => m.PlatformModule),
    canActivate: [AuthGuard] // canLoad is probably better here, but I'm struggling to implement it
  },  
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'callback',
    component: CallbackComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiErrorInterceptor,
      multi: true
    }
  ]
})
export class AppRoutingModule { }
