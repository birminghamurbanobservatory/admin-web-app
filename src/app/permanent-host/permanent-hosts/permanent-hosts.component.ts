import { Component, OnInit } from '@angular/core';
import {PermanentHostService} from '../permanent-host.service';
import {throwError} from 'rxjs';
import {PermanentHost} from '../permanent-host';
import {catchError, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {FormBuilder} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {CollectionMeta} from 'src/app/shared/collection-meta';
import * as check from 'check-types';

@Component({
  selector: 'uo-permanent-hosts',
  templateUrl: './permanent-hosts.component.html',
  styleUrls: ['./permanent-hosts.component.css']
})
export class PermanentHostsComponent implements OnInit {

  state = 'getting';
  getErrorMessage: string;
  permanentHosts: PermanentHost[] = [];
  meta: CollectionMeta;
  limit = 10;
  limitOptions = [10, 50, 100];
  offset = 0;
  optionsForm;

  constructor(
    private logger: UoLoggerService,
    private permanentHostService: PermanentHostService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    // Set some defaults, and any validators.
    this.optionsForm = this.fb.group({
      nest: true,
      search: '',
      inDeployment: ''
    });

    this.route.queryParams.subscribe(params => {
      this.logger.debug('Query string parameters', params)
      // Update form values using these query parameters
      if (check.nonEmptyString(params.search)) this.optionsForm.controls['search'].setValue(params.search, {emitEvent: false});
      if (check.assigned(params.limit)) this.limit = params.limit;
      if (check.assigned(params.offset)) this.offset = params.offset;

      this.getPermanentHosts();
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

  }


  getPermanentHosts() {
    this.state = 'getting';

    const where: any = {};
    const searchText = this.optionsForm.get('search').value;
    if (check.nonEmptyString(searchText)) {
      where.search = searchText;
    }

    const options = {
      limit: this.limit,
      offset: this.offset
    };

    this.permanentHostService.getPermanentHosts(where, options)
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        return throwError(err);
      })
    )
    .subscribe(({data: permanentHosts, meta}) => {
      this.state = 'got';
      this.permanentHosts = permanentHosts;
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


  onDeleted(permanentHostId: string) {
    this.logger.debug(`The PermanentHostsComponent is aware that the permanent host '${permanentHostId}' has been deleted.`)
    this.permanentHosts = this.permanentHosts.filter((permanentHost) => permanentHost.id !== permanentHostId);
  }  


}
