import { Injectable } from '@angular/core';
import {Deployment} from './deployment';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {UtilsService} from '../utils/utils.service';
import {map} from 'rxjs/operators';
import {cloneDeep} from 'lodash';

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
    return this.http.get(`${environment.apiUrl}/deployments${qs}`)
    .pipe(
      map((deploymentCollection: any) => {
        return deploymentCollection.member;
      }),
      map((deploymentsJsonLd: any) => {
        return deploymentsJsonLd.map(this.formatDeploymentForApp);
      })
    )
  }

  getDeployment(deploymentId: string): Observable<Deployment> {
    return this.http.get(`${environment.apiUrl}/deployments/${deploymentId}`)
    .pipe(
      map((jsonLd) => {
        return this.formatDeploymentForApp(jsonLd);
      })
    )
  }

  createDeployment(deployment: Deployment): Observable<Deployment> {
    return this.http.post(`${environment.apiUrl}/deployments`, deployment)
    .pipe(
      map((jsonLd) => {
        return this.formatDeploymentForApp(jsonLd);
      })
    )
  }

  updateDeployment(deploymentId: string, updates: any): Observable<Deployment> {
    return this.http.patch(`${environment.apiUrl}/deployments/${deploymentId}`, updates)
    .pipe(
      map((jsonLd) => {
        return this.formatDeploymentForApp(jsonLd);
      })
    )
  }

  deleteDeployment(deploymentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/deployments/${deploymentId}`)
  }

  
  formatDeploymentForApp(asJsonLd): Deployment {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context'];
    forApp.id = forApp['@id'];
    return forApp;
  }

}

