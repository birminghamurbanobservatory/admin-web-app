import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from './auth.guard';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {InterceptorService} from './interceptor.service';
import {CallbackComponent} from './callback/callback.component';


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
    path: 'sensors',
    loadChildren: () => import('./sensor/sensor.module').then(m => m.SensorModule),
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
      useClass: InterceptorService,
      multi: true
    }
  ]
})
export class AppRoutingModule { }
