import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {DeploymentService} from '../deployment.service';
import {of, throwError, Observable, timer} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'uo-create-deployment',
  templateUrl: './create-deployment.component.html',
  styleUrls: ['./create-deployment.component.css']
})
export class CreateDeploymentComponent implements OnInit {

  createDeploymentForm;
  createErrorMessage = '';
  state = 'pending';

  constructor(
    private deploymentService: DeploymentService,
    private formBuilder: FormBuilder,
    private logger: NGXLogger
  ) {}

  ngOnInit() {

    this.createDeploymentForm = this.formBuilder.group({
      id: '',
      name: '',
      description: '',
      public: true
    });

  }


  onSubmit(deploymentToCreate) {
    this.state = 'creating';
    this.createErrorMessage = '';
    this.logger.debug(deploymentToCreate);

    if (deploymentToCreate.description === '') {
      delete deploymentToCreate.description;
    }

    this.deploymentService.createDeployment(deploymentToCreate)
    .pipe(
      catchError((error) => {
        this.state = 'failed';
        this.createErrorMessage = error.message;
        this.briefDelay().subscribe(() => {
          this.state = 'pending';
        });
        return throwError(error);
      })
    )
    .subscribe((createdDeployment) => {
      this.state = 'created';
      this.logger.debug(createdDeployment);

      // TODO: Clear the form?
      // TODO: Redirect back to the deployments list?

      // Might be a better way to do this.
      this.briefDelay().subscribe(() => {
        this.state = 'pending';
      });

    })    

  }


  briefDelay(): Observable<number> {
    return timer(1400);
  }


}
