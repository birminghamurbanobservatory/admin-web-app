import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {PermanentHost} from './permanent-host';

@Injectable({
  providedIn: 'root'
})
export class PermanentHostService {

  constructor(
    private http: HttpClient,
  ) { }

  getPermanentHosts(): Observable<PermanentHost[]> {
    return this.http.get<PermanentHost[]>(`${environment.apiUrl}/permanent-hosts`);
  }

  createPermanentHost(permanentHost: PermanentHost): Observable<PermanentHost> {
    return this.http.post<PermanentHost>(`${environment.apiUrl}/permanent-hosts`, permanentHost);
  }

  deletePermanentHost(permanentHostId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/permanent-hosts/${permanentHostId}`)
  }

}
