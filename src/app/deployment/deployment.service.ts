import { Injectable } from '@angular/core';
import {Deployment} from './deployment';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {UtilsService} from '../utils/utils.service';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }

  getDeployments(where?: {id: any}): Observable<Deployment[]> {
    const qs = this.utilsService.whereToQueryString(where);
    return this.http.get<Deployment[]>(`${environment.apiUrl}/deployments${qs}`);
  }

  createDeployment(deployment: Deployment): Observable<Deployment> {
    return this.http.post<Deployment>(`${environment.apiUrl}/deployments`, deployment);
  }

  deleteDeployment(deploymentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/deployments/${deploymentId}`)
  }

}

