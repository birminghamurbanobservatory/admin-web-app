import { Component, OnInit } from '@angular/core';
import {Deployment} from '../deployment';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {DeploymentService} from '../deployment.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'uo-view-deployment',
  templateUrl: './view-deployment.component.html',
  styleUrls: ['./view-deployment.component.css']
})
export class ViewDeploymentComponent implements OnInit {

  deployment: Deployment;
  deploymentId: string;
  getState = 'getting';
  deleteState = 'pending';
  getErrorMessage = '';

  constructor(
    private logger: UoLoggerService,
    private deploymentService: DeploymentService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.deploymentId = params.get('deploymentId');
      this.logger.debug(`Deployment id from route params: '${this.deploymentId}'`);

      this.getState = 'getting';
      this.deploymentService.getDeployment(this.deploymentId)
      .pipe(
        catchError((error) => {
          this.getState = 'failed';
          this.getErrorMessage = error.message;
          return throwError(error);
        })
      )
      .subscribe((deployment) => {
        this.logger.debug(deployment);
        this.getState = 'got';
        this.deployment = deployment;
      })

    });

  }

  onDeleted(deploymentId: string) {
    this.logger.debug(`The view-deployment component is aware that the deployment '${deploymentId}' has been deleted.`)
    this.deleteState = 'deleted';
  }

}
