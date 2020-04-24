import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Platform} from './platform';
import {environment} from './../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {UtilsService} from '../utils/utils.service';
import {cloneDeep} from 'lodash';
import {map} from 'rxjs/operators';
import {CollectionMeta} from '../shared/collection-meta';
import {Collection} from '../shared/collection';
import {UoLoggerService} from '../utils/uo-logger.service';
import {SensorService} from '../sensor/sensor.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
    private logger: UoLoggerService
  ) { }

  getPlatforms(
    where: {id?: any} = {}, 
    options: {limit?: number; offset?: number; nest?: boolean} = {}
  ): Observable<{data: Platform[]; meta: CollectionMeta}> {
    const qs = this.utilsService.whereToQueryString(Object.assign({}, where, options));
    return this.http.get(`${environment.apiUrl}/platforms${qs}`)
    .pipe(
      map((platformCollection: Collection) => {
        return {
          data: platformCollection.member.map(this.formatPlatformForApp),
          meta: platformCollection.meta
        }
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
    // For some reason when this function is called within the .pipe() of the http response observable, "this." is no longer this service, and thus if you try to reach any other functions defined in this service it won't work, thus I've had to explicity define all the functions I need in here. 
    
    return formatIt(asJsonLd);

    function formatIt(platformIn): any {
      const forApp = cloneDeep(platformIn);
      delete forApp['@context'];
      forApp.id = forApp['@id'];
      if (forApp['@type']) {
        forApp.type = forApp['@type'];
      }
      if (forApp.hosts) {
        forApp.hosts = formatHosts(forApp.hosts);
      }
      return forApp;
    }

    function formatHosts(hosts: any[]): any[] {
      // I.e. recursively run through the hosts array, and format it depending on whether it's a platform or a sensor
      const formatted = hosts.map((hostee) => {
        const type = hostee['@type'];
        if (type === 'Platform') {
          return formatIt(hostee); 
        } else if (type === 'Sensor') {
          return formatHosteeSensor(hostee);
        } else {
          throw new Error(`Unexpected hostee type: '${type}'`);
        }
      })
      return formatted;
    }

    function formatHosteeSensor(asJsonLd) {
      const forApp = cloneDeep(asJsonLd);
      delete forApp['@context'];
      forApp.id = forApp['@id'];
      if (forApp['@type']) forApp.type = forApp['@type'];
      return forApp;
    }

  }



  

}




