import { Component, OnInit } from '@angular/core';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {FeatureOfInterestService} from '../feature-of-interest.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {FeatureOfInterest} from '../feature-of-interest';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'uo-view-featureOfInterest',
  templateUrl: './view-feature-of-interest.component.html',
  styleUrls: ['./view-feature-of-interest.component.css']
})
export class ViewFeatureOfInterestComponent implements OnInit {

  featureOfInterest: FeatureOfInterest;
  featureOfInterestId: string;
  getState = 'getting';
  deleteState = 'pending';
  getErrorMessage = '';

  constructor(
    private logger: UoLoggerService,
    private featureOfInterestService: FeatureOfInterestService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.featureOfInterestId = params.get('featureOfInterestId');
      this.logger.debug(`FeatureOfInterest id from route params: '${this.featureOfInterestId}'`);

      this.getState = 'getting';
      this.featureOfInterestService.getFeatureOfInterest(this.featureOfInterestId)
      .pipe(
        catchError((error) => {
          this.getState = 'failed';
          this.getErrorMessage = error.message;
          return throwError(error);
        })
      )
      .subscribe((featureOfInterest) => {
        this.logger.debug(featureOfInterest);
        this.getState = 'got';
        this.featureOfInterest = featureOfInterest;
      })

    });

  }

  onDeleted(featureOfInterestId: string) {
    this.logger.debug(`${this.constructor.name} is aware that '${featureOfInterestId}' has been deleted.`)
    this.deleteState = 'deleted';
  }

}
