import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {Config} from '../sensor-config/config';

@Component({
  selector: 'uo-sensor-configs',
  templateUrl: './sensor-configs.component.html',
  styleUrls: ['./sensor-configs.component.css']
})
export class SensorConfigsComponent implements OnInit {

  @Input() previousConfigs: any;
  @Output() configsChanged = new EventEmitter<Config[]>();
  configs: Config[];
  idx = 0;

  constructor(
    private logger: UoLoggerService
  ) { }

  ngOnInit() {

    if (this.previousConfigs) {
      this.logger.debug(`Received ${this.previousConfigs.length} previous configs`);
      this.configs = this.previousConfigs;
    } else {
      this.configs = [];
      this.logger.debug('Received no previous configs');
    }

  }

  add() {
    this.configs.push({
      id: this.idx // assigned as a number so we can tell it apart from id's from the server that are strings
    });
    this.idx += 1;
  }

  onConfigUpdated(newValues) {
    this.logger.debug(`The SensorConfigsComponent is aware that the config with ID ${newValues.id} has been updated.`)
    const idx = this.configs.findIndex((def) => def.id === newValues.id);
    if (idx >= 0) {
      // Need to first delete any previous properties that may have been set
      Object.keys((this.configs[idx])).forEach((existingKey) => {
        if (existingKey !== 'id') {
          delete this.configs[idx][existingKey]
        }
      })
      // Now we can add the new property
      this.configs[idx][newValues.key] = newValues.value;
    }
    this.emitConfigs();
  }

  onConfigDeleted(deletedConfigId) {
    this.logger.debug(`The SensorConfigsComponent is aware that the config ${deletedConfigId} has been deleted.`)
    this.configs = this.configs.filter((def) => def.id !== deletedConfigId);
    this.emitConfigs();
  }

  emitConfigs() {
    this.configsChanged.emit(this.configs);
  }

}
