import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorRoutingModule } from './sensor-routing.module';
import { SensorComponent, DeleteSensorDialog } from './sensor/sensor.component';
import { SensorsComponent } from './sensors/sensors.component';
import {SharedModule} from '../shared/shared.module';
import { CreateSensorComponent } from './create-sensor/create-sensor.component';


@NgModule({
  declarations: [SensorComponent, SensorsComponent, CreateSensorComponent, DeleteSensorDialog],
  imports: [
    CommonModule,
    SensorRoutingModule,
    SharedModule
  ],
  entryComponents: [
    DeleteSensorDialog
  ]
})
export class SensorModule { }
