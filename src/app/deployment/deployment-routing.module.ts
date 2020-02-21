import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DeploymentsComponent} from './deployments/deployments.component';
import {CreateDeploymentComponent} from './create-deployment/create-deployment.component';
import {ViewDeploymentComponent} from './view-deployment/view-deployment.component';
import {EditDeploymentComponent} from './edit-deployment/edit-deployment.component';


const routes: Routes = [
  {
    path: '',
    component: DeploymentsComponent
  },
  {
    path: 'create',
    component: CreateDeploymentComponent
  },
  {
    path: 'view/:deploymentId',
    component: ViewDeploymentComponent
  },
  {
    path: 'edit/:deploymentId',
    component: EditDeploymentComponent
  }    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeploymentRoutingModule { }
