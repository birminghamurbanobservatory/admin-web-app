import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { PlatformRoutingModule } from './platform-routing.module';
import { CreatePlatformComponent } from './create-platform/create-platform.component';
import {PlatformsComponent} from './platforms/platforms.component';
import { PlatformComponent, DeletePlatformDialog } from './platform/platform.component';
import { ViewPlatformComponent } from './view-platform/view-platform.component';
import { EditPlatformComponent } from './edit-platform/edit-platform.component';


@NgModule({
  declarations: [
    CreatePlatformComponent, 
    PlatformsComponent, 
    PlatformComponent, 
    ViewPlatformComponent,
    DeletePlatformDialog,
    EditPlatformComponent
  ],
  imports: [
    CommonModule,
    PlatformRoutingModule,
    SharedModule
  ],
  entryComponents: [
    DeletePlatformDialog
  ]
})
export class PlatformModule { }
