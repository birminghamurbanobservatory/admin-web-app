import { Component, OnInit } from '@angular/core';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {PlatformService} from '../platform.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {FormBuilder, Validators} from '@angular/forms';
import {UtilsService} from 'src/app/utils/utils.service';
import {catchError, filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {timer, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {PointLocation} from 'src/app/location/point-location-selector/point-location.interface';
import * as check from 'check-types';

@Component({
  selector: 'uo-create-platform',
  templateUrl: './create-platform.component.html',
  styleUrls: ['./create-platform.component.css']
})
export class CreatePlatformComponent implements OnInit {

  createPlatformForm;
  createErrorMessage = '';
  state = 'pending';
  deploymentChoices = [];
  hostPlatformChoices = [];
  pointLocation: PointLocation;

  constructor(
    private platformService: PlatformService,
    private deploymentService: DeploymentService,
    private logger: UoLoggerService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {

    this.createPlatformForm = this.fb.group({
      label: ['', Validators.required],
      id: ['', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
      description: '',
      static: true,
      // N.B. this snapshot approach is fine as long as you never reuse the component, i.e. you always naviagate to another component before coming back to this one, e.g. with a different permanentHost.
      inDeployment: [this.route.snapshot.paramMap.get('inDeployment') || '', Validators.required],
      isHostedBy: [this.route.snapshot.paramMap.get('isHostedBy') || ''],
      height: [{value: null, disabled: true}] // should be disabled until a location is available
    });

    this.listenForImportantChanges();

  }

  listenForImportantChanges() {

    this.createPlatformForm.get('inDeployment').valueChanges
    .pipe(
      filter((value: string) => value.length > 1),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.deploymentService.getDeployments({id: {begins: value}}))
    )
    .subscribe(({data: deployments}) => {
      this.deploymentChoices = deployments;
      this.logger.debug(deployments);
    });

    this.createPlatformForm.get('isHostedBy').valueChanges
    .pipe(
      filter((value: string) => value.length > 1),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.platformService.getPlatforms({id: {begins: value}}))
    )
    .subscribe(({data: platforms}) => {
      this.hostPlatformChoices = platforms;
      this.logger.debug(platforms);
    });

  }


  onPointLocationSelection(newLocation) {
    this.logger.debug('create-platform component is aware of the point location change');
    this.logger.debug(newLocation);
    this.pointLocation = newLocation;
    // We can also enable the height input now
    this.createPlatformForm.controls['height'].enable();
  }


  onSubmit(platformToCreate) {
    this.state = 'creating';
    this.createErrorMessage = '';
    this.logger.debug(platformToCreate);

    const cleanedPlatform = this.utilsService.stripEmptyStrings(platformToCreate);

    // Add in the location and the height
    if (this.pointLocation) {
      cleanedPlatform.location = {
        geometry: {
          type: 'Point',
          coordinates: [this.pointLocation.lng, this.pointLocation.lat]
        }
      }
      // N.B. we can't include the height unless there's a location.
      if (check.number(cleanedPlatform.height)) {
        cleanedPlatform.location.properties = {
          height: cleanedPlatform.height
        }
      }
    }
    delete cleanedPlatform.height;

    this.logger.debug(cleanedPlatform);

    this.platformService.createPlatform(cleanedPlatform)
    .pipe(
      catchError((error) => {
        this.state = 'failed';
        this.createErrorMessage = error.message;
        timer(1400).subscribe(() => {
          this.state = 'pending';
        });
        return throwError(error);
      })
    )
    .subscribe((createdPlatform) => {
      this.state = 'created';
      this.logger.debug('Created Platform:')
      this.logger.debug(createdPlatform);

      timer(1400).subscribe(() => {
        this.state = 'pending';
      });

    })    

  }


}
