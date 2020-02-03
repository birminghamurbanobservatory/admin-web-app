import { Component, OnInit } from '@angular/core';
import {PermanentHostService} from '../permanent-host.service';
import {throwError} from 'rxjs';
import {PermanentHost} from '../permanent-host';
import {catchError} from 'rxjs/operators';
import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'uo-permanent-hosts',
  templateUrl: './permanent-hosts.component.html',
  styleUrls: ['./permanent-hosts.component.css']
})
export class PermanentHostsComponent implements OnInit {

  state = 'getting';
  getErrorMessage: string;
  permanentHosts: PermanentHost[];

  constructor(
    private logger: NGXLogger,
    private permanentHostService: PermanentHostService,
  ) { }

  ngOnInit() {
    this.getPermanentHosts();
  }


  getPermanentHosts() {

    this.state = 'getting';
    this.permanentHostService.getPermanentHosts()
    .pipe(
      catchError((err) => {
        this.getErrorMessage = err.message;
        this.state = 'failed';
        return throwError(err);
      })
    )
    .subscribe((permanentHosts: PermanentHost[]) => {
      this.state = 'got';
      this.permanentHosts = permanentHosts;
    })    
    
  }


  onDeleted(permanentHostId: string) {
    this.logger.debug(`The PermanentHostsComponent is aware that the permanent host '${permanentHostId}' has been deleted.`)
    this.permanentHosts = this.permanentHosts.filter((permanentHost) => permanentHost.id !== permanentHostId);
  }  


}
