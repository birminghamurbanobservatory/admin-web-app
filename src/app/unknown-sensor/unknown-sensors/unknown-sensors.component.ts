import { Component, OnInit } from '@angular/core';
import {UnknownSensor} from '../unknown-sensor';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {UnknownSensorService} from '../unknown-sensor.service';
import {NGXLogger} from 'ngx-logger';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {CollectionMeta} from 'src/app/shared/collection-meta';

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

  constructor(
    private unknownSensorService: UnknownSensorService,
    private logger: UoLoggerService,
  ) { }

  ngOnInit() {
    this.getUnknownSensors();
  }

  getUnknownSensors() {
    this.logger.debug('Getting unknown sensors');
    this.state = 'getting';
    this.logger.debug(`Getting unknown sensors (offset: ${this.offset}, limit: ${this.limit})`)
    this.unknownSensorService.getUnknownSensors({limit: this.limit, offset: this.offset})
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
