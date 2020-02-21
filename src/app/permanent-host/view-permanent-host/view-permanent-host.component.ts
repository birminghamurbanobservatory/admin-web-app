import { Component, OnInit } from '@angular/core';
import {PermanentHost} from '../permanent-host';
import {PermanentHostService} from '../permanent-host.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'uo-view-permanent-host',
  templateUrl: './view-permanent-host.component.html',
  styleUrls: ['./view-permanent-host.component.css']
})
export class ViewPermanentHostComponent implements OnInit {

  permanentHost: PermanentHost;
  permanentHostId: string;
  getState = 'getting';
  deleteState = 'pending';
  getErrorMessage = '';

  constructor(
    private logger: UoLoggerService,
    private permanentHostService: PermanentHostService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.permanentHostId = params.get('permanentHostId');
      this.logger.debug(`Permanent host id from route params: '${this.permanentHostId}'`);

      this.getState = 'getting';
      this.permanentHostService.getPermanentHost(this.permanentHostId)
      .pipe(
        catchError((error) => {
          this.getState = 'failed';
          this.getErrorMessage = error.message;
          return throwError(error);
        })
      )
      .subscribe((permanentHost) => {
        this.logger.debug(permanentHost);
        this.getState = 'got';
        this.permanentHost = permanentHost;
      })

    });

  }

  onDeleted(permanentHostId: string) {
    this.logger.debug(`The view-permanent-host component is aware that the permanent host '${permanentHostId}' has been deleted.`)
    this.deleteState = 'deleted';
  }

}
