import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {PermanentHost} from './permanent-host';
import {UtilsService} from '../utils/utils.service';
import {Platform} from '../platform/platform';
import {map} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import {CollectionMeta} from '../shared/collection-meta';
import {Collection} from '../shared/collection';

@Injectable({
  providedIn: 'root'
})
export class PermanentHostService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }

  getPermanentHosts(
    where: {id?: any} = {}, 
    options: {limit?: number; offset?: number;} = {}
  ): Observable<{data: PermanentHost[], meta: CollectionMeta}> {
    const qs = this.utilsService.whereToQueryString(Object.assign({}, where, options));
    return this.http.get(`${environment.apiUrl}/permanent-hosts${qs}`)
    .pipe(
      map((permanentHostCollection: Collection) => {
        return {
          data: permanentHostCollection.member.map(this.formatPermanentHostForApp),
          meta: permanentHostCollection.meta
        }
      })
    )
  }

  getPermanentHost(permanentHostId: string): Observable<PermanentHost> {
    return this.http.get(`${environment.apiUrl}/permanent-hosts/${permanentHostId}`)
    .pipe(
      map((jsonLd) => {
        return this.formatPermanentHostForApp(jsonLd);
      })
    );
  }

  createPermanentHost(permanentHost: PermanentHost): Observable<PermanentHost> {
    return this.http.post(`${environment.apiUrl}/permanent-hosts`, permanentHost)
    .pipe(
      map((jsonLd) => {
        return this.formatPermanentHostForApp(jsonLd);
      })
    );
  }

  updatePermanentHost(permanentHostId: string, updates: any): Observable<PermanentHost> {
    return this.http.patch(`${environment.apiUrl}/permanent-hosts/${permanentHostId}`, updates)
    .pipe(
      map((jsonLd) => {
        return this.formatPermanentHostForApp(jsonLd);
      })
    );
  }

  deletePermanentHost(permanentHostId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/permanent-hosts/${permanentHostId}`);
  }

  register(registrationKey: string, deploymentId: string): Observable<Platform> {
    return this.http.post(`${environment.apiUrl}/deployments/${deploymentId}/register`, {
      registrationKey
    })
    .pipe(
      map((jsonLd) => {
        return this.formatPermanentHostForApp(jsonLd);
      })
    );
  }

  formatPermanentHostForApp(asJsonLd): PermanentHost {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context'];
    forApp.id = forApp['@id'];
    return forApp;
  }

}
