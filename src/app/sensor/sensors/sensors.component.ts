import { Component, OnInit } from '@angular/core';
import {NGXLogger} from 'ngx-logger';
import {SensorService} from '../sensor.service';
import {Sensor} from '../sensor';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'uo-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {

  sensors: Sensor[];
  getErrorMessage: string;
  state = 'getting';

  constructor(
    private sensorService: SensorService,
    private logger: NGXLogger
  ) { }

  ngOnInit() {
    this.getSensors();
  }

  getSensors() {
    this.state = 'getting';
    this.sensorService.getSensors()
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        return throwError(err);
      })
    )
    .subscribe((sensors: Sensor[]) => {
      this.state = 'got';
      this.sensors = sensors;
    })
  }

  onDeleted(sensorId: string) {
    this.logger.debug(`The SensorsComponent is aware that the sensor ${sensorId} has been deleted.`)
    this.sensors = this.sensors.filter((sensor) => sensor.id !== sensorId);
  }


}
