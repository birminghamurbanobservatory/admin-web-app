import { Component, OnInit } from '@angular/core';
import {PermanentHost} from '../permanent-host';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {PermanentHostService} from '../permanent-host.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {UtilsService} from 'src/app/utils/utils.service';
import {catchError} from 'rxjs/operators';
import {throwError, timer} from 'rxjs';
import {Sensor} from 'src/app/sensor/sensor';
import {SensorService} from 'src/app/sensor/sensor.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {cloneDeep} from 'lodash';

@Component({
  selector: 'uo-edit-permanent-host',
  templateUrl: './edit-permanent-host.component.html',
  styleUrls: ['./edit-permanent-host.component.css']
})
export class EditPermanentHostComponent implements OnInit {

  permanentHost: PermanentHost;
  permanentHostId: string;
  getState = 'getting';
  getErrorMessage: string;
  editPermanentHostForm;
  updateState = 'pending';
  updateErrorMessage: string;
  hostedSensors: Sensor[];

  constructor(
    private logger: UoLoggerService,
    private permanentHostService: PermanentHostService,
    private sensorService: SensorService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.permanentHostId = params.get('permanentHostId');
      this.logger.debug(`Permanent Host ID from route params: '${this.permanentHost}'`);
      this.getPermanentHostAndPopulateForm(this.permanentHostId);
    });

  }

  getPermanentHostAndPopulateForm(permanentHostId: string) {

    this.getState = 'getting';

    // Let's actually begin by getting a list of sensors on this permanentHost, so we can select which one should be the updateLocationWithSensor form value.
    this.logger.debug(`Getting sensors hosted on permanent host ${permanentHostId}`)
    this.sensorService.getSensors({permanentHost: permanentHostId})
    .pipe(
      catchError((error) => {
        this.getState = 'failed';
        this.getErrorMessage = error.message;
        return throwError(error);
      })
    )
    .subscribe(({data: sensors}) => {
      this.logger.debug(sensors);
      this.hostedSensors = sensors;

      this.logger.debug(`Getting the permament host ${permanentHostId}`)
      this.permanentHostService.getPermanentHost(permanentHostId)
      .pipe(
        catchError((error) => {
          this.getState = 'failed';
          this.getErrorMessage = error.message;
          return throwError(error);
        })
      )
      .subscribe((permanentHost) => {
        this.logger.debug(permanentHost);

        let hostedSensorIdx = this.hostedSensors.findIndex((hostedSensor) => {
          hostedSensor.id === permanentHost.updateLocationWithSensor
        });
        hostedSensorIdx = hostedSensorIdx >= 0 ? hostedSensorIdx : 0;

        this.editPermanentHostForm = this.fb.group({
          name: [
            permanentHost.name || '',
            Validators.required
          ],
          description: [
            permanentHost.description || ''
          ],
          static: [
            permanentHost.static || false
          ],
          allowUpdateLocationWithSensor: [
            permanentHost.updateLocationWithSensor ? true : false
          ],
          updateLocationWithSensor: [
            this.hostedSensors.length > 0 ? this.hostedSensors[hostedSensorIdx].id : null
          ]
        });

        this.getState = 'got';
        this.permanentHost = permanentHost;

      })

    });  

  }


  onSubmit(updates) {
    this.logger.debug(updates);
    this.updateState = 'updating';
    this.updateErrorMessage = '';

    const clonedUpdates = cloneDeep(updates);

    // If the permanentHost was being updated by a sensor, and now this feature has been disabled then we need to make sure the updateLocationWithSensor property will be removed the server-side is removed.
    if (this.permanentHost.updateLocationWithSensor && clonedUpdates.allowUpdateLocationWithSensor === false ) {
      clonedUpdates.updateLocationWithSensor = null;
    }

    // If the permanentHost is being made static then we must make sure the updateLocationWithSensor won't be set.
    if (clonedUpdates.static === true) {
      if (this.permanentHost.updateLocationWithSensor) {
        clonedUpdates.updateLocationWithSensor = null
      } else {
        delete clonedUpdates.updateLocationWithSensor;
      }
    }

    delete clonedUpdates.allowUpdateLocationWithSensor;

    // If some of the properties haven't even changed then don't bother sending them to the server.
    const cleanedUpdates = this.utilsService.removeUnchangedUpdates(clonedUpdates, this.permanentHost);

    this.logger.debug(cleanedUpdates);

    if (Object.keys(cleanedUpdates).length === 0) {
      this.updateErrorMessage = 'None of the details were any different.';
      this.updateState = 'pending';
      
    } else {
      this.permanentHostService.updatePermanentHost(this.permanentHostId, cleanedUpdates)
      .pipe(
        catchError((error) => {
          this.updateState = 'failed';
          this.updateErrorMessage = error.message;
          timer(1400).subscribe(() => {
            this.updateState = 'pending';
          });
          return throwError(error);
        })
      )
      .subscribe((updatedPermanentHost) => {
        this.updateState = 'updated';
        this.permanentHost = updatedPermanentHost;
        this.logger.debug(updatedPermanentHost);

        // Might be a better way to do this.
        timer(1400).subscribe(() => {
          this.updateState = 'pending';
        });

      })    
    }

  }


}
