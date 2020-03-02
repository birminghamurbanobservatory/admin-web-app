import { Component, OnInit } from '@angular/core';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {SensorService} from 'src/app/sensor/sensor.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {UtilsService} from 'src/app/utils/utils.service';
import {PlatformService} from '../platform.service';
import {catchError} from 'rxjs/operators';
import {throwError, timer} from 'rxjs';
import {Sensor} from 'src/app/sensor/sensor';
import {Platform} from '../platform';

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
        ]
      });

      this.getState = 'got';
      this.platform = platform;

      this.getSensorChoices();
 
    })

  }


  // TODO: I need to listen for changes to the isHostedBy field and offer autocomplete suggestions.


  getSensorChoices() {

    const topPlatform = this.platform.hostedByPath && this.platform.hostedByPath.length > 0 ? this.platform.hostedByPath[0] : this.platform.id;

    // Get all the sensors hosted on the common ancestor of this platform.

    // TODO: One option for doing this is a 2-stage process:
    // 1. Use a getPlatforms request with hostedByPath__containsItem to find any platforms with this common ancestor.
    // 2. Use a getSensors with isHostedBy__in to get all the sensors hosted on these platforms.

    // TODO: Another option: Add a isHostedByIncludingIndirect query parameter to the getSensors request that finds all the sensors hosted directly or indirectly on this platform. The api-gateway would need to ensure that it filtered out any sensors there were hosted on platforms that are in deployments that the user does not have access to. I.e. by first getting a list of deployments this user has access too, and then getting all the platforms from these deployments which have a common ancestor with the sensor's platform. And then getting all the sensors on these platforms.

    // What makes this hard is that you need to make sure non-superusers can do this, whilst making sure they can access sensors on platforms that may have been shared with them, and excluding sensors that aren't on platforms that have been shared. 

  }



  onLocationSelection(geometry) {
    this.logger.debug('edit-platform component is aware of the location change');
    this.logger.debug(geometry);
    this.selectedGeometry = geometry;
  }


  onSubmit(updates) {

    this.updateState = 'updating';
    this.updateErrorMessage = '';

    // TODO: I need to add the location to the updates if it has been set/updated.

    // If some of the properties haven't even changed then don't bother sending them to the server.
    const cleanedUpdates = this.utilsService.removeUnchangedUpdates(updates, this.platform);

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
      this.platformService.updatePlatform(this.platformId, this.platform.ownerDeployment, cleanedUpdates)
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
