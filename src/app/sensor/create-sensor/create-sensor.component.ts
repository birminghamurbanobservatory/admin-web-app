import { Component, OnInit } from '@angular/core';
import {timer, Observable, throwError} from 'rxjs';
import {SensorService} from '../sensor.service';
import {FormBuilder, Validators} from '@angular/forms';
import {catchError, switchMap, map, filter, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {UtilsService} from 'src/app/utils/utils.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {PermanentHostService} from 'src/app/permanent-host/permanent-host.service';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';

@Component({
  selector: 'uo-create-sensor',
  templateUrl: './create-sensor.component.html',
  styleUrls: ['./create-sensor.component.css']
})
export class CreateSensorComponent implements OnInit {

  createSensorForm;
  createErrorMessage = '';
  state = 'pending';
  permanentHostChoices = [];
  deploymentChoices = [];
  hostOrDep = 'neither';
  sensorInitialConfig = [];

  constructor(
    private sensorService: SensorService,
    private logger: UoLoggerService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private route: ActivatedRoute,
    private permanentHostService: PermanentHostService,  
    private deploymentService: DeploymentService
  ) {}

  ngOnInit() {

    this.createSensorForm = this.fb.group({
      name: '',
      id: [this.route.snapshot.paramMap.get('id') || '', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
      description: '',
      // N.B. this snapshot approach is fine as long as you never reuse the component, i.e. you always naviagate to another component before coming back to this one, e.g. with a different permanentHost.
      permanentHost: [this.route.snapshot.paramMap.get('permanentHost') || ''],
      inDeployment: [this.route.snapshot.paramMap.get('inDeployment') || ''],
    });

    if (this.route.snapshot.paramMap.get('permanentHost')) {
      this.selectHostOverDep();
    } else if (this.route.snapshot.paramMap.get('inDeployment')) {
      this.selectDepOverHost();
    }

    this.onChanges();

  }


  onChanges() {

    // autocomplete for the permanentHost
    this.createSensorForm.get('permanentHost').valueChanges
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

    // autoComplete for inDeployment
    this.createSensorForm.get('inDeployment').valueChanges
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

    // Toggle permanentHost vs inDeployment in response to permanentHost changes
    this.createSensorForm.get('permanentHost').valueChanges
    .pipe(
      distinctUntilChanged()
    )
    .subscribe(value => {
      if (value.length === 0 && !this.createSensorForm.get('inDeployment').value) {
        this.selectNeitherHostOrDep();
      }
      if (value.length > 0) {
        this.selectHostOverDep();
      }
    });

    // Toggle permanentHost vs inDeployment in response to inDeployment changes
    this.createSensorForm.get('inDeployment').valueChanges
    .pipe(
      distinctUntilChanged()
    )
    .subscribe(value => {
      if (value.length === 0 && !this.createSensorForm.get('permanentHost').value) {
        this.selectNeitherHostOrDep();
      }
      if (value.length > 0) {
        this.selectDepOverHost();
      }
    });

  }

  selectHostOverDep() {
    this.hostOrDep = 'host';
    this.createSensorForm.controls['inDeployment'].disable();
    this.createSensorForm.controls['inDeployment'].setValue('');
  }

  selectDepOverHost() {
    this.hostOrDep = 'dep';
    this.createSensorForm.controls['permanentHost'].disable();
    this.createSensorForm.controls['permanentHost'].setValue('');
  }

  selectNeitherHostOrDep() {
    this.logger.debug('Selecting neither permanentHost or inDeployment');
    this.hostOrDep = 'neither';
    this.createSensorForm.controls['permanentHost'].enable();
    this.createSensorForm.controls['inDeployment'].enable();
  }


  onSubmit(sensorToCreate) {
    this.state = 'creating';
    this.createErrorMessage = '';
    this.logger.debug(sensorToCreate);

    const cleanedSensor = this.utilsService.stripEmptyStrings(sensorToCreate);

    // Add the initialConfig
    cleanedSensor.initialConfig = this.sensorInitialConfig.map((config) => {
      delete config.id;
      return config;
    });

    this.sensorService.createSensor(cleanedSensor)
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

  onInitialConfigChange(newConfig) {
    this.logger.debug('create-sensor component is aware that the initialConfig has changed');
    this.logger.debug(newConfig);
    this.sensorInitialConfig = newConfig;
  }


}
