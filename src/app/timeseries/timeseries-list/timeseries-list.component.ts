import { Component, OnInit } from '@angular/core';
import {Timeseries} from '../timeseries';
import {TimeseriesService} from '../timeseries.service';
import {CollectionMeta} from 'src/app/shared/collection-meta';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import * as check from 'check-types';
import {filter, debounceTime, distinctUntilChanged, switchMap, catchError} from 'rxjs/operators';
import {SensorService} from 'src/app/sensor/sensor.service';
import {Sensor} from 'src/app/sensor/sensor';
import {throwError} from 'rxjs';
import {ObservableProperty} from 'src/app/observable-property/observable-property';
import {ObservablePropertyService} from 'src/app/observable-property/observable-property.service';

@Component({
  selector: 'uo-timeseries-list',
  templateUrl: './timeseries-list.component.html',
  styleUrls: ['./timeseries-list.component.css']
})
export class TimeseriesListComponent implements OnInit {

  timeseriesList: Timeseries[] = [];
  sensorChoices: Sensor[] = [];
  observedPropertyChoices: ObservableProperty[] = [];
  getErrorMessage: string;
  state = 'getting';
  meta: CollectionMeta;
  limit = 20;
  limitOptions = [10, 20, 50];
  offset = 0;
  optionsForm;

  constructor(
    private timeseriesService: TimeseriesService,
    private sensorService: SensorService,
    private observablePropertyService: ObservablePropertyService,
    private logger: UoLoggerService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    // Set some defaults, and any validators.
    this.optionsForm = this.fb.group({
      madeBySensor: '',
      observedProperty: ''
    });

    this.route.queryParams.subscribe(params => {
      this.logger.debug('Query string parameters', params)
      // Update form values using these query parameters
      if (check.nonEmptyString(params.madeBySensor)) this.optionsForm.controls['madeBySensor'].setValue(params.madeBySensor, {emitEvent: false});
      if (check.nonEmptyString(params.observedProperty)) this.optionsForm.controls['observedProperty'].setValue(params.observedProperty, {emitEvent: false});
      if (check.assigned(params.limit)) this.limit = params.limit;
      if (check.assigned(params.offset)) this.offset = params.offset;

      this.getTimeseriesList();
    });

    this.listenForOptionChanges()

  }


  listenForOptionChanges() {
    // Although it's possible to watch for any changes to the form as a whole, It's worth watching each form input individually, because some form inputs, such as search boxes, are worth having debounce/switchmap/etc applied.

    this.optionsForm.get('madeBySensor').valueChanges
    .pipe(
      filter((value: string) => value.length > 1),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.sensorService.getSensors({search: value}))
    )
    .subscribe(({data: sensors}) => {
      this.sensorChoices = sensors;
      this.logger.debug(`Found ${sensors.length} sensors`);
    });


    this.optionsForm.get('observedProperty').valueChanges
    .pipe(
      filter((value: string) => value.length > 1),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.observablePropertyService.getObservableProperties({search: value}))
    )
    .subscribe(({data: observableProperties}) => {
      this.observedPropertyChoices = observableProperties;
      this.logger.debug(`Found ${observableProperties.length} observable properties`);
    });

  }


  getTimeseriesList() {
    this.state = 'getting';

    const where: any = {};

    const madeBySensor = this.optionsForm.get('madeBySensor').value;
    if (madeBySensor) {
      where.madeBySensor = madeBySensor
    }

    const observedProperty = this.optionsForm.get('observedProperty').value;
    if (observedProperty) {
      where.observedProperty = observedProperty
    }

    const options = {
      limit: this.limit,
      offset: this.offset
    };

    this.timeseriesService.getMultipleTimeseries(where, options)
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        return throwError(err);
      })
    )
    .subscribe(({data: timeseriesList, meta}) => {
      this.timeseriesList = timeseriesList;
      this.meta = meta;
      this.state = 'got';
    })
  }


  applyMadeBySensor() {
    this.router.navigate([], {
      queryParams: {madeBySensor:  this.optionsForm.get('madeBySensor').value},
      queryParamsHandling: 'merge', // keeps any existing query parameters
      relativeTo: this.route
    });
  }

  clearMadeBySensor() {
    this.optionsForm.controls['madeBySensor'].setValue('', {emitEvent: false});
    this.router.navigate([], {
      queryParams: {madeBySensor:  undefined},
      queryParamsHandling: 'merge', // keeps any existing query parameters
      relativeTo: this.route
    });
  }

  applyObservedProperty() {
    this.router.navigate([], {
      queryParams: {observedProperty:  this.optionsForm.get('observedProperty').value},
      queryParamsHandling: 'merge', // keeps any existing query parameters
      relativeTo: this.route
    });
  }

  clearObservedProperty() {
    this.optionsForm.controls['observedProperty'].setValue('', {emitEvent: false});
    this.router.navigate([], {
      queryParams: {observedProperty:  undefined},
      queryParamsHandling: 'merge', // keeps any existing query parameters
      relativeTo: this.route
    });
  }


  pageEvent(info) {

    this.logger.debug(info);

    const newLimit = info.pageSize;
    const newOffset = info.pageIndex * this.limit;

    this.router.navigate([], {
      queryParams: {
        limit: newLimit,
        offset: newOffset
      },
      queryParamsHandling: 'merge', // keeps any existing query parameters
      relativeTo: this.route
    });

  }

  calculatePageIndex() {
    return this.offset === 0 ? 0 : Math.ceil(this.offset / this.limit);
  }


  onMerged({goodTimeseriesIdKept, timeseriesIdsMerged, nObservationsMerged}) {
    this.logger.debug(`${this.constructor.name} is aware that timeseries ${timeseriesIdsMerged.join(' and ')} has been merged into timeseries ${goodTimeseriesIdKept}.`)
    // Because of the pagination, it's easier to simply update the entire list, this way we have as many timeseries displayed as the paginator says there are.
    this.getTimeseriesList();
  }


  onDeleted(timeseriesId: string) {
    this.logger.debug(`${this.constructor.name} is aware that ${timeseriesId} has been deleted.`);
    // Because of the pagination, it's easier to simply update the entire list, this way we have as many timeseries displayed as the paginator says there are.
    this.getTimeseriesList();
  }

}
