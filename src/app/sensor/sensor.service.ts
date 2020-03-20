import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {Sensor} from './sensor';
import {UtilsService} from '../utils/utils.service';
import {cloneDeep} from 'lodash';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SensorService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }


  getSensors(where: {permanentHost: string}): Observable<Sensor[]> {
    const qs = this.utilsService.whereToQueryString(where);
    return this.http.get(`${environment.apiUrl}/sensors${qs}`)
    .pipe(
      map((sensorCollection: any) => {
        return sensorCollection.member;
      }),
      map((sensorsJsonLd: any) => {
        return sensorsJsonLd.map(this.formatSensorForApp);
      })
    )
  }

  getSensor(sensorId: string): Observable<Sensor> {
    return this.http.get(`${environment.apiUrl}/sensors/${sensorId}`)
    .pipe(
      map((jsonLd) => {
        return this.formatSensorForApp(jsonLd);
      })
    )
  }

  createSensor(sensor: Sensor): Observable<Sensor> {
    return this.http.post(`${environment.apiUrl}/sensors`, sensor)
    .pipe(
      map((jsonLd) => {
        return this.formatSensorForApp(jsonLd);
      })
    )
  }

  updateSensor(sensorId: string, updates: any): Observable<Sensor> {
    return this.http.patch(`${environment.apiUrl}/sensors/${sensorId}`, updates)
    .pipe(
      map((jsonLd) => {
        return this.formatSensorForApp(jsonLd);
      })
    )
  }

  deleteSensor(sensorId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/sensors/${sensorId}`)
  }

  formatSensorForApp(asJsonLd): Sensor {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context'];
    forApp.id = forApp['@id'];
    return forApp;
  }

}
