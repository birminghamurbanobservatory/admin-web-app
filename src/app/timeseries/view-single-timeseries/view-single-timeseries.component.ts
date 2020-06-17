import { Component, OnInit } from '@angular/core';
import {Timeseries} from '../timeseries';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {TimeseriesService} from '../timeseries.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'uo-view-single-timeseries',
  templateUrl: './view-single-timeseries.component.html',
  styleUrls: ['./view-single-timeseries.component.css']
})
export class ViewSingleTimeseriesComponent implements OnInit {

  timeseries: Timeseries;
  timeseriesId: string;
  getState = 'getting';
  deleteState = 'pending';
  getErrorMessage = '';

  constructor(
    private logger: UoLoggerService,
    private timeseriesService: TimeseriesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.timeseriesId = params.get('timeseriesId');
      this.logger.debug(`Timeseries id from route params: '${this.timeseriesId}'`);
      this.getTimeseries();
    });

  }


  getTimeseries() {
    this.getState = 'getting';
    this.timeseriesService.getSingleTimeseries(this.timeseriesId)
    .pipe(
      catchError((error) => {
        this.getState = 'failed';
        this.getErrorMessage = error.message;
        return throwError(error);
      })
    )
    .subscribe((timeseries) => {
      this.logger.debug(timeseries);
      this.getState = 'got';
      this.timeseries = timeseries;
    })
  }


  onMerged({goodTimeseriesIdKept, timeseriesIdsMerged, nObservationsMerged}) {
    this.logger.debug(`${this.constructor.name} is aware that timeseries ${timeseriesIdsMerged.join(' and ')} has been merged into timeseries ${goodTimeseriesIdKept}.`)
    // Because the merge may have caused the start and end dates to change we should get the timeseries from the server again.
    this.getTimeseries();
  }

  onDeleted(timeseriesId: string) {
    this.logger.debug(`${this.constructor.name} is aware that '${timeseriesId}' has been deleted.`)
    this.deleteState = 'deleted';
  }

}
