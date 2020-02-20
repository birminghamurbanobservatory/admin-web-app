import { Component, OnInit, Input } from '@angular/core';
import {UnknownSensor} from '../unknown-sensor';

@Component({
  selector: 'uo-unknown-sensor',
  templateUrl: './unknown-sensor.component.html',
  styleUrls: ['./unknown-sensor.component.css']
})
export class UnknownSensorComponent implements OnInit {

  @Input() unknownSensor: UnknownSensor;

  constructor() { }

  ngOnInit() {
  }

}
