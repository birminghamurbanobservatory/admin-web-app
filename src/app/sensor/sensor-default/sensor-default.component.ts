import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {Default} from './default';
import {FormBuilder} from '@angular/forms';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';

@Component({
  selector: 'uo-sensor-default',
  templateUrl: './sensor-default.component.html',
  styleUrls: ['./sensor-default.component.css']
})
export class SensorDefaultComponent implements OnInit {

  @Input() default: Default;
  @Output() updated = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<string>();
  keyOptions = ['observedProperty', 'featureOfInterest', 'usedProcedures'];
  defaultForm;

  constructor(
    private fb: FormBuilder,
    private logger: UoLoggerService
  ) { }

  ngOnInit() {

    const contextKey = Object.keys(this.default).find((dKey) => {
      return dKey !== 'id' && dKey !== 'when';
    });
    // TODO: Need to add support for the 'when' object

    this.defaultForm = this.fb.group({
      id: [this.default.id],
      key: [contextKey || this.keyOptions[0]],
      value: [this.default[contextKey] || '']
    });

    this.onChanges();

  }

  // Watch for form value changes
  onChanges() {

    // TODO: How easy is it to add some validation?
    // observedProperty: ['', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
    // hasFeatureOfInterest: ['', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
    // usedProcedures: ['', Validators.pattern('[a-z0-9,-]*')], // we'll ask the user for a comma separated list.

    // Watch for any changes
    this.defaultForm.valueChanges.subscribe((values) => {
      this.logger.debug(values);
      // We'll emit the values in this slightly stange format so that we can more easily merge the new values with the sensor-defaults component's array of defaults.
      this.updated.emit(values);
    });

  }

  delete() {
    this.deleted.emit(this.default.id);
  }

}
