import { Component, OnInit } from '@angular/core';
import {SensorService} from '../sensor.service';
import {Sensor} from '../sensor';
import {catchError, switchMap, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {FormBuilder} from '@angular/forms';
import {CollectionMeta} from 'src/app/shared/collection-meta';
import {Deployment} from 'src/app/deployment/deployment';
import * as check from 'check-types';
import {DeploymentService} from 'src/app/deployment/deployment.service';

@Component({
  selector: 'uo-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {

  sensors: Sensor[] = [];
  deployments: Deployment[] = [];
  selectedPermanentHostId: string;
  getErrorMessage: string;
  state = 'getting';
  meta: CollectionMeta;
  limit = 10;
  limitOptions = [10, 50, 100];
  offset = 0;
  optionsForm;

  constructor(
    private sensorService: SensorService,
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
      hasDeployment: '--all--'
    });

    this.deploymentService.getDeployments().subscribe(({data: deployments}) => {
      this.deployments = deployments;
    });

    this.route.queryParams.subscribe(params => {
      this.logger.debug('Query string parameters', params)
      // Update form values using these query parameters
      if (check.nonEmptyString(params.search)) this.optionsForm.controls['search'].setValue(params.search, {emitEvent: false});
      if (check.nonEmptyString(params.hasDeployment)) this.optionsForm.controls['hasDeployment'].setValue(params.hasDeployment, {emitEvent: false});
      if (check.nonEmptyString(params.permanentHost)) this.selectedPermanentHostId = params.permanentHost;
      if (check.assigned(params.limit)) this.limit = params.limit;
      if (check.assigned(params.offset)) this.offset = params.offset;

      this.getSensors();
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

    this.optionsForm.get('hasDeployment').valueChanges.subscribe((newValue) => {
      this.logger.debug(`New hasDeployment value from form: ${newValue}`);
      const valueForRouter = check.nonEmptyString(newValue) ? newValue : undefined;
      // Update the url query parameters
      this.router.navigate([], {
        queryParams: {hasDeployment:  valueForRouter},
        queryParamsHandling: 'merge', // keeps any existing query parameters
        relativeTo: this.route
      });
    })

  }


  getSensors() {
    this.state = 'getting';

    const where: any = {};
    const searchText = this.optionsForm.get('search').value;
    if (check.nonEmptyString(searchText)) {
      where.search = searchText;
    }
    const hasDeployment = this.optionsForm.get('hasDeployment').value;
    if (hasDeployment === '--all--') {
      // do nothing
    } else if (hasDeployment === '--none--') {
      where.hasDeployment = {exists: false};
    } else if (check.nonEmptyString(hasDeployment)) {
      where.hasDeployment = hasDeployment
    }

    if (check.nonEmptyString(this.selectedPermanentHostId)) {
      where.permanentHost = this.selectedPermanentHostId;
    }

    const options = {
      limit: this.limit,
      offset: this.offset
    };

    this.sensorService.getSensors(where, options)
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        return throwError(err);
      })
    )
    .subscribe(({data: sensors, meta}) => {
      this.sensors = sensors;
      this.meta = meta;
      this.state = 'got';
    })
  }


  clearPermanentHost() {
    this.logger.debug('Clearing permanent host');
    this.selectedPermanentHostId = undefined;
    this.router.navigate([], {
      queryParams: {permanentHost:  undefined},
      queryParamsHandling: 'merge', // keeps any existing query parameters
      relativeTo: this.route
    });
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


  onDeleted(sensorId: string) {
    this.logger.debug(`The SensorsComponent is aware that the sensor ${sensorId} has been deleted.`)
    this.sensors = this.sensors.filter((sensor) => sensor.id !== sensorId);
  }


}
