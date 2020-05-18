import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ApplicationRef, NgZone, Input } from '@angular/core';
import {FormControl, FormBuilder, Validators} from '@angular/forms';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {GoogleMapsLoader} from '../google-maps/google-maps-loader';
import {filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import { Observable } from 'rxjs';
import {cloneDeep, round} from 'lodash';
import * as check from 'check-types';
import {PointLocation} from './point-location.interface';

@Component({
  selector: 'uo-point-location-selector',
  templateUrl: './point-location-selector.component.html',
  styleUrls: ['./point-location-selector.component.css']
})
export class PointLocationSelectorComponent implements OnInit {

  @Input() currentPointLocation: PointLocation; // i.e. for editing an location that has already been defined.
  @Output() onPointLocationSelection = new EventEmitter<any>();

  uniqueMapId = `map-id-${this.generateUniqueId()}`; // in case multiple on same page
  map: any;
  private currentMapMarker;
  private googleMapsApi;
  private geocoder;
  address = new FormControl('');
  foundAddresses;
  coordinatesForm;


  constructor(
    private logger: UoLoggerService,
    private ngZone: NgZone,
    private fb: FormBuilder
  ) { }


  ngOnInit() {

    // Build the form
    let initialLat = null;
    let initialLng = null;
    if (this.isLocationValid(this.currentPointLocation)) {
      initialLat = this.currentPointLocation.lat;
      initialLng = this.currentPointLocation.lng
    };
    this.coordinatesForm = this.fb.group({
      lat: [initialLat, [Validators.min(-90), Validators.max(90)]],
      lng: [initialLng, [Validators.min(-180), Validators.max(180)]]
    });
    this.listenForCoordinatesFormChanges();

    GoogleMapsLoader.load()
    .then((googleMapsApi) => {
      this.logger.debug('Google Maps Loaded');
      this.googleMapsApi = googleMapsApi;
      this.geocoder = new googleMapsApi.Geocoder();

      this.map = new googleMapsApi.Map(document.getElementById(this.uniqueMapId), {
        zoom: 10,
        center: {lat: 52.45, lng: -1.9}
      });

      const drawingManager = new googleMapsApi.drawing.DrawingManager({
        // set drawingMode to null to pre-select the hand icon when initial location is available
        drawingMode: googleMapsApi.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
          position: googleMapsApi.ControlPosition.TOP_CENTER,
          drawingModes: ['marker']
        },
        markerOptions: {
          draggable: true
        }
      });      

      drawingManager.setMap(this.map);

      if (this.isLocationValid(this.currentPointLocation)) {
        this.logger.debug('Current point location provided:');
        this.logger.debug(this.currentPointLocation);
        this.drawMarkerOnMap(this.currentPointLocation)
      }

      // Add a listener for when a NEW marker is ADDED
      // Docs: https://developers.google.com/maps/documentation/javascript/drawinglayer
      googleMapsApi.event.addListener(drawingManager, 'overlaycomplete', (event) => {
        this.logger.debug(`A ${event.type} overlay has been added to the map`);

        // Remove the existing point if there is one
        if (this.currentMapMarker) {
          this.currentMapMarker.setMap(null);
        }
        // Then overwrite it
        this.currentMapMarker = event.overlay;

        const unroundedLocation = {
          lng: this.currentMapMarker.position.lng(),
          lat: this.currentMapMarker.position.lat()
        };
        const roundedLocation = this.roundPointLocation(unroundedLocation);
        this.updateCoordinateFormValues(roundedLocation);

        // Listen for drag events 
        googleMapsApi.event.addListener(event.overlay, 'dragend', (event) => {
          this.logger.debug('Initial marker has been dragged');
          const unroundedLocation = {
            lng: this.currentMapMarker.position.lng(),
            lat: this.currentMapMarker.position.lat()
          };
          const roundedLocation = this.roundPointLocation(unroundedLocation);
          this.updateCoordinateFormValues(roundedLocation);
        })

      });

    });

    this.listenForAddressChanges()

  }


  drawMarkerOnMap(loc: {lat: number; lng: number}) {

    this.logger.debug('Drawing marker on map')

    // Remove existing point if there is one
    if (this.currentMapMarker) {
      this.currentMapMarker.setMap(null);
    }

    this.currentMapMarker = new this.googleMapsApi.Marker({
      position: loc,
      draggable: true,
      map: this.map
    });

    // Listen for drag events
    this.currentMapMarker.addListener('dragend', () => {
      this.logger.debug('Marker has been dragged');
      const unroundedLocation = {
        lng: this.currentMapMarker.position.lng(),
        lat: this.currentMapMarker.position.lat()
      };
      const roundedLocation = this.roundPointLocation(unroundedLocation);
      this.updateCoordinateFormValues(roundedLocation);
    })

    // Recenter on this location
    this.map.setCenter(loc);

  }


  listenForCoordinatesFormChanges() {

    this.coordinatesForm.valueChanges.subscribe((newValues: PointLocation) => {
      this.logger.debug('Coordinate form values have changed');
      this.logger.debug(newValues);
      if (this.isLocationValid(newValues)) {
        this.drawMarkerOnMap(newValues);
        // Let the parent component know
        this.onPointLocationSelection.emit(newValues);
      } 
    })

  }

  
  listenForAddressChanges() {

    this.address.valueChanges
    .pipe(
      filter((value: string) => value.length > 2),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: string): any => {
        return new Observable(observer => {
          this.geocoder.geocode({address: value, region: 'GB'}, (results, status) => {
            if (status === this.googleMapsApi.GeocoderStatus.OK) {
              observer.next(results);
            } else {
              observer.next([]);
            }
            observer.complete();
          });
        })
      })
    )
    .subscribe((foundAddresses: any[]) => {
      this.logger.debug(`Found ${foundAddresses.length} addresses`);
      this.ngZone.run(() => {
        // If I don't have this inside a ngZone run then there is a lag between getting the address and the options actually being shown in the autocomplete dropdown.
        this.foundAddresses = foundAddresses;
      });
    });

  }


  onAddressSelected() {

    this.logger.debug('Address selected');
    // For a brief period here the value of our address FormControl is one of the geocoder suggestions which is an object, we want to get this and then quickly set the address FormControl to be a string again. There's possibly a nicer way doing this?
    const addressToCreateMarkerFrom = cloneDeep(this.address.value);
    this.address.setValue(this.address.value.formatted_address);

    const latLng = {
      lng: addressToCreateMarkerFrom.geometry.location.lng(), 
      lat: addressToCreateMarkerFrom.geometry.location.lat(), 
    }

    const rounded = this.roundPointLocation(latLng);

    this.drawMarkerOnMap(rounded);
    // Zoom to this location
    this.map.setZoom(14);

    this.updateCoordinateFormValues(rounded);

  }


  updateCoordinateFormValues(location: PointLocation) {
    this.logger.debug('Updating coordinate form values');
    this.coordinatesForm.controls['lat'].setValue(location.lat, {emitEvent: false}); // no point in having both emit events
    this.coordinatesForm.controls['lng'].setValue(location.lng);
  }



  roundPointLocation(location: PointLocation) {
    const rounded = cloneDeep(location);
    rounded.lat = round(rounded.lat, 7);
    rounded.lng = round(rounded.lng, 7);
    return rounded;
  }

  isLocationValid(loc: PointLocation) {
    let valid = check.nonEmptyObject(loc) &&
      check.inRange(loc.lat, -90, 90) &&
      check.inRange(loc.lng, -180, 180);
    return valid;
  }


  generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


}
