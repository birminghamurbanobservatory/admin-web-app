import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import { TimeseriesRoutingModule } from './timeseries-routing.module';
import { SingleTimeseriesComponent, DeleteTimeseriesDialog } from './single-timeseries/single-timeseries.component';
import { TimeseriesListComponent } from './timeseries-list/timeseries-list.component';
import { ViewSingleTimeseriesComponent } from './view-single-timeseries/view-single-timeseries.component';


@NgModule({
  declarations: [
    SingleTimeseriesComponent,
    TimeseriesListComponent,
    ViewSingleTimeseriesComponent,
    DeleteTimeseriesDialog
  ],
  imports: [
    CommonModule,
    SharedModule,
    TimeseriesRoutingModule
  ],
  entryComponents: [
    DeleteTimeseriesDialog
  ]
})
export class TimeseriesModule { }
