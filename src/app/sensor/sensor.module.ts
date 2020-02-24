import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorRoutingModule } from './sensor-routing.module';
import { SensorComponent, DeleteSensorDialog } from './sensor/sensor.component';
import { SensorsComponent } from './sensors/sensors.component';
import {SharedModule} from '../shared/shared.module';
import { CreateSensorComponent } from './create-sensor/create-sensor.component';
import { EditSensorComponent } from './edit-sensor/edit-sensor.component';
import { ViewSensorComponent } from './view-sensor/view-sensor.component';
import { SensorDefaultsComponent } from './sensor-defaults/sensor-defaults.component';
import { SensorDefaultComponent } from './sensor-default/sensor-default.component';


@NgModule({
  declarations: [
    SensorComponent, 
    SensorsComponent, 
    CreateSensorComponent, 
    DeleteSensorDialog, 
    EditSensorComponent, 
    ViewSensorComponent, 
    SensorDefaultsComponent, 
    SensorDefaultComponent
  ],
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
