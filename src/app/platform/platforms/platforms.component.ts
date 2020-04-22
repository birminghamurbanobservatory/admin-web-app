import { Component, OnInit } from '@angular/core';
import {PlatformService} from '../platform.service';
import {Platform} from '../platform';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {cloneDeep, concat} from 'lodash';
import {CollectionMeta} from 'src/app/shared/collection-meta';
import * as check from 'check-types';

@Component({
  selector: 'uo-platforms',
  templateUrl: './platforms.component.html',
  styleUrls: ['./platforms.component.css']
})
export class PlatformsComponent implements OnInit {

  platforms: Platform[] = [];
  meta: CollectionMeta;
  limit = 10;
  limitOptions = [1, 10, 50];
  offset = 0;
  state = 'pending';
  getErrorMessage: string;
  optionsForm;

  constructor(
    private platformService: PlatformService,
    private logger: UoLoggerService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    // Set some defaults, and any validators.
    this.optionsForm = this.fb.group({
      nest: true
    });

    this.route.queryParams.subscribe(params => {
      this.logger.debug('Query string parameters', params)
      const nestValue = params.nest;
      // Update form values using these query parameters
      if (nestValue === 'true') this.optionsForm.controls['nest'].setValue(true, {emitEvent: false});
      if (nestValue === 'false') this.optionsForm.controls['nest'].setValue(false, {emitEvent: false});
      if (check.assigned(params.limit)) this.limit = params.limit;
      if (check.assigned(params.offset)) this.offset = params.offset;

      this.getPlatforms();
    });

    this.listenForOptionChanges()

  }


  listenForOptionChanges() {

    // Although it's possible to watch for any changes to the form as a whole, I've decided it's worth watching each form input individually, because some form inputs, such as search boxes, are worth having debounce/switchmap/etc applied.

    this.optionsForm.get('nest').valueChanges.subscribe((newNestValue) => {
      this.logger.debug(`New nest value from form: ${newNestValue}`);
      // Update the url query parameters
      this.router.navigate([], {
        queryParams: {nest:  newNestValue},
        queryParamsHandling: 'merge', // keeps any existing query parameters
        relativeTo: this.route
      });
    })

  }


  getPlatforms() {
    this.logger.debug('Getting platforms');
    this.state = 'getting';
    const nestValue = this.optionsForm.get('nest').value;
    const where = {};
    const options = {
      nest: nestValue,
      limit: this.limit,
      offset: this.offset
    };
    this.platformService.getPlatforms(where, options)
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        return throwError(err);
      })
    )
    .subscribe(({data: platforms, meta}) => {
      console.log(platforms);
      console.log(meta);
      if (nestValue === true) {
        this.platforms = this.flattenNestedPlatforms(platforms); 
      } else {
        this.platforms = platforms;
      }
      this.meta = meta;
      this.state = 'got';
    })
  }


  flattenNestedPlatforms(platformsNested: Platform[]): Platform[] {

    // It may seem a little silly flattening platforms when we've specifically asked for them to be nested, but by getting them nested we can easily work out what depth they are and use this to apply an indent in the HTML to express their hierachical nature to the user.
    const flattened = this.recursiveNestedPlatformProcessing(platformsNested);
    return flattened;

  }


  recursiveNestedPlatformProcessing(platforms: Platform[], depth = 0) {

    let allPlatforms = [];
    platforms.forEach((platform) => {
      const thisPlatform = cloneDeep(platform);
      let itsPlatforms = [];
      if (thisPlatform.hosts) {
        itsPlatforms = thisPlatform.hosts.filter((hostee) => {
          return hostee['@type'] === 'Platform';
        })
        if (itsPlatforms.length > 0) {
          itsPlatforms = this.recursiveNestedPlatformProcessing(itsPlatforms, depth + 1);
        }
        // So that we don't end up with loads of duplicate data, let's remove any platforms from the hosts array of this platform, leaving just the sensors.
        thisPlatform.hosts = thisPlatform.hosts.filter((hostee) => hostee['@type'] === 'Sensor');
      } else {
        // For the sake of consistency, if the server hasn't already done this, let's make sure they all have a hosts array.
        thisPlatform.hosts = [];
      }
      thisPlatform.depth = depth;
      if (thisPlatform['@id']) {
        thisPlatform.id = thisPlatform['@id'];
      }
      const thisBranch = concat([thisPlatform], itsPlatforms);
      allPlatforms = concat(allPlatforms, thisBranch);
    })

    return allPlatforms;

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


  setExpansionPanelHeaderStyle(depth = 0) {
    if (this.optionsForm.get('nest').value) {
      const colors = ['#BEBEBE', '#D0D0D0', '#DCDCDC', '#F5F5F5', '#FFFFFF'];
      const colorIdx = Math.min(depth, colors.length - 1);
      return {
        'background-color': colors[colorIdx],
        'margin': 100
      }
    } else {
      return {};
    }
  }



  onDeleted(platformId: string) {
    this.logger.debug(`The platforms component is aware that the platform ${platformId} has been deleted.`)
    this.platforms = this.platforms.filter((platform) => platform.id !== platformId);
  }

}
