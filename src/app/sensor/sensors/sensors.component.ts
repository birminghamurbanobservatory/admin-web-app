import { Component, OnInit } from '@angular/core';
import {NGXLogger} from 'ngx-logger';
import {SensorService} from '../sensor.service';
import {Sensor} from '../sensor';
import {catchError, switchMap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {ActivatedRoute, ParamMap} from '@angular/router';

@Component({
  selector: 'uo-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {

  sensors: Sensor[];
  getErrorMessage: string;
  state = 'getting';
  selectedPermanentHostId: string;

  constructor(
    private sensorService: SensorService,
    private logger: NGXLogger,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {

      this.selectedPermanentHostId = params.get('permanentHost');
      this.logger.debug(`Permanent host id '${this.selectedPermanentHostId}' was retrieved from the url`);
      
      const where: any = {};

      if (this.selectedPermanentHostId) {
        where.permanentHost = this.selectedPermanentHostId;
      }

      this.getSensors(where);

    });

  }

  getSensors(where) {
    this.state = 'getting';
    this.sensorService.getSensors(where)
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
