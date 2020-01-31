import { Injectable } from '@angular/core';
import {Deployment} from './deployment';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {

  constructor(
    private http: HttpClient,
  ) { }

  getDeployments(): Observable<Deployment[]> {
    // TODO: I'm going to need an interceptor or something that can spot an api error message object and pull out the bits I want, e.g. getting the specific error message from the JSON.
    return this.http.get<Deployment[]>(`${environment.apiUrl}/deployments`);
  }

  createDeployment(deployment: Deployment): Observable<Deployment> {
    return this.http.post<Deployment>(`${environment.apiUrl}/deployments`, deployment);
  }

}
