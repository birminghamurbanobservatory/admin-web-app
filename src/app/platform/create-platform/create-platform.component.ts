import { Component, OnInit } from '@angular/core';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {PlatformService} from '../platform.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {FormBuilder, Validators} from '@angular/forms';
import {UtilsService} from 'src/app/utils/utils.service';
import {catchError, filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {timer, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

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
  selectedGeometry: any;

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
      name: ['', Validators.required],
      id: ['', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
      description: '',
      static: true,
      // N.B. this snapshot approach is fine as long as you never reuse the component, i.e. you always naviagate to another component before coming back to this one, e.g. with a different permanentHost.
      inDeployment: [this.route.snapshot.paramMap.get('inDeployment') || '', Validators.required],
      isHostedBy: [this.route.snapshot.paramMap.get('isHostedBy') || '']
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


  onLocationSelection(geometry) {
    this.logger.debug('create-platform component is aware of the location change');
    this.logger.debug(geometry);
    this.selectedGeometry = geometry;
  }


  onSubmit(platformToCreate) {
    this.state = 'creating';
    this.createErrorMessage = '';
    this.logger.debug(platformToCreate);

    const cleanedPlatform = this.utilsService.stripEmptyStrings(platformToCreate);

    if (this.selectedGeometry) {
      cleanedPlatform.location = {geometry: this.selectedGeometry}
    }

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
      this.logger.debug(createdPlatform);

      timer(1400).subscribe(() => {
        this.state = 'pending';
      });

    })    

  }


}
