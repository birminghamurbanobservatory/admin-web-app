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
  jsonDataForTool: any;
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
      this.jsonDataForTool = this.previousConfig; 
    } else {
      this.jsonDataForTool = [
        {
          hasPriority: true,
          observedProperty: 'AirTemperature',
          discipline: ["Meteorology"],
          hasFeatureOfInterest: "EarthAtmosphere",
          usedProcedure: ["PointSample"]
        }
      ];
    }

    // Emit the initial value.
    this.configChanged.emit(this.jsonDataForTool);
  }

  onJsonDataChange(updatedJsonData) {
    // The JSON Editor event sometimes emits a weird object with a isTrusted property, I'll want to ignore this
    const isWeirdIsTrustedEvent = Object.keys(updatedJsonData).includes('isTrusted');
    if (!isWeirdIsTrustedEvent) {
      this.configChanged.emit(updatedJsonData);
    }
  }

  // TODO: should I emit a value of null when the JSON is invalid? So the parent controller knows it shouldn't use the current config. Current no functions are triggered when an invalid JSON is present, looking at the jsoneditor controller code I'm not even sure we can watch for these events.

  reset() {
    this.jsonDataForTool = [{
      hasPriority: true,
      observedProperty: ""
    }];
    this.configChanged.emit(this.jsonDataForTool);
  }

}
