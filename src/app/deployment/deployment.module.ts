import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeploymentRoutingModule } from './deployment-routing.module';
import { DeploymentsComponent } from './deployments/deployments.component';


@NgModule({
  declarations: [DeploymentsComponent],
  imports: [
    CommonModule,
    DeploymentRoutingModule
  ]
})
export class DeploymentModule { }
