import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {Sensor} from './sensor';
import {UtilsService} from '../utils/utils.service';

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
    return this.http.get<Sensor[]>(`${environment.apiUrl}/sensors${qs}`);
  }

  getSensor(sensorId: string): Observable<Sensor> {
    return this.http.get<Sensor>(`${environment.apiUrl}/sensors/${sensorId}`);
  }

  createSensor(sensor: Sensor): Observable<Sensor> {
    return this.http.post<Sensor>(`${environment.apiUrl}/sensors`, sensor);
  }

  updateSensor(sensorId: string, updates: any): Observable<Sensor> {
    return this.http.patch<Sensor>(`${environment.apiUrl}/sensors/${sensorId}`, updates);
  }

  deleteSensor(sensorId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/sensors/${sensorId}`)
  }

}
