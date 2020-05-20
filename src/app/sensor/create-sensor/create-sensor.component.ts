import { Component, OnInit, OnDestroy } from '@angular/core';
import {timer, Observable, throwError, Subject, of} from 'rxjs';
import {SensorService} from '../sensor.service';
import {FormBuilder, Validators} from '@angular/forms';
import {catchError, switchMap, map, filter, debounceTime, distinctUntilChanged, takeUntil, flatMap} from 'rxjs/operators';
import {UtilsService} from 'src/app/utils/utils.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {PermanentHostService} from 'src/app/permanent-host/permanent-host.service';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {Sensor} from '../sensor';
import {PermanentHost} from 'src/app/permanent-host/permanent-host';
import {PlatformService} from 'src/app/platform/platform.service';

@Component({
  selector: 'uo-create-sensor',
  templateUrl: './create-sensor.component.html',
  styleUrls: ['./create-sensor.component.css']
})
export class CreateSensorComponent implements OnInit, OnDestroy {

  createSensorForm;
  createErrorMessage = '';
  state = 'pending';
  permanentHostChoices = [];
  deploymentChoices = [];
  platformChoices = [];
  hostOrDep = 'neither';
  sensorInitialConfig = [];
  createdSensor: Sensor;
  createdPermanentHost: PermanentHost;
  private unsubscribe$ = new Subject();

  constructor(
    private sensorService: SensorService,
    private logger: UoLoggerService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private route: ActivatedRoute,
    private permanentHostService: PermanentHostService,  
    private deploymentService: DeploymentService,
    private platformService: PlatformService
  ) {}

  ngOnInit() {

    this.createSensorForm = this.fb.group({
      name: '',
      id: [this.route.snapshot.paramMap.get('id') || '', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
      description: '',
      // N.B. this snapshot approach is fine as long as you never reuse the component, i.e. you always naviagate to another component before coming back to this one, e.g. with a different permanentHost.
      permanentHost: [this.route.snapshot.paramMap.get('permanentHost') || ''],
      hasDeployment: [this.route.snapshot.paramMap.get('hasDeployment') || ''],
      isHostedBy: [this.route.snapshot.paramMap.get('isHostedBy') || ''],
    });

    if (this.route.snapshot.paramMap.get('permanentHost')) {
      this.selectHostOverDep();
    } else if (this.route.snapshot.paramMap.get('hasDeployment') || this.route.snapshot.paramMap.get('isHostedBy')) {
      this.selectDepOverHost();
    }

    this.onChanges();

  }


  onChanges() {

    // autocomplete for the permanentHosts
    this.createSensorForm.get('permanentHost').valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
      filter((value: string) => value.length > 0),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.permanentHostService.getPermanentHosts({id: {begins: value}}))
    )
    .subscribe(({data: permanentHosts}) => {
      this.permanentHostChoices = permanentHosts;
      this.logger.debug(permanentHosts);
    });

    // autoComplete for hasDeployment
    this.createSensorForm.get('hasDeployment').valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
      filter((value: string) => value.length > 0),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.deploymentService.getDeployments({id: {begins: value}}))
    )
    .subscribe(({data: deployments}) => {
      this.deploymentChoices = deployments;
      this.logger.debug(deployments);
    });

    // autoComplete for isHostedBy
    this.createSensorForm.get('isHostedBy').valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
      filter((value: string) => value.length > 0),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.platformService.getPlatforms({id: {begins: value}}))
    )
    .subscribe(({data: platforms}) => {
      this.platformChoices = platforms;
      this.logger.debug(platforms);
    });

    // Toggle permanentHost vs hasDeployment in response to permanentHost changes
    this.createSensorForm.get('permanentHost').valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
      distinctUntilChanged()
    )
    .subscribe(value => {
      if (value.length === 0 && !this.createSensorForm.get('hasDeployment').value) {
        this.selectNeitherHostOrDep();
      }
      if (value.length > 0) {
        this.selectHostOverDep();
      }
    });

    // Toggle permanentHost vs hasDeployment in response to hasDeployment changes
    this.createSensorForm.get('hasDeployment').valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
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

    // Toggle permanentHost vs hasDeployment in response to isHostedBy changes
    this.createSensorForm.get('isHostedBy').valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
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
    this.createSensorForm.controls['hasDeployment'].disable();
    this.createSensorForm.controls['hasDeployment'].setValue('');
    this.createSensorForm.controls['isHostedBy'].disable();
    this.createSensorForm.controls['isHostedBy'].setValue('');
  }

  selectDepOverHost() {
    this.hostOrDep = 'dep';
    this.createSensorForm.controls['permanentHost'].disable();
    this.createSensorForm.controls['permanentHost'].setValue('');
  }

  selectNeitherHostOrDep() {
    this.logger.debug('Selecting neither permanentHost or hasDeployment');
    this.hostOrDep = 'neither';
    this.createSensorForm.controls['permanentHost'].enable();
    this.createSensorForm.controls['hasDeployment'].enable();
    this.createSensorForm.controls['isHostedBy'].enable();
  }


  onSubmit(sensorToCreate) {

    this.state = 'creating';

    // Reset a few things
    this.createErrorMessage = '';
    this.createdSensor = undefined;
    this.createdPermanentHost = undefined;

    const cleanedSensor = this.utilsService.stripEmptyStrings(sensorToCreate);

    // Add the initialConfig
    cleanedSensor.initialConfig = this.sensorInitialConfig.map((config) => {
      delete config.id;
      return config;
    });

    this.logger.debug(cleanedSensor);

    // First let's handle the fact we may need to create a permanent host first
    this.potentiallyCreatePermanentHost(cleanedSensor.permanentHost)
    .pipe(
      flatMap((createdPermanentHost) => {
        if (createdPermanentHost) {
          this.createdPermanentHost = createdPermanentHost;
        }
        // Now we can create the sensor
        this.logger.debug('Creating sensor');
        return this.sensorService.createSensor(cleanedSensor)
      }),
      catchError((error) => {
        this.state = 'failed';
        this.createErrorMessage = error.message;
        this.briefDelay().subscribe(() => {
          this.state = 'pending';
        });
        return throwError(error);
      })
    )
    .subscribe((createdSensor) => {
      this.state = 'created';
      this.createdSensor = createdSensor;
      this.logger.debug(createdSensor);
      this.briefDelay().subscribe(() => {
        this.state = 'pending';
      });
    })  

  }


  potentiallyCreatePermanentHost(permanentHostId): Observable<any> {

    // If the sensor we wish to create didn't have a permanent host specified then there's no need to create one.
    if (!permanentHostId) {
      this.logger.debug('No permanent host specified, so no need to create.');
      return of(null);
    }

    // Let's see if this permanentHost is present in the list of autocomplete choice, if so we know it exists and therefore we don't need to create it
    const matching = this.permanentHostChoices.find((choice) => choice.id === permanentHostId);
    if (matching) {
      this.logger.debug('Permanent host already exists so no need to create.')
      return of(matching);
    
    // If it wasn't listed in the list of choices then it implies the user wants to create a new permanent host.
    } else {
      this.logger.debug(`Creating permanent host (id: ${permanentHostId})`);
      return this.permanentHostService.createPermanentHost({id: permanentHostId})
      .pipe(
        catchError((err) => {
          // Catch instances where the permanent host already exists, it just didn't happened to be present in the list of permanent hosts. This would be rare, but could potentially occur on slow internet.
          if (err.errorCode === 'PermanentHostAlreadyExists') {
            this.logger.debug('Server told us that permanent host already exists so no need to create.')
            return of(null);
          } else {
            return throwError(err);
          }
        })
      )
    }

  }


  briefDelay(): Observable<number> {
    return timer(1400);
  }


  onInitialConfigChange(newConfig) {
    this.logger.debug('create-sensor component is aware that the initialConfig has changed');
    this.logger.debug(newConfig);
    this.sensorInitialConfig = newConfig;
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


}
