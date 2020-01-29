import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DeploymentsComponent} from './deployments/deployments.component';


const routes: Routes = [
  {
    path: '',
    component: DeploymentsComponent
  }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeploymentRoutingModule { }
