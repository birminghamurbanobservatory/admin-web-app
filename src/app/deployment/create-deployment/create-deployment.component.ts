import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {DeploymentService} from '../deployment.service';

@Component({
  selector: 'app-create-deployment',
  templateUrl: './create-deployment.component.html',
  styleUrls: ['./create-deployment.component.css']
})
export class CreateDeploymentComponent implements OnInit {

  createDeploymentForm;

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
    console.log(deploymentToCreate);
  }


}
