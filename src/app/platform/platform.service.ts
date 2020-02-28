import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Platform} from './platform';
import {environment} from './../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {UtilsService} from '../utils/utils.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }

  getPlatforms(where?: {id: any}): Observable<Platform[]> {
    const qs = this.utilsService.whereToQueryString(where);
    return this.http.get<Platform[]>(`${environment.apiUrl}/platforms${qs}`);
  }

  createPlatform(platform: Platform, ownerDeploymentId: string): Observable<Platform> {
    return this.http.post<Platform>(`${environment.apiUrl}/deployments/${ownerDeploymentId}/platforms/`, platform);
  }

  getPlatform(platformId): Observable<Platform> {
    return this.http.get<Platform>(`${environment.apiUrl}/platforms/${platformId}`);
  }

  updatePlatform(platformId: string, ownerDeploymentId: string, updates: any): Observable<Platform> {
    return this.http.patch<Platform>(`${environment.apiUrl}/deployments/${ownerDeploymentId}/platforms/${platformId}`, updates);
  }

  deletePlatform(ownerDeploymentId: string, platformId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/deployments/${ownerDeploymentId}/platforms/${platformId}`);
  }


}




