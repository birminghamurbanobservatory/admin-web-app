import { Injectable } from '@angular/core';
import {UtilsService} from '../utils/utils.service';
import {cloneDeep} from 'lodash';
import {map} from 'rxjs/operators';
import {CollectionMeta} from '../shared/collection-meta';
import {Collection} from '../shared/collection';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {FeatureOfInterest} from './feature-of-interest';

@Injectable({
  providedIn: 'root'
})
export class FeatureOfInterestService {

  
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }


  getFeaturesOfInterest(
    where: {
      id?: any; 
      belongsToDeployment?: any;
      listed?: boolean;
      inCommonVocab?: boolean;
      search?: string;
    } = {}, 
    options: {
      limit?: number; 
      offset?: number
    } = {}
  ): Observable<{data: FeatureOfInterest[], meta: CollectionMeta}> {
    const qs = this.utilsService.whereToQueryString(Object.assign({}, where, options));
    return this.http.get(`${environment.apiUrl}/features-of-interest${qs}`)
    .pipe(
      map((featureOfInterestCollection: Collection) => {
        return {
          data: featureOfInterestCollection.member.map(this.formatFeatureOfInterestForApp),
          meta: featureOfInterestCollection.meta
        }
      })
    )
  }

  getFeatureOfInterest(featureOfInterestId: string): Observable<FeatureOfInterest> {
    return this.http.get(`${environment.apiUrl}/features-of-interest/${featureOfInterestId}`)
    .pipe(
      map((jsonLd) => {
        return this.formatFeatureOfInterestForApp(jsonLd);
      })
    )
  }

  createFeatureOfInterest(featureOfInterest: FeatureOfInterest): Observable<FeatureOfInterest> {
    return this.http.post(`${environment.apiUrl}/features-of-interest`, featureOfInterest)
    .pipe(
      map((jsonLd) => {
        return this.formatFeatureOfInterestForApp(jsonLd);
      })
    )
  }

  updateFeatureOfInterest(featureOfInterestId: string, updates: any): Observable<FeatureOfInterest> {
    return this.http.patch(`${environment.apiUrl}/features-of-interest/${featureOfInterestId}`, updates)
    .pipe(
      map((jsonLd) => {
        return this.formatFeatureOfInterestForApp(jsonLd);
      })
    )
  }

  deleteFeatureOfInterest(featureOfInterestId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/features-of-interest/${featureOfInterestId}`)
  }

  formatFeatureOfInterestForApp(asJsonLd): FeatureOfInterest {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context'];
    forApp.id = forApp['@id'];
    if (forApp['@type']) forApp.type = forApp['@type'];
    return forApp;
  }

}
