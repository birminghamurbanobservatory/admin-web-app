import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UtilsService} from '../utils/utils.service';
import {environment} from './../../environments/environment';
import {CollectionMeta} from '../shared/collection-meta';
import {Timeseries} from './timeseries';
import {Observable} from 'rxjs';
import {cloneDeep} from 'lodash';
import {Collection} from '../shared/collection';
import {map} from 'rxjs/operators';
import {timeseriesMergeResponse} from './timeseries-merge-response';

@Injectable({
  providedIn: 'root'
})
export class TimeseriesService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }


  getMultipleTimeseries(
    where: {
      id?: any; 
      madeBySensor?: any;
      observedProperty?: any;
      // Could add more...
    } = {},
    options: {
      limit?: number; 
      offset?: number;
      populate?: string[];
    } = {}
  ): Observable<{data: Timeseries[], meta: CollectionMeta}> {
    const qs = this.utilsService.whereToQueryString(Object.assign({}, where, options));
    return this.http.get(`${environment.apiUrl}/timeseries${qs}`)
    .pipe(
      map((timeseriesCollection: Collection) => {
        return {
          data: timeseriesCollection.member.map(this.formatSingleTimeseriesForApp),
          meta: timeseriesCollection.meta
        }
      })
    )
  }


  getSingleTimeseries(timeseriesId: string): Observable<Timeseries> {
    return this.http.get(`${environment.apiUrl}/timeseries/${timeseriesId}`)
    .pipe(
      map((jsonLd) => {
        return this.formatSingleTimeseriesForApp(jsonLd);
      })
    )
  }

 
  mergeTimeseries(goodTimeseriesIdToKeep: string, timeseriesIdsToBeMerged: string[]): Observable<timeseriesMergeResponse> {
    return this.http.post(`${environment.apiUrl}/timeseries/${goodTimeseriesIdToKeep}/merge`, timeseriesIdsToBeMerged)
    .pipe(
      map((response: timeseriesMergeResponse) => {
        return response;
      })
    )
  }


  // This not only deletes the timeseries, but all its observations too.
  deleteTimeseries(timeseriesId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/timeseries/${timeseriesId}`)
  }


  formatSingleTimeseriesForApp(asJsonLd): Timeseries {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context'];
    forApp.id = forApp['@id'];
    if (forApp['@type']) forApp.type = forApp['@type'];
    return forApp;
  }

}
