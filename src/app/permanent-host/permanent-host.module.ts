import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermanentHostRoutingModule } from './permanent-host-routing.module';
import { PermanentHostsComponent } from './permanent-hosts/permanent-hosts.component';
import { CreatePermanentHostComponent } from './create-permanent-host/create-permanent-host.component';
import {SharedModule} from '../shared/shared.module';
import { PermanentHostComponent, DeletePermanentHostDialog } from './permanent-host/permanent-host.component';


@NgModule({
  declarations: [PermanentHostsComponent, CreatePermanentHostComponent, PermanentHostComponent, DeletePermanentHostDialog],
  imports: [
    CommonModule,
    PermanentHostRoutingModule,
    SharedModule
  ],
  entryComponents: [
    DeletePermanentHostDialog
  ]
})
export class PermanentHostModule { }
