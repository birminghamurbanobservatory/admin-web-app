import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Observation} from './observation';
import {CollectionMeta} from '../shared/collection-meta';
import {UtilsService} from '../utils/utils.service';
import {environment} from './../../environments/environment';
import {map} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import {Collection} from '../shared/collection';


@Injectable({
  providedIn: 'root'
})
export class ObservationService {

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }


  getObservations(where = {}, options = {}): Observable<{ data: Observation[]; meta: CollectionMeta }> {

    const qs = this.utilsService.whereToQueryString(Object.assign({}, where, options));

    return this.http.get(`${environment.apiUrl}/observations${qs}`)
      .pipe(
        map((observationCollection: Collection) => {
          return {
            data: observationCollection.member.map(this.formatObservationForApp),
            meta: observationCollection.meta
          }
        })
      )

  }


  formatObservationForApp(asJsonLd): Observation {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context']; // get rid of the JSON-LD context
    forApp.id = forApp['@id']; // Add id property so easier to reference in code than [@id]
    return forApp;
  }


}
