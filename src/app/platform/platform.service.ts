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

  createPlatform(platform: Platform): Observable<Platform> {
    return this.http.post<Platform>(`${environment.apiUrl}/platforms`, platform);
  }

  deletePlatform(platformId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/platforms/${platformId}`)
  }


}




