import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { PlatformRoutingModule } from './platform-routing.module';
import { CreatePlatformComponent } from './create-platform/create-platform.component';
import {PlatformsComponent} from './platforms/platforms.component';
import { PlatformComponent } from './platform/platform.component';


@NgModule({
  declarations: [CreatePlatformComponent, PlatformsComponent, PlatformComponent],
  imports: [
    CommonModule,
    PlatformRoutingModule,
    SharedModule
  ]
})
export class PlatformModule { }
