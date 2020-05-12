import { Component, OnInit } from '@angular/core';
import {FeatureOfInterest} from '../feature-of-interest';
import {Deployment} from 'src/app/deployment/deployment';
import {CollectionMeta} from 'src/app/shared/collection-meta';
import {FeatureOfInterestService} from '../feature-of-interest.service';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import * as check from 'check-types';
import {debounceTime, distinctUntilChanged, catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'uo-featuresOfInterest',
  templateUrl: './features-of-interest.component.html',
  styleUrls: ['./features-of-interest.component.css']
})
export class FeaturesOfInterestComponent implements OnInit {

  featuresOfInterest: FeatureOfInterest[] = [];
  deployments: Deployment[] = [];
  getErrorMessage: string;
  state = 'getting';
  meta: CollectionMeta;
  limit = 50;
  limitOptions = [10, 50, 100];
  offset = 0;
  optionsForm;

  constructor(
    private featureOfInterestService: FeatureOfInterestService,
    private deploymentService: DeploymentService,
    private logger: UoLoggerService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    // Set some defaults, and any validators.
    this.optionsForm = this.fb.group({
      search: '',
      belongsToDeployment: '--all--',
      listed: 'all',
      inCommonVocab: 'all'
    });

    this.deploymentService.getDeployments().subscribe(({data: deployments}) => {
      this.deployments = deployments;
    });

    this.route.queryParams.subscribe(params => {
      this.logger.debug('Query string parameters', params)
      // Update form values using these query parameters
      if (check.nonEmptyString(params.search)) this.optionsForm.controls['search'].setValue(params.search, {emitEvent: false});
      if (check.nonEmptyString(params.belongsToDeployment)) this.optionsForm.controls['belongsToDeployment'].setValue(params.belongsToDeployment, {emitEvent: false});
      const listedValue = params.listed;
      if (listedValue === 'true') this.optionsForm.controls['listed'].setValue('listed', {emitEvent: false});
      if (listedValue === 'false') this.optionsForm.controls['listed'].setValue('unlisted', {emitEvent: false});
      const inCommonVocabValue = params.inCommonVocab;
      if (inCommonVocabValue === 'true') this.optionsForm.controls['inCommonVocab'].setValue('in', {emitEvent: false});
      if (inCommonVocabValue === 'false') this.optionsForm.controls['inCommonVocab'].setValue('not-in', {emitEvent: false});
      if (check.assigned(params.limit)) this.limit = params.limit;
      if (check.assigned(params.offset)) this.offset = params.offset;

      this.getFeaturesOfInterest();
    });

    this.listenForOptionChanges()

  }


  listenForOptionChanges() {
    // Although it's possible to watch for any changes to the form as a whole, It's worth watching each form input individually, because some form inputs, such as search boxes, are worth having debounce/switchmap/etc applied.

    this.optionsForm.get('search').valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
    )
    .subscribe((searchText) => {
      this.logger.debug(`New search value from form: ${searchText}`);
      const valueForRouter = check.nonEmptyString(searchText) ? searchText : undefined;
      // Update the url query parameters
      this.router.navigate([], {
        queryParams: {search:  valueForRouter},
        queryParamsHandling: 'merge', // keeps any existing query parameters
        relativeTo: this.route
      });
    })

    this.optionsForm.get('belongsToDeployment').valueChanges.subscribe((newValue) => {
      this.logger.debug(`New belongsToDeployment value from form: ${newValue}`);
      const valueForRouter = check.nonEmptyString(newValue) ? newValue : undefined;
      // Update the url query parameters
      this.router.navigate([], {
        queryParams: {belongsToDeployment:  valueForRouter},
        queryParamsHandling: 'merge', // keeps any existing query parameters
        relativeTo: this.route
      });
    })

    this.optionsForm.get('listed').valueChanges.subscribe((newValue) => {
      this.logger.debug(`New listed value from form: ${newValue}`);
      const mappings = {
        'all': undefined,
        'listed': true,
        'unlisted': false
      };
      // Update the url query parameters
      this.router.navigate([], {
        queryParams: {listed:  mappings[newValue]},
        queryParamsHandling: 'merge', // keeps any existing query parameters
        relativeTo: this.route
      });
    })

    this.optionsForm.get('inCommonVocab').valueChanges.subscribe((newValue) => {
      this.logger.debug(`New listed value from form: ${newValue}`);
      const mappings = {
        'all': undefined,
        'in': true,
        'not-in': false
      };
      // Update the url query parameters
      this.router.navigate([], {
        queryParams: {inCommonVocab:  mappings[newValue]},
        queryParamsHandling: 'merge', // keeps any existing query parameters
        relativeTo: this.route
      });
    })

  }


  getFeaturesOfInterest() {
    this.state = 'getting';

    const where: any = {};
    const searchText = this.optionsForm.get('search').value;
    if (check.nonEmptyString(searchText)) {
      where.search = searchText;
    }
    const belongsToDeployment = this.optionsForm.get('belongsToDeployment').value;
    if (belongsToDeployment === '--all--') {
      // do nothing
    } else if (belongsToDeployment === '--none--') {
      where.belongsToDeployment = {exists: false};
    } else if (check.nonEmptyString(belongsToDeployment)) {
      where.belongsToDeployment = belongsToDeployment
    }

    const listed = this.optionsForm.get('listed').value;
    if (listed === 'listed') where.listed = true;
    if (listed === 'unlisted') where.listed = false;

    const inCommonVocab = this.optionsForm.get('inCommonVocab').value;
    if (inCommonVocab === 'in') where.inCommonVocab = true;
    if (inCommonVocab === 'not-in') where.inCommonVocab = false;

    const options = {
      limit: this.limit,
      offset: this.offset
    };

    this.featureOfInterestService.getFeaturesOfInterest(where, options)
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        return throwError(err);
      })
    )
    .subscribe(({data: featuresOfInterest, meta}) => {
      this.featuresOfInterest = featuresOfInterest;
      this.meta = meta;
      this.state = 'got';
    })
  }


  pageEvent(info) {

    this.logger.debug(info);

    const newLimit = info.pageSize;
    const newOffset = info.pageIndex * this.limit;

    this.router.navigate([], {
      queryParams: {
        limit: newLimit,
        offset: newOffset
      },
      queryParamsHandling: 'merge', // keeps any existing query parameters
      relativeTo: this.route
    });

  }

  calculatePageIndex() {
    return this.offset === 0 ? 0 : Math.ceil(this.offset / this.limit);
  }


  onDeleted(featureOfInterestId: string) {
    this.logger.debug(`${this.constructor.name} is aware that ${featureOfInterestId} has been deleted.`)
    this.featuresOfInterest = this.featuresOfInterest.filter((featureOfInterest) => featureOfInterest.id !== featureOfInterestId);
  }


}
