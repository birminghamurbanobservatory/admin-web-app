import { Component, OnInit } from '@angular/core';
import {timer, Observable, throwError} from 'rxjs';
import {NGXLogger} from 'ngx-logger';
import {SensorService} from '../sensor.service';
import {FormBuilder, Validators} from '@angular/forms';
import {catchError} from 'rxjs/operators';

@Component({
  selector: 'uo-create-sensor',
  templateUrl: './create-sensor.component.html',
  styleUrls: ['./create-sensor.component.css']
})
export class CreateSensorComponent implements OnInit {

  createSensorForm;
  createErrorMessage = '';
  state = 'pending';

  constructor(
    private sensorService: SensorService,
    private logger: NGXLogger,
    private fb: FormBuilder
  ) {}

  ngOnInit() {

    this.createSensorForm = this.fb.group({
      name: '',
      id: '',
      description: '',
      // TODO: allow for the permanent host to be passed in via a querystring parameter so it can be used as the default for permanentHost, and use it at the start of the id too.
      permanentHost: '', 
      inDeployment: ''
      // TODO: add defaults
    });

  }


  onSubmit(sensorToCreate) {
    this.state = 'creating';
    this.createErrorMessage = '';
    this.logger.debug(sensorToCreate);

    // TODO: Make a function that deletes empty strings from objects rather than doing the following
    if (sensorToCreate.id === '') {
      delete sensorToCreate.id;
    }
    if (sensorToCreate.name === '') {
      delete sensorToCreate.name;
    }
    if (sensorToCreate.description === '') {
      delete sensorToCreate.description;
    }
    if (sensorToCreate.permanentHost === '') {
      delete sensorToCreate.permanentHost;
    }
    if (sensorToCreate.inDeployment === '') {
      delete sensorToCreate.inDeployment;
    }

    this.sensorService.createSensor(sensorToCreate)
    .pipe(
      catchError((error) => {
        this.state = 'failed';
        this.createErrorMessage = error.message;
        this.briefDelay().subscribe(() => {
          this.state = 'pending';
        });
        return throwError(error);
      })
    )
    .subscribe((createdDeployment) => {
      this.state = 'created';
      this.logger.debug(createdDeployment);
      this.briefDelay().subscribe(() => {
        this.state = 'pending';
      });
    })    

  }


  briefDelay(): Observable<number> {
    return timer(1400);
  }


}
