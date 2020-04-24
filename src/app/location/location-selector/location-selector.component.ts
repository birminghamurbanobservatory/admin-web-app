import { Component, OnInit, Input, Output, EventEmitter, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {GoogleMapsLoader} from '../google-maps/google-maps-loader';
import {FormControl} from '@angular/forms';
import {filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import { Observable } from 'rxjs';
import {cloneDeep} from 'lodash';
import booleanClockwise from '@turf/boolean-clockwise';

@Component({
  selector: 'uo-location-selector',
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.css']
})
export class LocationSelectorComponent implements OnInit {

  @Input() geometryIn: any 
  @Input() disableEdit: boolean;
  @Output() onLocationSelection = new EventEmitter<any>();

  uniqueMapId = `map-id-${this.generateUniqueId()}`; // in case multiple on same page
  map: any;
  currentMapShape: any;
  currentMapShapeType: string;
  private googleMapsApi;
  private geocoder;
  address = new FormControl('');
  foundAddresses;

  constructor(
    private logger: UoLoggerService,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {

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
        drawingMode: this.geometryIn ? null :googleMapsApi.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
          position: googleMapsApi.ControlPosition.TOP_CENTER,
          drawingModes: ['marker', 'polygon', 'polyline']
        },
        markerOptions: {
          draggable: true
        },
        polygonOptions: {
          draggable: true,
          editable: true
        },
        polylineOptions: {
          draggable: true,
          editable: true
        }
      });      

      drawingManager.setMap(this.map);

      if (this.geometryIn) {

        this.logger.debug('Geometry Input:');
        this.logger.debug(this.geometryIn);

        // N.B. the addGeoJson function didn't help us here as it doesn't look like we are able to create listeners on it.

        // POINT
        if (this.geometryIn.type === 'Point') {
          this.currentMapShapeType = 'marker';
          this.currentMapShape = new googleMapsApi.Marker({
            position: {
              lng: this.geometryIn.coordinates[0], 
              lat: this.geometryIn.coordinates[1]
            },
            draggable: true,
            map: this.map
          });

        // POLYGON
        } else if (this.geometryIn.type === 'Polygon') {
          this.currentMapShapeType = 'polygon';
          // Polygons have an extra level of nesting than a polyline in order to support donut shapes.
          const paths = this.geometryIn.coordinates.map((poly) => {
            return poly.map((coords) => {
              return {lng: coords[0], lat: coords[1]};
            })
          });
          this.currentMapShape = new googleMapsApi.Polygon({
            paths,
            draggable: true,
            editable: true,
            map: this.map
          });

        // LINESTRING
        } else if (this.geometryIn.type === 'LineString') {
          this.currentMapShapeType = 'polyline';
          const path = this.geometryIn.coordinates.map((coords) => {
            return {lng: coords[0], lat: coords[1]};
          })
          this.currentMapShape = new googleMapsApi.Polyline({
            path,
            draggable: true,
            editable: true,
            map: this.map
          });


        } else {
          this.logger.error(`Invalid geometry type: ${this.geometryIn.type}`)
        }

        // Listen for edit events to this initial marker/shape
        if (this.currentMapShape) {

          this.currentMapShape.addListener('dragend', () => {
            this.logger.debug('Initial Shape has been dragged');
            this.emitLocationSelected();
          })

          if (this.currentMapShapeType === 'polyline') {
            this.addListenersToShapePath(this.currentMapShape.getPath());
          }

          if (this.currentMapShapeType === 'polygon') {
            this.currentMapShape.getPaths().forEach((path) => {
              this.addListenersToShapePath(path);
            })
          }

        }

      }

      // Add a listener for when a NEW shape/marker is ADDED
      // Docs: https://developers.google.com/maps/documentation/javascript/drawinglayer
      googleMapsApi.event.addListener(drawingManager, 'overlaycomplete', (event) => {
        this.logger.debug(`A ${event.type} overlay has been added to the map`);

        // Remove the existing shape if there is one
        if (this.currentMapShape) {
          this.currentMapShape.setMap(null);
        }
        // Then overwrite it
        this.currentMapShape = event.overlay;
        this.currentMapShapeType = event.type;

        this.emitLocationSelected();

        // Listen for drag events 
        googleMapsApi.event.addListener(event.overlay, 'dragend', (event) => {
          this.logger.debug('Shape has been dragged');
          this.emitLocationSelected();
        })

        if (this.currentMapShapeType === 'polyline') {
          this.addListenersToShapePath(event.overlay.getPath());
        }

        if (this.currentMapShapeType === 'polygon') {
          event.overlay.getPaths().forEach((path) => {
            this.addListenersToShapePath(path);
          })
        }

      });

    });

    this.listenForAddressChanges()

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

    // Remove the existing shape if there is one
    if (this.currentMapShape) {
      this.currentMapShape.setMap(null);
    }

    // Now let's create a marker at the suggested location
    this.currentMapShapeType = 'marker';
    this.currentMapShape = new this.googleMapsApi.Marker({
      position: latLng,
      draggable: true,
      map: this.map
    });

    // Let the parent component know of this location
    this.emitLocationSelected();

    // Add a listener in case this marker is dragged
    this.currentMapShape.addListener('dragend', () => {
      this.logger.debug('Marker from geocoder has been dragged');
      this.emitLocationSelected();
    })

    // Recenter on this location
    this.map.setCenter(latLng);
    this.map.setZoom(14);

  }


  addListenersToShapePath(path) {
    this.googleMapsApi.event.addListener(path, 'insert_at', () => {
      this.logger.debug('Shape has been edited (insert_at)');
      this.emitLocationSelected();
    })
    this.googleMapsApi.event.addListener(path, 'remove_at', () => {
      this.logger.debug('Shape has been edited (remove_at)');
      this.emitLocationSelected();
    })
    this.googleMapsApi.event.addListener(path, 'set_at', () => {
      this.logger.debug('Shape has been edited (set_at)');
      this.emitLocationSelected();
    })
  }


  emitLocationSelected() {

    if (!this.currentMapShape || !this.currentMapShapeType) {
      this.logger.debug('No location has been selected');
      return;
    } 

    const geoJsonGeometry: any = {};

    if (this.currentMapShapeType === 'marker') {
      geoJsonGeometry.type = 'Point';
      geoJsonGeometry.coordinates = [
        this.currentMapShape.position.lng(),
        this.currentMapShape.position.lat()
      ]
    }

    if (this.currentMapShapeType === 'polygon') {
      geoJsonGeometry.type = 'Polygon'
      // A polygon has an extra level of array nesting than a polyline
      // If you want to allow donut shapes then you'd need any secondary paths you allow to be drawn to be pushed into this array too.
      geoJsonGeometry.coordinates = [
        this.currentMapShape.getPath().getArray().map((point) => {
          return [point.lng(), point.lat()];
        })
      ]; 
      // You also need to repeat the first coordinate at the end for it to be valid a GeoJSON Polygon (using forEach means this can support donut shapes if we ever allow the map drawing itself to do so).
      geoJsonGeometry.coordinates.forEach((path, idx) => {
        geoJsonGeometry.coordinates[idx].push(geoJsonGeometry.coordinates[idx][0])
      })
      // If the polygon was drawn in a clockwise direction then we'll need to reverse the order to make sure it conforms to the GeoJSON right-hand rule.
      if (booleanClockwise(geoJsonGeometry.coordinates[0])) {
        this.logger.debug('Reversing coordinates');
        geoJsonGeometry.coordinates[0].reverse();
      }
    }

    if (this.currentMapShapeType === 'polyline') {
      geoJsonGeometry.type = 'LineString'
      geoJsonGeometry.coordinates = this.currentMapShape.getPath().getArray().map((point) => {
        return [point.lng(), point.lat()];
      });
    }     
      
    this.onLocationSelection.emit(geoJsonGeometry);
  
  }




  generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


}
