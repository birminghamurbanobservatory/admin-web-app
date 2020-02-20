import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../shared/shared.module';

import { UnknownSensorRoutingModule } from './unknown-sensor-routing.module';
import { UnknownSensorsComponent } from './unknown-sensors/unknown-sensors.component';
import { UnknownSensorComponent } from './unknown-sensor/unknown-sensor.component';


@NgModule({
  declarations: [UnknownSensorsComponent, UnknownSensorComponent],
  imports: [
    CommonModule,
    SharedModule,
    UnknownSensorRoutingModule
  ]
})
export class UnknownSensorModule { }
