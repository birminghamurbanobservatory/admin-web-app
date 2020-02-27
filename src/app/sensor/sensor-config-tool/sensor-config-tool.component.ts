import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {Config} from './config';

@Component({
  selector: 'uo-sensor-config-tool',
  templateUrl: './sensor-config-tool.component.html',
  styleUrls: ['./sensor-config-tool.component.css']
})
export class SensorConfigToolComponent implements OnInit {

  @Input() previousConfig: Config;
  @Output() configChanged = new EventEmitter<any>();
  editorOptions: JsonEditorOptions;
  jsonData: any;
  @ViewChild(JsonEditorComponent, { static: true }) editor: JsonEditorComponent;

  constructor(
    private logger: UoLoggerService
  ) { }

  ngOnInit() {

    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.mode = 'code';
    this.editorOptions.mainMenuBar = false; // Hide the menubar
    this.editorOptions.statusBar = false;
    // this.editorOptions.navigationBar = false; // only applicable when mode is not 'code'

    if (this.previousConfig) {
      this.jsonData = this.previousConfig; 
    } else {
      this.jsonData = [
        {
          hasPriority: true,
          observedProperty: 'AirTemperature',
          discipline: ["Meterology"],
          hasFeatureOfInterest: "EarthAtmosphere",
          usedProcedure: ["PointSample"]
        }
      ];
      // Emit this default value
      this.emitConfig();
    }

  }

  onJsonDataChange(newJsonData) {
    this.logger.debug(newJsonData);
    this.emitConfig();
  }

  // TODO: should I emit a value of null when the JSON is invalid? So the parent controller knows it shouldn't use the current config. Current no functions are triggered when an invalid JSON is present, looking at the jsoneditor controller code I'm not even sure we can watch for these events.

  emitConfig() {
    this.configChanged.emit(this.jsonData);
  }

  reset() {
    this.jsonData = [{
      hasPriority: true,
      observedProperty: ""
    }];
    this.emitConfig();
  }

}
