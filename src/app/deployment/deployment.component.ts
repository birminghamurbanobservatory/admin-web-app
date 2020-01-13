import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.component.html',
  styleUrls: ['./deployment.component.css']
})

// TODO: Have deployments as a full feature module instead, thus allowing benefits such as lazy loading:
// https://angular.io/guide/router#lazy-loading-route-configuration

export class DeploymentComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
