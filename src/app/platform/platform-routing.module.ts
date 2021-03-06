import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PlatformsComponent} from './platforms/platforms.component';
import {CreatePlatformComponent} from './create-platform/create-platform.component';
import {ViewPlatformComponent} from './view-platform/view-platform.component';
import {EditPlatformComponent} from './edit-platform/edit-platform.component';


const routes: Routes = [
  {
    path: '',
    component: PlatformsComponent
  },
  {
    path: 'create',
    component: CreatePlatformComponent
  },
  {
    path: 'view/:platformId',
    component: ViewPlatformComponent
  },
  {
    path: 'edit/:platformId',
    component: EditPlatformComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlatformRoutingModule { }
