import { Component, OnInit } from '@angular/core';
import {FeatureOfInterestService} from '../feature-of-interest.service';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {UtilsService} from 'src/app/utils/utils.service';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {filter, debounceTime, distinctUntilChanged, switchMap, catchError} from 'rxjs/operators';
import {timer, throwError} from 'rxjs';

@Component({
  selector: 'uo-create-featureOfInterest',
  templateUrl: './create-feature-of-interest.component.html',
  styleUrls: ['./create-feature-of-interest.component.css']
})
export class CreateFeatureOfInterestComponent implements OnInit {

  createFeatureOfInterestForm;
  createErrorMessage = '';
  state = 'pending';
  deploymentChoices = [];
  hostFeatureOfInterestChoices = [];
  selectedGeometry: any;

  constructor(
    private featureOfInterestService: FeatureOfInterestService,
    private deploymentService: DeploymentService,
    private logger: UoLoggerService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {

    this.createFeatureOfInterestForm = this.fb.group({
      id: ['', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
      label: ['', Validators.required],
      comment: '',
      listed: true,
      inCommonVocab: false,
      // N.B. this snapshot approach is fine as long as you never reuse the component, i.e. you always naviagate to another component before coming back to this one, e.g. with a different permanentHost.
      belongsToDeployment: [this.route.snapshot.paramMap.get('belongsToDeployment') || '']
    });

    this.listenForImportantChanges();

  }

  listenForImportantChanges() {

    this.createFeatureOfInterestForm.get('belongsToDeployment').valueChanges
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

  }

  onSubmit(featureOfInterestToCreate) {
    this.state = 'creating';
    this.createErrorMessage = '';
    this.logger.debug(featureOfInterestToCreate);

    const cleanedFeatureOfInterest = this.utilsService.stripEmptyStrings(featureOfInterestToCreate);

    this.featureOfInterestService.createFeatureOfInterest(cleanedFeatureOfInterest)
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
    .subscribe((createdFeatureOfInterest) => {
      this.state = 'created';
      this.logger.debug(createdFeatureOfInterest);

      timer(1400).subscribe(() => {
        this.state = 'pending';
      });

    })    

  }

}
