import { Component, OnInit, Input } from '@angular/core';
import {Deployment} from '../deployment';

@Component({
  selector: 'uo-deployment',
  templateUrl: './deployment.component.html',
  styleUrls: ['./deployment.component.css']
})
export class DeploymentComponent implements OnInit {

  @Input() deployment: Deployment;

  constructor() { }

  ngOnInit() {
  }

}
