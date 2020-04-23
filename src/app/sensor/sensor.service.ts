import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {Sensor} from './sensor';
import {UtilsService} from '../utils/utils.service';
import {cloneDeep} from 'lodash';
import {map} from 'rxjs/operators';
import {CollectionMeta} from '../shared/collection-meta';
import {Collection} from '../shared/collection';

@Injectable({
  providedIn: 'root'
})
export class SensorService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }


  getSensors(
    where: {id?: any; permanentHost?: string; inDeployment?: any; isHostedBy?: any} = {}, 
    options: {limit?: number; offset?: number} = {}
  ): Observable<{data: Sensor[], meta: CollectionMeta}> {
    const qs = this.utilsService.whereToQueryString(Object.assign({}, where, options));
    return this.http.get(`${environment.apiUrl}/sensors${qs}`)
    .pipe(
      map((sensorCollection: Collection) => {
        return {
          data: sensorCollection.member.map(this.formatSensorForApp),
          meta: sensorCollection.meta
        }
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
