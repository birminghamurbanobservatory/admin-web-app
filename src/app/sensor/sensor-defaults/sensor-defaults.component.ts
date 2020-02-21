import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {Default} from '../sensor-default/default';

@Component({
  selector: 'uo-sensor-defaults',
  templateUrl: './sensor-defaults.component.html',
  styleUrls: ['./sensor-defaults.component.css']
})
export class SensorDefaultsComponent implements OnInit {

  @Input() previousDefaults: any;
  @Output() defaultsChanged = new EventEmitter<Default[]>();
  defaults: Default[];
  idx = 0;

  constructor(
    private logger: UoLoggerService
  ) { }

  ngOnInit() {

    if (this.previousDefaults) {
      this.logger.debug(`Received ${this.previousDefaults.length} previous defaults`);
      this.defaults = this.previousDefaults;
    } else {
      this.defaults = [];
      this.logger.debug('Received no previous defaults');
    }

  }

  add() {
    this.defaults.push({
      id: this.idx // assigned as a number so we can tell it apart from id's from the server that are strings
    });
    this.idx += 1;
  }

  onDefaultUpdated(newValues) {
    this.logger.debug(`The SensorDefaultsComponent is aware that the default with ID ${newValues.id} has been updated.`)
    const idx = this.defaults.findIndex((def) => def.id === newValues.id);
    if (idx >= 0) {
      this.defaults[idx][newValues.key] = newValues.value;
    }
    this.emitDefaults();
  }

  onDefaultDeleted(deletedDefaultId) {
    this.logger.debug(`The SensorDefaultsComponent is aware that the default ${deletedDefaultId} has been deleted.`)
    this.defaults = this.defaults.filter((def) => def.id !== deletedDefaultId);
    this.emitDefaults();
  }

  emitDefaults() {
    this.defaultsChanged.emit(this.defaults);
  }

}
