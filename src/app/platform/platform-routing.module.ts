import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PlatformsComponent} from './platforms/platforms.component';
import {CreatePlatformComponent} from './create-platform/create-platform.component';


const routes: Routes = [
  {
    path: '',
    component: PlatformsComponent
  },
  {
    path: 'create',
    component: CreatePlatformComponent
  }    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlatformRoutingModule { }
