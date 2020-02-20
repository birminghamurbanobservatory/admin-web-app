import { Component, OnInit } from '@angular/core';
import {PlatformService} from '../platform.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Platform} from '../platform';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';

// This is simply a wrapper around the PlatformComponent that makes it easy to reuse the PlatformComponent for both the PlatformsComponent where loads of platforms are viewed in a list, and for viewing a single platform as is the case here.

@Component({
  selector: 'uo-view-platform',
  templateUrl: './view-platform.component.html',
  styleUrls: ['./view-platform.component.css']
})
export class ViewPlatformComponent implements OnInit {

  platform: Platform;
  platformId: string;
  getState = 'getting';
  deleteState = 'pending';
  getErrorMessage = '';

  constructor(
    private logger: UoLoggerService,
    private platformService: PlatformService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.platformId = params.get('platformId');
      this.logger.debug(`Platform id from route params: '${this.platformId}'`);

      this.getState = 'getting';
      this.platformService.getPlatform(this.platformId)
      .pipe(
        catchError((error) => {
          this.getState = 'failed';
          this.getErrorMessage = error.message;
          return throwError(error);
        })
      )
      .subscribe((platform) => {
        this.logger.debug(platform);
        this.getState = 'got';
        this.platform = platform;
      })

    });

  }

  onDeleted(platformId: string) {
    this.logger.debug(`The view-platfrom component is aware that the platform ${platformId} has been deleted.`)
    this.deleteState = 'deleted';
  }

}
