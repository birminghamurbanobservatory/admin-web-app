import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SensorRoutingModule } from './sensor-routing.module';
import { SensorComponent } from './sensor/sensor.component';
import { SensorsComponent } from './sensors/sensors.component';
import {SharedModule} from '../shared/shared.module';


@NgModule({
  declarations: [SensorComponent, SensorsComponent],
  imports: [
    CommonModule,
    SensorRoutingModule,
    SharedModule
  ]
})
export class SensorModule { }
