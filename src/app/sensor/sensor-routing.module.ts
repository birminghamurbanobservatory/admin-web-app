import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SensorsComponent} from './sensors/sensors.component';
import {CreateSensorComponent} from './create-sensor/create-sensor.component';
import {EditSensorComponent} from './edit-sensor/edit-sensor.component';
import {ViewSensorComponent} from './view-sensor/view-sensor.component';


const routes: Routes = [
  {
    path: '',
    component: SensorsComponent
  },
  {
    path: 'create',
    component: CreateSensorComponent
  },
  {
    path: 'view/:sensorId',
    component: ViewSensorComponent
  },
  {
    path: 'edit/:sensorId',
    component: EditSensorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SensorRoutingModule { }
