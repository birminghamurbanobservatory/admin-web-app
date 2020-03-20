import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Platform} from './platform';
import {environment} from './../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {UtilsService} from '../utils/utils.service';
import {cloneDeep} from 'lodash';
import {map} from 'rxjs/operators';

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
    return this.http.get(`${environment.apiUrl}/platforms${qs}`)
    .pipe(
      map((platformCollection: any) => {
        return platformCollection.member;
      }),
      map((platformsJsonLd: any) => {
        return platformsJsonLd.map(this.formatPlatformForApp);
      })
    )
  }

  createPlatform(platform: Platform): Observable<Platform> {
    return this.http.post(`${environment.apiUrl}/platforms/`, platform)
    .pipe(
      map((jsonLd) => {
        return this.formatPlatformForApp(jsonLd);
      })
    )
  }

  getPlatform(platformId): Observable<Platform> {
    return this.http.get(`${environment.apiUrl}/platforms/${platformId}`)
    .pipe(
      map((jsonLd) => {
        return this.formatPlatformForApp(jsonLd);
      })
    )
  }

  updatePlatform(platformId: string, updates: any): Observable<Platform> {
    return this.http.patch(`${environment.apiUrl}/platforms/${platformId}`, updates)
    .pipe(
      map((jsonLd) => {
        return this.formatPlatformForApp(jsonLd);
      })
    )
  }

  deletePlatform(platformId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/platforms/${platformId}`);
  }

  formatPlatformForApp(asJsonLd): Platform {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context'];
    forApp.id = forApp['@id'];
    return forApp;
  }

}




