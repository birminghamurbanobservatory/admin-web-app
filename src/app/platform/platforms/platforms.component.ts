import { Component, OnInit } from '@angular/core';
import {PlatformService} from '../platform.service';
import {Platform} from '../platform';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';

@Component({
  selector: 'uo-platforms',
  templateUrl: './platforms.component.html',
  styleUrls: ['./platforms.component.css']
})
export class PlatformsComponent implements OnInit {

  platforms: Platform[];
  state = 'pending';
  getErrorMessage: string;
  nest = true; // default to this

  constructor(
    private platformService: PlatformService,
    private logger: UoLoggerService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      this.logger.debug(params);
      const nestValue = params.nest;
      this.logger.debug(`nest value from query parameter: ${nestValue}`)
      if (nestValue === 'true') this.nest = true;
      if (nestValue === 'false') this.nest = false;
      this.logger.debug(`nest set to: ${this.nest}`);
    });

    this.getPlatforms();

  }


  getPlatforms() {
    this.logger.debug('Getting platforms');
    this.state = 'getting';
    this.platformService.getPlatforms()
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        return throwError(err);
      })
    )
    .subscribe((platforms: Platform[]) => {
      this.state = 'got';
      this.platforms = platforms;
    })
  }


  toggleNest() {

    const newValue = !this.nest;
    this.logger.debug(`Toggling nest from ${this.nest} to ${newValue}`);

    this.router.navigate(
      [],
      {
        queryParams: {nest: newValue},
        queryParamsHandling: 'merge',
        relativeTo: this.route
      }
    );

  }


  onDeleted(platformId: string) {
    this.logger.debug(`The platforms component is aware that the platform ${platformId} has been deleted.`)
    this.platforms = this.platforms.filter((platform) => platform.id !== platformId);
  }

}
