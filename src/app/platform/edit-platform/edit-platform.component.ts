import { Component, OnInit } from '@angular/core';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {SensorService} from 'src/app/sensor/sensor.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {UtilsService} from 'src/app/utils/utils.service';
import {PlatformService} from '../platform.service';
import {catchError, filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {throwError, timer} from 'rxjs';
import {Sensor} from 'src/app/sensor/sensor';
import {Platform} from '../platform';
import {PointLocation} from 'src/app/location/point-location-selector/point-location.interface';
import * as check from 'check-types';
import {isEqual} from 'lodash';

@Component({
  selector: 'uo-edit-platform',
  templateUrl: './edit-platform.component.html',
  styleUrls: ['./edit-platform.component.css']
})
export class EditPlatformComponent implements OnInit {

  platformId: string;
  platform: Platform; 
  getState = 'getting';
  getErrorMessage: string;
  editPlatformForm;
  updateState = 'pending';
  updateErrorMessage: string;
  selectedGeometry;
  hostPlatformChoices: Platform[] = [];
  sensorChoices: Sensor[] = [];
  pointLocation: PointLocation;

  constructor(
    private logger: UoLoggerService,
    private platformService: PlatformService,
    private sensorService: SensorService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.platformId = params.get('platformId');
      this.logger.debug(`Platform ID from route params: '${this.platformId}'`);
      this.getPlatformAndPopulateForm(this.platformId);
    });

  }

  getPlatformAndPopulateForm(platformId: string) {

    this.getState = 'getting';
    this.platformService.getPlatform(platformId)
    .pipe(
      catchError((error) => {
        this.getState = 'failed';
        this.getErrorMessage = error.message;
        return throwError(error);
      })
    )
    .subscribe((platform: Platform) => {
      this.logger.debug(platform);

      let height;
      if (platform.location) {
        this.pointLocation = {
          lng: platform.location.geometry.coordinates[0],
          lat: platform.location.geometry.coordinates[1]
        };
        height = platform.location.geometry.coordinates[2]
      }

      this.editPlatformForm = this.fb.group({
        name: [
          platform.name || '',
          Validators.required
        ],
        description: [
          platform.description || ''
        ],
        static: [
          platform.static
        ],
        isHostedBy: [
          platform.isHostedBy || ''
        ],
        updateLocationWithSensor: [
          platform.updateLocationWithSensor || ''
        ],
        height: {
          value: check.number(height) ? height : null,
          disabled: this.pointLocation ? false : true
        }
      });

      this.getState = 'got';
      this.platform = platform;

      this.getSensorChoices();

      this.onChanges();
 
    })

  }

  onChanges() {

    // autocomplete for isHostedBy
    this.editPlatformForm.get('isHostedBy').valueChanges
    .pipe(
      filter((value: string) => value.length > 2),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.platformService.getPlatforms({id: {begins: value}}))
    )
    .subscribe(({data: platforms}) => {
      this.hostPlatformChoices = platforms;
      this.logger.debug(platforms);
    });

  }


  getSensorChoices() {

    const topPlatform = this.platform.ancestorPlatforms && this.platform.ancestorPlatforms.length > 0 ? this.platform.ancestorPlatforms[0] : this.platform.id;

    // TODO

    // Get all the sensors hosted on the common ancestor of this platform.

    // I think a lot of the logic will need to be handled by the api-gateway, e.g. have an endpoint such as:
    // .com/sensors?canUpdateLocationOfPlatform=mobius-1
    // This can either be called by a superuser or a basic user. 
    // Firstly if the platform is static, then we shouldn't return any sensors.
    // The api-gateway will ask the sensor-deployment-manager for all the live sensor contexts which have the top level ancestor of this platform in the path.
    // From this list of contexts we'll extract all the deploymentIDs listed, then the api-gateway can call the sensor-deployment-manager to find out what rights the user has to each of these deployments. For those that they don't have rights we can exclude those sensors from the returned list.
    // We'll then need to get the details of all these sensors, i.e. sensor documents not context documents.

  }


  onPointLocationSelection(location: PointLocation) {
    this.logger.debug('edit-platform component is aware of the location change');
    this.logger.debug(location);
    this.pointLocation = location;
    // Can also enabled the height input if it wasn't already
    this.editPlatformForm.controls['height'].enable();
  }


  onSubmit(updates) {

    this.updateState = 'updating';
    this.updateErrorMessage = '';

    // If some of the properties haven't even changed then don't bother sending them to the server.
    const cleanedUpdates = this.utilsService.removeUnchangedUpdates(updates, this.platform);

    // Add in the location and the height
    if (this.pointLocation) {
      const newCoordinates = [this.pointLocation.lng, this.pointLocation.lat];
      // N.B. we can't include the height unless there's a location.
      if (check.number(updates.height)) {
        newCoordinates.push(updates.height);
      }
      // If this differs from the old coordinates then add the new location to our updates.
      console.log(newCoordinates);
      console.log(this.platform.location.geometry.coordinates);
      if (!this.platform.location || !isEqual(newCoordinates, this.platform.location.geometry.coordinates)) {
        cleanedUpdates.location = {
          geometry: {
            type: 'Point',
            coordinates: newCoordinates
          }
        }
      }
    }
    delete cleanedUpdates.height;

    const keysToNullOrRemove = ['isHostedBy', 'updateLocationWithSensor'];
    keysToNullOrRemove.forEach((key) => {  
      if (cleanedUpdates[key] === '') {
        if (this.platform[key]) {
          // Allows this property to be unset
          cleanedUpdates[key] = null;
        } else {
          // Won't unset a property that wasn't previously set.
          delete cleanedUpdates[key];
        }
      }
    })

    this.logger.debug('Updates after tidying:')
    this.logger.debug(cleanedUpdates);

    if (Object.keys(cleanedUpdates).length === 0) {
      this.updateErrorMessage = 'None of the details were any different.';
      this.updateState = 'pending';
      
    } else {
      this.platformService.updatePlatform(this.platformId, cleanedUpdates)
      .pipe(
        catchError((error) => {
          this.updateState = 'failed';
          this.updateErrorMessage = error.message;
          timer(1400).subscribe(() => {
            this.updateState = 'pending';
          });
          return throwError(error);
        })
      )
      .subscribe((updatedPlatform: Platform) => {
        this.updateState = 'updated';
        this.platform = updatedPlatform;
        this.logger.debug(updatedPlatform);

        // Might be a better way to do this.
        timer(1400).subscribe(() => {
          this.updateState = 'pending';
        });

      })    
    }
  }


}
