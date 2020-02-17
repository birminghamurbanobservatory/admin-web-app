import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {PermanentHost} from './permanent-host';
import {UtilsService} from '../utils/utils.service';
import {Platform} from '../platform/platform';

@Injectable({
  providedIn: 'root'
})
export class PermanentHostService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }

  getPermanentHosts(where?: {id: any}): Observable<PermanentHost[]> {
    const qs = this.utilsService.whereToQueryString(where);
    return this.http.get<PermanentHost[]>(`${environment.apiUrl}/permanent-hosts${qs}`);
  }

  createPermanentHost(permanentHost: PermanentHost): Observable<PermanentHost> {
    return this.http.post<PermanentHost>(`${environment.apiUrl}/permanent-hosts`, permanentHost);
  }

  deletePermanentHost(permanentHostId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/permanent-hosts/${permanentHostId}`);
  }

  register(registrationKey: string, deploymentId: string): Observable<Platform> {
    return this.http.post<Platform>(`${environment.apiUrl}/deployments/${deploymentId}/register`, {
      registrationKey
    });
  }

}
