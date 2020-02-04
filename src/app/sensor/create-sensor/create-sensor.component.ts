import { Component, OnInit } from '@angular/core';
import {timer, Observable, throwError} from 'rxjs';
import {NGXLogger} from 'ngx-logger';
import {SensorService} from '../sensor.service';
import {FormBuilder, Validators} from '@angular/forms';
import {catchError, switchMap, map, filter, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {UtilsService} from 'src/app/utils/utils.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {PermanentHostService} from 'src/app/permanent-host/permanent-host.service';
import {DeploymentService} from 'src/app/deployment/deployment.service';

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

  constructor(
    private sensorService: SensorService,
    private logger: NGXLogger,
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private route: ActivatedRoute,
    private permanentHostService: PermanentHostService,  
    private deploymentService: DeploymentService
  ) {}

  ngOnInit() {

    this.createSensorForm = this.fb.group({
      name: '',
      id: '',
      description: '',
      // N.B. this snapshot approach is fine as long as you never reuse the component, i.e. you always naviagate to another component before coming back to this one, e.g. with a different permanentHost.
      permanentHost: this.route.snapshot.paramMap.get('permanentHost') || '', 
      inDeployment: this.route.snapshot.paramMap.get('inDeployment') || ''
      // TODO: Invalidate the form and show errors when both permanentHost and inDeployment defined, might be able to do this with a custom validator for each that looks to see if the other is defined.
      // TODO: add defaults
    });

    this.onChanges();

  }


  onChanges() {

    // subscribe to permanentHost form value changes
    this.createSensorForm.get('permanentHost').valueChanges
    .pipe(
      filter((value: string) => value.length > 2),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: string) => this.permanentHostService.getPermanentHosts({id: {begins: value}}))
    )
    .subscribe(permanentHosts => {
      this.permanentHostChoices = permanentHosts;
      console.log(permanentHosts);
    });

    // subscribe to inDeployment form value changes
    this.createSensorForm.get('inDeployment').valueChanges
    .pipe(
      filter((value: string) => value.length > 2),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: string) => this.deploymentService.getDeployments({id: {begins: value}}))
    )
    .subscribe(deployments => {
      this.deploymentChoices = deployments;
      console.log(deployments);
    });

  }


  onSubmit(sensorToCreate) {
    this.state = 'creating';
    this.createErrorMessage = '';
    this.logger.debug(sensorToCreate);

    const cleanedSensor = this.utilsService.stripEmptyStrings(sensorToCreate);

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


}
