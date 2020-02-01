import { Component, OnInit } from '@angular/core';
import {DeploymentService} from '../deployment.service';
import {Deployment} from '../deployment';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {NGXLogger} from 'ngx-logger';


@Component({
  selector: 'uo-deployments',
  templateUrl: './deployments.component.html',
  styleUrls: ['./deployments.component.css']
})
export class DeploymentsComponent implements OnInit {

  deployments: Deployment[];
  getDeploymentsErrorMessage: string;
  state = 'getting';

  constructor(
    private deploymentService: DeploymentService,
    private logger: NGXLogger
  ) { }

  ngOnInit() {
    this.getDeployments();
  }

  getDeployments() {
    this.state = 'getting';
    this.deploymentService.getDeployments()
      .pipe(
        catchError((error) => {
          this.getDeploymentsErrorMessage = error.message;
          this.state = 'failed';
          return throwError(error);
        })
      )
      .subscribe((deployments: Deployment[]) => {
        this.state = 'got';
        this.deployments = deployments;
      })
  }

  onDeleted(deploymentId: string) {
    this.logger.debug(`The deployments component is aware that the deployment ${deploymentId} has been deleted.`)
    this.deployments = this.deployments.filter((deployment) => deployment.id !== deploymentId);
  }


}
