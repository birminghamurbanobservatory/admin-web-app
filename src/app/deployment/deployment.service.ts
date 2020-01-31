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
    return this.http.get<Deployment[]>(`${environment.apiUrl}/deployments`);
  }

  createDeployment(deployment: Deployment): Observable<Deployment> {
    return this.http.post<Deployment>(`${environment.apiUrl}/deployments`, deployment);
  }

}

