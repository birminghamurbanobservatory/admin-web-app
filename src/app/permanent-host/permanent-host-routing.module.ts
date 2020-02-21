import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PermanentHostsComponent} from './permanent-hosts/permanent-hosts.component';
import {CreatePermanentHostComponent} from './create-permanent-host/create-permanent-host.component';
import {ViewPermanentHostComponent} from './view-permanent-host/view-permanent-host.component';
import {EditPermanentHostComponent} from './edit-permanent-host/edit-permanent-host.component';


const routes: Routes = [
  {
    path: '',
    component: PermanentHostsComponent
  },
  {
    path: 'create',
    component: CreatePermanentHostComponent
  },
  {
    path: 'view/:permanentHostId',
    component: ViewPermanentHostComponent
  },
  {
    path: 'edit/:permanentHostId',
    component: EditPermanentHostComponent
  }      
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermanentHostRoutingModule { }
