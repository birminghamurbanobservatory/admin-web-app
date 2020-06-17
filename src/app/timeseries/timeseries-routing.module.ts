import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TimeseriesListComponent} from './timeseries-list/timeseries-list.component';
import {ViewSingleTimeseriesComponent} from './view-single-timeseries/view-single-timeseries.component';


const routes: Routes = [
  {
    path: '',
    component: TimeseriesListComponent
  },
  {
    path: 'view/:timeseriesId',
    component: ViewSingleTimeseriesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeseriesRoutingModule { }
