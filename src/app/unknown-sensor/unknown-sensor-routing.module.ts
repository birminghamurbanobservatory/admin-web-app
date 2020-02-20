import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {UnknownSensorsComponent} from './unknown-sensors/unknown-sensors.component';


const routes: Routes = [
  {
    path: '',
    component: UnknownSensorsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnknownSensorRoutingModule { }
