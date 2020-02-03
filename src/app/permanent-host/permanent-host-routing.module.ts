import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PermanentHostsComponent} from './permanent-hosts/permanent-hosts.component';
import {CreatePermanentHostComponent} from './create-permanent-host/create-permanent-host.component';


const routes: Routes = [
  {
    path: '',
    component: PermanentHostsComponent
  },
  {
    path: 'create',
    component: CreatePermanentHostComponent
  }    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermanentHostRoutingModule { }
