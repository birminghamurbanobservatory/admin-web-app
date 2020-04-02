import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from './../../environments/environment';
import {UnknownSensor} from './unknown-sensor';
import {map} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import {CollectionMeta} from '../shared/collection-meta';
import {Collection} from '../shared/collection';
import {UtilsService} from '../utils/utils.service';

@Injectable({
  providedIn: 'root'
})
export class UnknownSensorService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }

  getUnknownSensors(options?: {limit?: number; offset?: number}): Observable<{data: UnknownSensor[], meta: CollectionMeta}> {
    const qs = this.utilsService.whereToQueryString(options);
    return this.http.get(`${environment.apiUrl}/unknown-sensors${qs}`)
    .pipe(
      map((unknownSensorCollection: Collection) => {
        return {
          data: unknownSensorCollection.member.map(this.formatUnknownSensorForApp),
          meta: unknownSensorCollection.meta
        }
      })
    )
  }

  formatUnknownSensorForApp(asJsonLd): UnknownSensor {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context'];
    forApp.id = forApp['@id'];
    return forApp;
  }

}
