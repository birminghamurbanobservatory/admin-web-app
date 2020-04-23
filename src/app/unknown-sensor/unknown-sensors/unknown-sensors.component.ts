import { Component, OnInit } from '@angular/core';
import {UnknownSensor} from '../unknown-sensor';
import {throwError} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {UnknownSensorService} from '../unknown-sensor.service';
import {NGXLogger} from 'ngx-logger';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {CollectionMeta} from 'src/app/shared/collection-meta';
import {FormBuilder} from '@angular/forms';
import * as check from 'check-types';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'uo-unknown-sensors',
  templateUrl: './unknown-sensors.component.html',
  styleUrls: ['./unknown-sensors.component.css']
})
export class UnknownSensorsComponent implements OnInit {

  unknownSensors: UnknownSensor[] = [];
  meta: CollectionMeta;
  getErrorMessage: string;
  state = 'getting';
  limit = 50;
  limitOptions = [10, 50, 100];
  offset = 0;
  optionsForm;

  constructor(
    private unknownSensorService: UnknownSensorService,
    private logger: UoLoggerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {

    // Set some defaults, and any validators.
    this.optionsForm = this.fb.group({
      search: ""
    });

    this.route.queryParams.subscribe(params => {
      this.logger.debug('Query string parameters', params)
      const nestValue = params.nest;
      // Update form values using these query parameters
      if (check.nonEmptyString(params.search)) this.optionsForm.controls['search'].setValue(params.search, {emitEvent: false});

      this.getUnknownSensors();
    });

    this.listenForOptionChanges()

  }

  listenForOptionChanges() {

    this.optionsForm.get('search').valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
    )
    .subscribe((searchText) => {
      this.logger.debug(`New search value from form: ${searchText}`);
      // Update the url query parameters
      this.router.navigate([], {
        queryParams: {search:  searchText},
        queryParamsHandling: 'merge', // keeps any existing query parameters
        relativeTo: this.route
      });
    })

  }


  getUnknownSensors() {
    this.logger.debug('Getting unknown sensors');
    this.state = 'getting';
    this.logger.debug(`Getting unknown sensors (offset: ${this.offset}, limit: ${this.limit})`)
    const where: any = {};
    const searchText = this.optionsForm.get('search').value;
    if (check.nonEmptyString(searchText)) {
      where.search = searchText;
    }
    this.unknownSensorService.getUnknownSensors(where, {limit: this.limit, offset: this.offset})
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        this.logger.error(err);
        return throwError(err);
      })
    )
    .subscribe(({data: unknownSensors, meta}) => {
      this.logger.debug(`Got ${unknownSensors.length} unknown sensors`); 
      this.unknownSensors = unknownSensors;
      this.meta = meta;
      this.state = 'got';
    })
  }


  pageEvent(info) {

    this.logger.debug(info);

    this.limit = info.pageSize;
    this.offset = info.pageIndex * this.limit;

    this.getUnknownSensors();

  }

}
