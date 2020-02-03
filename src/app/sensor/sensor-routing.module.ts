import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SensorsComponent} from './sensors/sensors.component';
import {CreateSensorComponent} from './create-sensor/create-sensor.component';


const routes: Routes = [
  {
    path: '',
    component: SensorsComponent
  },
  {
    path: 'create',
    component: CreateSensorComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SensorRoutingModule { }
