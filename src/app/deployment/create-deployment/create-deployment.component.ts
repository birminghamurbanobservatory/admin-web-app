import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {DeploymentService} from '../deployment.service';
import {of, throwError} from 'rxjs';
import {delay, catchError} from 'rxjs/operators';

@Component({
  selector: 'uo-create-deployment',
  templateUrl: './create-deployment.component.html',
  styleUrls: ['./create-deployment.component.css']
})
export class CreateDeploymentComponent implements OnInit {

  createDeploymentForm;
  state = 'pending';

  constructor(
    private deploymentService: DeploymentService,
    private formBuilder: FormBuilder
  ) {

    this.createDeploymentForm = this.formBuilder.group({
      id: '',
      name: '',
      description: '',
      public: true
    });

  }

  ngOnInit() {
  }


  onSubmit(deploymentToCreate) {
    this.state = 'creating';
    console.log(deploymentToCreate);

    if (deploymentToCreate.description === '') {
      delete deploymentToCreate.description;
    }

    this.deploymentService.createDeployment(deploymentToCreate)
    .pipe(
      catchError((error) => {
        this.state = 'failed';
        of(1).pipe(delay(1000)).subscribe(() => {
          this.state = 'pending';
        });
        return throwError(error);
      })
    )
    .subscribe((createdDeployment) => {
      this.state = 'created';
      console.log(createdDeployment);

      // TODO: Clear the form?
      // TODO: Redirect back to the deployments list?

      // Might be a better way to do this.
      of(1).pipe(delay(1000)).subscribe(() => {
        this.state = 'pending';
      });

    })    

  }


}
