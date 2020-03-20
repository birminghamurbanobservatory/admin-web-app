import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from './../../environments/environment';
import {UnknownSensor} from './unknown-sensor';
import {map, tap} from 'rxjs/operators';
import {cloneDeep} from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class UnknownSensorService {

  constructor(
    private http: HttpClient
  ) { }

  getUnknownSensors(): Observable<UnknownSensor[]> {
    return this.http.get(`${environment.apiUrl}/unknown-sensors`)
    .pipe(
      map((unknownSensorCollection: any) => {
        return unknownSensorCollection.member;
      }),
      map((unknwownSensorsJsonLd: any) => {
        return unknwownSensorsJsonLd.map(this.formatUnknownSensorForApp);
      })
    )
  }


  formatUnknownSensorForApp(asJsonLd): UnknownSensor {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context'];
    forApp.id = forApp['@id'];
    return forApp;
  }

}
