import { Component, OnInit } from '@angular/core';
import {Sensor} from '../sensor';
import {SensorService} from '../sensor.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {catchError, filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {ParamMap, ActivatedRoute} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {PermanentHostService} from 'src/app/permanent-host/permanent-host.service';
import {DeploymentService} from 'src/app/deployment/deployment.service';

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
        ],
        // TODO: I need a completely different way of handling the following context properties, i.e. that deals with the fact defaults is an array, and its objects can have a when object.
        observedProperty: [
          '', 
          Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')
        ],
        hasFeatureOfInterest: [
          '', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')
        ],
        usedProcedures: [
          '', Validators.pattern('[a-z0-9,-]*')
        ],
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
    this.logger.debug(updates);
    this.updateState = 'updating';
    // TODO: Need to merge in the editedDefaults - Need to decide whether to keep the original IDs or not
  }



}
