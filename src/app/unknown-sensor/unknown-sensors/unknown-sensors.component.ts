import { Component, OnInit } from '@angular/core';
import {UnknownSensor} from '../unknown-sensor';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {UnknownSensorService} from '../unknown-sensor.service';
import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'uo-unknown-sensors',
  templateUrl: './unknown-sensors.component.html',
  styleUrls: ['./unknown-sensors.component.css']
})
export class UnknownSensorsComponent implements OnInit {

  unknownSensors: UnknownSensor[];
  getErrorMessage: string;
  state = 'getting';

  constructor(
    private unknownSensorService: UnknownSensorService,
    private logger: NGXLogger,
  ) { }

  ngOnInit() {
    this.getUnknownSensors();
  }

  getUnknownSensors() {
    this.logger.debug('Getting unknown sensors');
    this.state = 'getting';
    this.unknownSensorService.getUnknownSensors()
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        this.logger.error(err);
        return throwError(err);
      })
    )
    .subscribe((unknownSensors: UnknownSensor[]) => {
      this.logger.debug(`Got ${unknownSensors.length} unknown sensors`);
      this.unknownSensors = unknownSensors;
      this.state = 'got';
    })
  }

}
