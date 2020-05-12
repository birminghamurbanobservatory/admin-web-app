import { Component, OnInit } from '@angular/core';
import {FeatureOfInterest} from '../feature-of-interest';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {FeatureOfInterestService} from '../feature-of-interest.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {UtilsService} from 'src/app/utils/utils.service';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {catchError, filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {throwError, timer} from 'rxjs';
import {Deployment} from 'src/app/deployment/deployment';

@Component({
  selector: 'uo-edit-featureOfInterest',
  templateUrl: './edit-feature-of-interest.component.html',
  styleUrls: ['./edit-feature-of-interest.component.css']
})
export class EditFeatureOfInterestComponent implements OnInit {

  featureOfInterestId: string;
  featureOfInterest: FeatureOfInterest; 
  getState = 'getting';
  getErrorMessage: string;
  editFeatureOfInterestForm;
  updateState = 'pending';
  updateErrorMessage: string;
  deploymentChoices: Deployment[] = [];

  constructor(
    private logger: UoLoggerService,
    private featureOfInterestService: FeatureOfInterestService,
    private deploymentService: DeploymentService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.featureOfInterestId = params.get('featureOfInterestId');
      this.logger.debug(`FeatureOfInterest ID from route params: '${this.featureOfInterestId}'`);
      this.getFeatureOfInterestAndPopulateForm(this.featureOfInterestId);
    });

  }

  getFeatureOfInterestAndPopulateForm(featureOfInterestId: string) {

    this.getState = 'getting';
    this.featureOfInterestService.getFeatureOfInterest(featureOfInterestId)
    .pipe(
      catchError((error) => {
        this.getState = 'failed';
        this.getErrorMessage = error.message;
        return throwError(error);
      })
    )
    .subscribe((featureOfInterest: FeatureOfInterest) => {
      this.logger.debug(featureOfInterest);

      this.editFeatureOfInterestForm = this.fb.group({
        label: [featureOfInterest.label, Validators.required],
        comment: [featureOfInterest.comment],
        listed: [featureOfInterest.listed],
        inCommonVocab: [featureOfInterest.inCommonVocab],
        belongsToDeployment: [
          featureOfInterest.belongsToDeployment || ''
        ],
      });

      this.getState = 'got';
      this.featureOfInterest = featureOfInterest;

      this.onChanges();
 
    })

  }

  onChanges() {

    // autocomplete for isHostedBy
    this.editFeatureOfInterestForm.get('belongsToDeployment').valueChanges
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

  }


  onSubmit(updates) {

    this.updateState = 'updating';
    this.updateErrorMessage = '';

    // If some of the properties haven't even changed then don't bother sending them to the server.
    const cleanedUpdates = this.utilsService.removeUnchangedUpdates(updates, this.featureOfInterest);

    const keysToNullOrRemove = ['belongsToDeployment'];
    keysToNullOrRemove.forEach((key) => {  
      if (cleanedUpdates[key] === '') {
        if (this.featureOfInterest[key]) {
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
      this.featureOfInterestService.updateFeatureOfInterest(this.featureOfInterestId, cleanedUpdates)
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
      .subscribe((updatedFeatureOfInterest: FeatureOfInterest) => {
        this.updateState = 'updated';
        this.featureOfInterest = updatedFeatureOfInterest;
        this.logger.debug(updatedFeatureOfInterest);
        timer(1400).subscribe(() => {
          this.updateState = 'pending';
        });
      })    
    }
  }

}
