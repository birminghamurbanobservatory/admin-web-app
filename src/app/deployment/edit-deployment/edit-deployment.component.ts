import { Component, OnInit } from '@angular/core';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {DeploymentService} from '../deployment.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {catchError} from 'rxjs/operators';
import {throwError, timer} from 'rxjs';
import {Deployment} from '../deployment';
import {UtilsService} from 'src/app/utils/utils.service';

@Component({
  selector: 'uo-edit-deployment',
  templateUrl: './edit-deployment.component.html',
  styleUrls: ['./edit-deployment.component.css']
})
export class EditDeploymentComponent implements OnInit {

  deployment: Deployment;
  deploymentId: string;
  getState = 'getting';
  getErrorMessage: string;
  editDeploymentForm;
  updateState = 'pending';
  updateErrorMessage: string;

  constructor(
    private logger: UoLoggerService,
    private deploymentService: DeploymentService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.deploymentId = params.get('deploymentId');
      this.logger.debug(`Deployment ID from route params: '${this.deploymentId}'`);
      this.getDeploymentAndPopulateForm(this.deploymentId);
    });

  }

  getDeploymentAndPopulateForm(deploymentId: string) {

    this.getState = 'getting';
    this.deploymentService.getDeployment(deploymentId)
    .pipe(
      catchError((error) => {
        this.getState = 'failed';
        this.getErrorMessage = error.message;
        return throwError(error);
      })
    )
    .subscribe((deployment) => {
      this.logger.debug(deployment);

      this.editDeploymentForm = this.fb.group({
        name: [
          deployment.name || '',
          Validators.required
        ],
        description: [
          deployment.description || ''
        ],
        public: [
          deployment.public || false
        ]
      });

      this.getState = 'got';
      this.deployment = deployment;
    })

  }


  onSubmit(updates) {
    this.logger.debug(updates);
    this.updateState = 'updating';
    this.updateErrorMessage = '';

    // If some of the properties haven't even changed then don't bother sending them to the server.
    const cleanedUpdates = this.utilsService.removeUnchangedUpdates(updates, this.deployment);
    this.logger.debug(cleanedUpdates);

    if (Object.keys(cleanedUpdates).length === 0) {
      this.updateErrorMessage = 'None of the details were any different.';
      this.updateState = 'pending';
      
    } else {
      this.deploymentService.updateDeployment(this.deploymentId, cleanedUpdates)
      .pipe(
        catchError((error) => {
          this.updateState = 'failed';
          this.updateErrorMessage = error.message;
          timer(1400).subscribe(() => {
            this.updateState = 'pending';
          });
          return throwError(error);
        })
      )
      .subscribe((updatedDeployment) => {
        this.updateState = 'updated';
        this.deployment = updatedDeployment;
        this.logger.debug(updatedDeployment);

        // Might be a better way to do this.
        timer(1400).subscribe(() => {
          this.updateState = 'pending';
        });

      })    
    }
  }


}
