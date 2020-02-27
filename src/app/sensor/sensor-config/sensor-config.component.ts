import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {Config} from './config';
import {FormBuilder} from '@angular/forms';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';

@Component({
  selector: 'uo-sensor-config',
  templateUrl: './sensor-config.component.html',
  styleUrls: ['./sensor-config.component.css']
})
export class SensorConfigComponent implements OnInit {

  @Input() config: Config;
  @Output() updated = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<string>();
  keyOptions = ['observedProperty', 'hasFeatureOfInterest', 'usedProcedure'];
  configForm;

  constructor(
    private fb: FormBuilder,
    private logger: UoLoggerService
  ) { }

  ngOnInit() {

    const contextKey = Object.keys(this.config).find((dKey) => {
      return dKey !== 'id' && dKey !== 'when';
    });
    // TODO: Need to add support for the 'when' object

    const keyOptionIdx = this.keyOptions.indexOf(contextKey);

    this.configForm = this.fb.group({
      id: [this.config.id],
      key: [keyOptionIdx >= 0 ? this.keyOptions[keyOptionIdx] : this.keyOptions[0]],
      value: [this.config[contextKey] || '']
    });

    this.onChanges();

  }

  // Watch for form value changes
  onChanges() {

    // TODO: How easy is it to add some validation?
    // observedProperty: ['', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
    // hasFeatureOfInterest: ['', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
    // usedProcedure: ['', Validators.pattern('[a-z0-9,-]*')], // we'll ask the user for a comma separated list.

    // Watch for any changes
    this.configForm.valueChanges.subscribe((values) => {
      this.logger.debug(values);
      // We'll emit the values in this slightly stange format so that we can more easily merge the new values with the sensor-configs component's array of configs.
      this.updated.emit(values);
    });

  }

  delete() {
    this.deleted.emit(this.config.id);
  }

}
