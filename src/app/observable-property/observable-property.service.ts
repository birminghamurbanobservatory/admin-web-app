import { Injectable } from '@angular/core';
import {ObservableProperty} from './observable-property';
import {HttpClient} from '@angular/common/http';
import {UtilsService} from '../utils/utils.service';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {cloneDeep} from 'lodash';
import {map} from 'rxjs/operators';
import {Collection} from '../shared/collection';
import {CollectionMeta} from '../shared/collection-meta';


@Injectable({
  providedIn: 'root'
})
export class ObservablePropertyService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }


  getObservableProperties(
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
  ): Observable<{data: ObservableProperty[], meta: CollectionMeta}> {
    const qs = this.utilsService.whereToQueryString(Object.assign({}, where, options));
    return this.http.get(`${environment.apiUrl}/observable-properties${qs}`)
    .pipe(
      map((observablePropertiesCollection: Collection) => {
        return {
          data: observablePropertiesCollection.member.map(this.formatObservablePropertyForApp),
          meta: observablePropertiesCollection.meta
        }
      })
    )
  }


  formatObservablePropertyForApp(asJsonLd): ObservableProperty {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context'];
    forApp.id = forApp['@id'];
    if (forApp['@type']) forApp.type = forApp['@type'];
    return forApp;
  }


}
