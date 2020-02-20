import { Component, OnInit, Input } from '@angular/core';
import {UnknownSensor} from '../unknown-sensor';
import {ɵa} from 'angular2-prettyjson';

@Component({
  selector: 'uo-unknown-sensor',
  templateUrl: './unknown-sensor.component.html',
  styleUrls: ['./unknown-sensor.component.css'],
  entryComponents: [ɵa]
})
export class UnknownSensorComponent implements OnInit {

  @Input() unknownSensor: UnknownSensor;

  constructor() { }

  ngOnInit() {
  }

}
