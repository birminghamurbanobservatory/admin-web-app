import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DeploymentsComponent} from './deployments/deployments.component';
import {CreateDeploymentComponent} from './create-deployment/create-deployment.component';


const routes: Routes = [
  {
    path: '',
    component: DeploymentsComponent
  },
  {
    path: 'create',
    component: CreateDeploymentComponent
  }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeploymentRoutingModule { }
