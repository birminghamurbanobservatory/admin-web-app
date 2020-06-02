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
import {Deployment} from 'src/app/deployment/deployment';
import {PermanentHost} from 'src/app/permanent-host/permanent-host';
import {PlatformService} from 'src/app/platform/platform.service';
import {Platform} from '@angular/cdk/platform';

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
  deploymentChoices: Deployment[] = [];
  platformChoices: Platform[] = [];
  permanentHostChoices: PermanentHost[] = [];
  editedInitialConfigs;
  editedCurrentConfigs;

  constructor(
    private logger: UoLoggerService,
    private sensorService: SensorService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private permanentHostService: PermanentHostService, 
    private deploymentService: DeploymentService, 
    private platformService: PlatformService, 
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
        label: [
          sensor.label || ''
        ],
        description: [
          sensor.description || ''
        ],
        hasDeployment: [
          sensor.hasDeployment || ''
        ],
        permanentHost: [
          sensor.permanentHost || ''
        ],
        isHostedBy: [
          sensor.isHostedBy || ''
        ]
      });

      this.getState = 'got';
      this.sensor = sensor;
      this.onChanges(); // just watch we don't end up with multiple subscribers if getSensorAndPopulateForm is called more than once.
    })
  }

  onChanges() {

    // autocomplete for the hasDeployment
    this.editSensorForm.get('hasDeployment').valueChanges
    .pipe(
      filter((value: string) => value.length > 2),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.deploymentService.getDeployments({id: {begins: value}}))
    )
    .subscribe(({data: deployments}) => {
      this.deploymentChoices = deployments;
      this.logger.debug(deployments);
    });

    // autocomplete for the isHostedBy
    this.editSensorForm.get('isHostedBy').valueChanges
    .pipe(
      filter((value: string) => value.length > 2),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.platformService.getPlatforms({id: {begins: value}}))
    )
    .subscribe(({data: platforms}) => {
      this.platformChoices = platforms;
      this.logger.debug(platforms);
    });

    // autocomplete for the permanentHost
    this.editSensorForm.get('permanentHost').valueChanges
    .pipe(
      filter((value: string) => value.length > 2),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.permanentHostService.getPermanentHosts({id: {begins: value}}))
    )
    .subscribe(({data: permanentHosts}) => {
      this.permanentHostChoices = permanentHosts;
      this.logger.debug(permanentHosts);
    });

  }


  onInitialConfigChange(updatedConfig) {
    this.logger.debug('edit-sensor component is aware that the initial config has changed');
    this.logger.debug(updatedConfig);
    this.editedInitialConfigs = updatedConfig;
  }

  onCurrentConfigChange(updatedConfig) {
    this.logger.debug('edit-sensor component is aware that the current config has changed');
    this.logger.debug(updatedConfig);
    this.editedCurrentConfigs = updatedConfig;
  }


  onSubmit(updates) {

    this.updateState = 'updating';
    this.updateErrorMessage = '';

    const updatesWithConfigAdded = cloneDeep(updates);
    updatesWithConfigAdded.initialConfig = this.editedInitialConfigs;
    updatesWithConfigAdded.currentConfig = this.editedCurrentConfigs;

    this.logger.debug('Updates before tidying')
    this.logger.debug(updatesWithConfigAdded);

    // If some of the properties haven't even changed then don't bother sending them to the server.
    const cleanedUpdates = this.utilsService.removeUnchangedUpdates(updatesWithConfigAdded, this.sensor);

    // I don't want any IDs included for the config objects
    if (cleanedUpdates.initialConfig) {
      cleanedUpdates.initialConfig = cleanedUpdates.initialConfig.map(this.stripIdFromObject); 
    }
    if (cleanedUpdates.currentConfig) {
      cleanedUpdates.currentConfig = cleanedUpdates.currentConfig.map(this.stripIdFromObject);
    }

    const keysToNullOrRemove = ['label', 'permanentHost', 'hasDeployment', 'isHostedBy'];
    keysToNullOrRemove.forEach((key) => {  
      if (cleanedUpdates[key] === '') {
        if (this.sensor[key]) {
          // Allows this property to be unset
          cleanedUpdates[key] = null;
        } else {
          // Won't unset a property that wasn't previously set.
          delete cleanedUpdates[key];
        }
      }
    })

    this.logger.debug('Updates after tidying:')
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

  stripIdFromObject(obj: object): object {
    const newObj = cloneDeep(obj);
    delete newObj.id;
    return newObj;
  }



}
