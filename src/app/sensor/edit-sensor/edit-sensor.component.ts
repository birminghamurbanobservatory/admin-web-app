import { Component, OnInit } from '@angular/core';
import {Sensor} from '../sensor';
import {SensorService} from '../sensor.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {catchError, filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {throwError, timer} from 'rxjs';
import {ParamMap, ActivatedRoute} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {PermanentHostService} from 'src/app/permanent-host/permanent-host.service';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {UtilsService} from 'src/app/utils/utils.service';
import {cloneDeep} from 'lodash';

@Component({
  selector: 'uo-edit-sensor',
  templateUrl: './edit-sensor.component.html',
  styleUrls: ['./edit-sensor.component.css']
})
export class EditSensorComponent implements OnInit {

  sensorId: string;
  sensor: Sensor; 
  getState = 'getting';
  getErrorMessage: string;
  editSensorForm;
  updateState = 'pending';
  updateErrorMessage: string;
  deploymentChoices = [];
  permanentHostChoices = [];
  editedDefaults;

  constructor(
    private logger: UoLoggerService,
    private sensorService: SensorService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private permanentHostService: PermanentHostService, 
    private deploymentService: DeploymentService, 
    private utilsService: UtilsService
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.sensorId = params.get('sensorId');
      this.logger.debug(`Sensor ID from route params: '${this.sensorId}'`);
      this.getSensorAndPopulateForm(this.sensorId);
    });

  }


  getSensorAndPopulateForm(sensorId: string) {
    this.getState = 'getting';
    this.sensorService.getSensor(sensorId)
    .pipe(
      catchError((error) => {
        this.getState = 'failed';
        this.getErrorMessage = error.message;
        return throwError(error);
      })
    )
    .subscribe((sensor) => {
      this.logger.debug(sensor);

      this.editSensorForm = this.fb.group({
        name: [
          sensor.name || ''
        ],
        description: [
          sensor.description || ''
        ],
        inDeployment: [
          sensor.inDeployment || ''
        ],
        permanentHost: [
          sensor.permanentHost || ''
        ]
      });

      this.getState = 'got';
      this.sensor = sensor;
      this.onChanges(); // just watch we don't end up with multiple subscribers if getSensorAndPopulateForm is called more than once.
    })
  }

  onChanges() {

    // autocomplete for the inDeployment
    this.editSensorForm.get('inDeployment').valueChanges
    .pipe(
      filter((value: string) => value.length > 2),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: string) => this.deploymentService.getDeployments({id: {begins: value}}))
    )
    .subscribe(deployments => {
      this.deploymentChoices = deployments;
      this.logger.debug(deployments);
    });

    // autocomplete for the permanentHost
    this.editSensorForm.get('permanentHost').valueChanges
    .pipe(
      filter((value: string) => value.length > 2),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: string) => this.permanentHostService.getPermanentHosts({id: {begins: value}}))
    )
    .subscribe(permanentHosts => {
      this.permanentHostChoices = permanentHosts;
      this.logger.debug(permanentHosts);
    });

  }


  onDefaultsChanged(updatedDefaults) {
    this.editedDefaults = updatedDefaults;
  }


  onSubmit(updates) {

    this.updateState = 'updating';
    this.updateErrorMessage = '';

    const updatesWithAnyDefaults = cloneDeep(updates);
    if (this.editedDefaults) {
      const defaultsWithoutIds = cloneDeep(this.editedDefaults).map((def) => {
        delete def.id;
        return def;
      });
      updatesWithAnyDefaults.defaults = defaultsWithoutIds;
    }

    // If some of the properties haven't even changed then don't bother sending them to the server.
    const cleanedUpdates = this.utilsService.removeUnchangedUpdates(updatesWithAnyDefaults, this.sensor);

    if (cleanedUpdates.permanentHost === '') {
      if (this.sensor.permanentHost) {
        cleanedUpdates.permanentHost = null;
      } else {
        delete cleanedUpdates.permanentHost;
      }
    }

    if (cleanedUpdates.inDeployment === '') {
      if (this.sensor.inDeployment) {
        cleanedUpdates.inDeployment = null;
      } else {
        delete cleanedUpdates.inDeployment;
      }
    }

    this.logger.debug('Updates that have changed:')
    this.logger.debug(cleanedUpdates);

    if (Object.keys(cleanedUpdates).length === 0) {
      this.updateErrorMessage = 'None of the details were any different.';
      this.updateState = 'pending';
      
    } else {
      this.sensorService.updateSensor(this.sensorId, cleanedUpdates)
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
      .subscribe((updatedSensor) => {
        this.updateState = 'updated';
        this.sensor = updatedSensor;
        this.logger.debug(updatedSensor);

        // Might be a better way to do this.
        timer(1400).subscribe(() => {
          this.updateState = 'pending';
        });

      })    
    }
  
  }



}
