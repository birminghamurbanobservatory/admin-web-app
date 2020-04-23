import { Component, OnInit } from '@angular/core';
import {DeploymentService} from '../deployment.service';
import {Deployment} from '../deployment';
import {catchError, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {CollectionMeta} from 'src/app/shared/collection-meta';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import * as check from 'check-types';


@Component({
  selector: 'uo-deployments',
  templateUrl: './deployments.component.html',
  styleUrls: ['./deployments.component.css']
})
export class DeploymentsComponent implements OnInit {

  deployments: Deployment[] = [];
  getErrorMessage: string;
  state = 'getting';
  meta: CollectionMeta;
  limit = 50;
  limitOptions = [10, 50, 100];
  offset = 0;
  optionsForm;

  constructor(
    private deploymentService: DeploymentService,
    private logger: UoLoggerService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    // Set some defaults, and any validators.
    this.optionsForm = this.fb.group({
      mineOnly: true,
      publicOrPrivate: 'both',
      search: ''
    });

    this.route.queryParams.subscribe(params => {
      this.logger.debug('Query string parameters', params)
      const publicValue = params.public;
      // Update form values using these query parameters
      if (publicValue === 'true') {
        this.optionsForm.controls['publicOrPrivate'].setValue('public', {emitEvent: false});
      } else if (publicValue === 'false') {
        this.optionsForm.controls['publicOrPrivate'].setValue('private', {emitEvent: false});
      } else {
        this.optionsForm.controls['publicOrPrivate'].setValue('both', {emitEvent: false});
      }
      if (check.nonEmptyString(params.search)) this.optionsForm.controls['search'].setValue(params.search, {emitEvent: false});
      if (check.assigned(params.limit)) this.limit = params.limit;
      if (check.assigned(params.offset)) this.offset = params.offset;

      this.getDeployments();
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

    this.optionsForm.get('publicOrPrivate').valueChanges.subscribe((newValue) => {
      this.logger.debug(`New publicOrPrivate value from form: ${newValue}`);
      const mappings = {
        'public': true,
        'private': false
      };
      // N.B. if new value is 'both' then the query params value will be undefined, which means it will be removed from the URL, which is what we want.
      // Update the url query parameters
      this.router.navigate([], {
        queryParams: {public:  mappings[newValue]},
        queryParamsHandling: 'merge', // keeps any existing query parameters
        relativeTo: this.route
      });
    })

    this.optionsForm.get('mineOnly').valueChanges.subscribe((newValue) => {
      this.logger.debug(`New mineOnly value from form: ${newValue}`);
      // Update the url query parameters
      this.router.navigate([], {
        queryParams: {mineOnly:  newValue},
        queryParamsHandling: 'merge', // keeps any existing query parameters
        relativeTo: this.route
      });
    })

  }


  getDeployments() {
    this.state = 'getting';

    const where: any = {};
    const searchText = this.optionsForm.get('search').value;
    if (check.nonEmptyString(searchText)) {
      where.search = searchText;
    }
    const publicOrPrivate = this.optionsForm.get('publicOrPrivate').value;
    if (publicOrPrivate === 'public') {
      where.public = true;
    }
    if (publicOrPrivate === 'private') {
      where.public = false;
    }

    const mineOnlyValue = this.optionsForm.get('mineOnly').value;
    const options = {
      mineOnly: mineOnlyValue,
      limit: this.limit,
      offset: this.offset
    };

    this.deploymentService.getDeployments(where, options)
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        return throwError(err);
      })
    )
    .subscribe(({data: deployments, meta}) => {
      this.state = 'got';
      this.deployments = deployments;
      this.meta = meta;
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


  onDeleted(deploymentId: string) {
    this.logger.debug(`The deployments component is aware that the deployment ${deploymentId} has been deleted.`)
    this.deployments = this.deployments.filter((deployment) => deployment.id !== deploymentId);
  }


}
