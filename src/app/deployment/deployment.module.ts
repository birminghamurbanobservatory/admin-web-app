import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../shared/shared.module';

import { DeploymentRoutingModule } from './deployment-routing.module';
import { DeploymentsComponent } from './deployments/deployments.component';
import { CreateDeploymentComponent } from './create-deployment/create-deployment.component';
import { EditDeploymentComponent } from './edit-deployment/edit-deployment.component';
import { DeploymentComponent } from './deployment/deployment.component';


@NgModule({
  declarations: [
    DeploymentsComponent, 
    CreateDeploymentComponent, 
    EditDeploymentComponent, 
    DeploymentComponent
  ],
  imports: [
    CommonModule,
    DeploymentRoutingModule,
    SharedModule
  ]
})
export class DeploymentModule { }
