import { Component, OnInit } from '@angular/core';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {SensorService} from '../sensor.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Sensor} from '../sensor';

@Component({
  selector: 'uo-view-sensor',
  templateUrl: './view-sensor.component.html',
  styleUrls: ['./view-sensor.component.css']
})
export class ViewSensorComponent implements OnInit {


  sensor: Sensor;
  sensorId: string;
  getState = 'getting';
  deleteState = 'pending';
  getErrorMessage = '';

  constructor(
    private logger: UoLoggerService,
    private sensorService: SensorService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.sensorId = params.get('sensorId');
      this.logger.debug(`Sensor id from route params: '${this.sensorId}'`);

      this.getState = 'getting';
      this.sensorService.getSensor(this.sensorId)
      .pipe(
        catchError((error) => {
          this.getState = 'failed';
          this.getErrorMessage = error.message;
          return throwError(error);
        })
      )
      .subscribe((sensor) => {
        this.logger.debug(sensor);
        this.getState = 'got';
        this.sensor = sensor;
      })

    });

  }

  onDeleted(sensorId: string) {
    this.logger.debug(`The view-sensor component is aware that the sensor '${sensorId}' has been deleted.`)
    this.deleteState = 'deleted';
  }

}
