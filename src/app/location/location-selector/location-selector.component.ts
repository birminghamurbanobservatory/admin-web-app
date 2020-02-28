import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {GoogleMapsLoader} from '../google-maps/google-maps-loader';

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

  // TODO: Could do with supporting a GeoJSON approach really.

  constructor(
    private logger: UoLoggerService
  ) { }

  ngOnInit() {

    GoogleMapsLoader.load()
    .then((googleMapsApi) => {
      this.logger.debug('Google Maps Loaded');

      this.map = new googleMapsApi.Map(document.getElementById(this.uniqueMapId), {
        zoom: 10,
        center: {lat: 52.45, lng: -1.9}
      });

      if (this.geometryIn) {

        this.logger.debug('Geometry Input:');
        this.logger.debug(this.geometryIn);
        // TODO: Add the existing geometry to the map
        // The loadGeoJson function won't really help us as it doesn't look like we are able to create listeners on it. So we'll need to add the marker/polygon/polyline manually based on the geometry passed in, and set this as currentMapShape and set currentMapShapeType, and add the appropriate listeners.
      }

      const drawingManager = new googleMapsApi.drawing.DrawingManager({
        drawingMode: googleMapsApi.drawing.OverlayType.MARKER,
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

      // Add a listener for when a new shape/marker is added
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

        // Listen for edits
        if (['polygon', 'polyline'].includes(event.type)){
          this.logger.debug('Setting up edit listeners');
          // Note if you ever start allowing the polygons to be donuts, i.e. comprised of more than one path, then you would need to use getPaths() and then applies these listeners to each path individually.
          googleMapsApi.event.addListener(event.overlay.getPath(), 'insert_at', () => {
            this.logger.debug('Shape has been edited (insert_at)');
            this.emitLocationSelected();
          })
          googleMapsApi.event.addListener(event.overlay.getPath(), 'remove_at', () => {
            this.logger.debug('Shape has been edited (remove_at)');
            this.emitLocationSelected();
          })
          googleMapsApi.event.addListener(event.overlay.getPath(), 'set_at', () => {
            this.logger.debug('Shape has been edited (set_at)');
            this.emitLocationSelected();
          })
        }

      });

    });

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
      // A polygon has an level of array nesting than a polyline
      geoJsonGeometry.coordinates = [
        this.currentMapShape.getPath().getArray().map((point) => {
          return [point.lng(), point.lat()];
        })
      ];
      // You also need to repeat the first coordinate at the end
      // TODO: You'll need a loop here if you start having donut shaped polygons.
      geoJsonGeometry.coordinates[0].push(geoJsonGeometry.coordinates[0][0]);
    }

    if (this.currentMapShapeType === 'polyline') {
      geoJsonGeometry.type = 'LineString'
      geoJsonGeometry.coordinates = this.currentMapShape.getPath().getArray().map((point) => {
        return [point.lng(), point.lat()];
      });
    }     
      
    this.onLocationSelection.emit(geoJsonGeometry);
  
  }


  isValidLocation(l) {
    let result = false;
    if (this.isObject(l)) {
      if (this.isNumber(l.lat) && this.isNumber(l.lng)) {
        if ((l.lat >= -90 && l.lat <= 90) && (l.lng >= -180 && l.lng <= 180)) {
          result = true;
        }
      }
    }
    return result;
  }

  isObject(x) {
    return x !== null && typeof x === 'object';
  }

  isNumber(n) {
    return n === parseFloat(n) && isFinite(n);
  }


  generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


}
