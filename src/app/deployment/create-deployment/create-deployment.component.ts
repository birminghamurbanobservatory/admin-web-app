import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import {DeploymentService} from '../deployment.service';
import {of, throwError, Observable, timer} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {UtilsService} from 'src/app/utils/utils.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';

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
    private logger: UoLoggerService,
    private fb: FormBuilder,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {

    this.createDeploymentForm = this.fb.group({
      label: ['', Validators.required],
      id: ['', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
      description: '',
      public: true
    });

  }


  onSubmit(deploymentToCreate) {
    this.state = 'creating';
    this.createErrorMessage = '';
    this.logger.debug(deploymentToCreate);

    const cleanedDeployment = this.utilsService.stripEmptyStrings(deploymentToCreate);

    this.deploymentService.createDeployment(cleanedDeployment)
    .pipe(
      catchError((error) => {
        this.state = 'failed';
        this.createErrorMessage = error.message;
        timer(1400).subscribe(() => {
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

      timer(1400).subscribe(() => {
        this.state = 'pending';
      });

    })    

  }

}
