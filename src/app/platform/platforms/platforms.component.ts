import { Component, OnInit } from '@angular/core';
import {NGXLogger} from 'ngx-logger';
import {PlatformService} from '../platform.service';
import {Platform} from '../platform';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'uo-platforms',
  templateUrl: './platforms.component.html',
  styleUrls: ['./platforms.component.css']
})
export class PlatformsComponent implements OnInit {

  platforms: Platform[];
  state = 'pending';
  getErrorMessage: string;

  constructor(
    private platformService: PlatformService,
    private logger: NGXLogger
  ) { }

  ngOnInit() {
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


  onDeleted(platformId: string) {
    this.logger.debug(`The platforms component is aware that the platform ${platformId} has been deleted.`)
    this.platforms = this.platforms.filter((platform) => platform.id !== platformId);
  }

}
