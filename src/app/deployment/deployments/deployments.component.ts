import { Component, OnInit } from '@angular/core';
import {DeploymentService} from '../deployment.service';
import {Deployment} from '../deployment';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';


@Component({
  selector: 'app-deployments',
  templateUrl: './deployments.component.html',
  styleUrls: ['./deployments.component.css']
})
export class DeploymentsComponent implements OnInit {

  deployments: Deployment[];
  getDeploymentsErrorMessage: string;

  constructor(
    private deploymentService: DeploymentService
  ) { }

  ngOnInit() {
    this.getDeployments();
  }

  getDeployments() {
    this.deploymentService.getDeployments()
      .pipe(
        catchError((error) => {
          this.getDeploymentsErrorMessage = error.message;
          return throwError(error);
        })
      )
      .subscribe((deployments: Deployment[]) => {
        this.deployments = deployments;
      })
  }


}
