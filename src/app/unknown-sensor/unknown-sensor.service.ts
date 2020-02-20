import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from './../../environments/environment';
import {UnknownSensor} from './unknown-sensor';

@Injectable({
  providedIn: 'root'
})
export class UnknownSensorService {

  constructor(
    private http: HttpClient
  ) { }

  getUnknownSensors(): Observable<UnknownSensor[]> {
    return this.http.get<UnknownSensor[]>(`${environment.apiUrl}/unknown-sensors`);
  }

}
