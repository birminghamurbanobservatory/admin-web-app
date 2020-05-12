import { Injectable } from '@angular/core';
import {UtilsService} from '../utils/utils.service';
import {cloneDeep} from 'lodash';
import {map} from 'rxjs/operators';
import {CollectionMeta} from '../shared/collection-meta';
import {Collection} from '../shared/collection';
import {HttpClient} from '@angular/common/http';
import {environment} from './../../environments/environment';
import {Observable} from 'rxjs';
import {Procedure} from './procedure';

@Injectable({
  providedIn: 'root'
})
export class ProcedureService {

  
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService
  ) { }


  getProcedures(
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
  ): Observable<{data: Procedure[], meta: CollectionMeta}> {
    const qs = this.utilsService.whereToQueryString(Object.assign({}, where, options));
    return this.http.get(`${environment.apiUrl}/procedures${qs}`)
    .pipe(
      map((procedureCollection: Collection) => {
        return {
          data: procedureCollection.member.map(this.formatProcedureForApp),
          meta: procedureCollection.meta
        }
      })
    )
  }

  getProcedure(procedureId: string): Observable<Procedure> {
    return this.http.get(`${environment.apiUrl}/procedures/${procedureId}`)
    .pipe(
      map((jsonLd) => {
        return this.formatProcedureForApp(jsonLd);
      })
    )
  }

  createProcedure(procedure: Procedure): Observable<Procedure> {
    return this.http.post(`${environment.apiUrl}/procedures`, procedure)
    .pipe(
      map((jsonLd) => {
        return this.formatProcedureForApp(jsonLd);
      })
    )
  }

  updateProcedure(procedureId: string, updates: any): Observable<Procedure> {
    return this.http.patch(`${environment.apiUrl}/procedures/${procedureId}`, updates)
    .pipe(
      map((jsonLd) => {
        return this.formatProcedureForApp(jsonLd);
      })
    )
  }

  deleteProcedure(procedureId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/procedures/${procedureId}`)
  }

  formatProcedureForApp(asJsonLd): Procedure {
    const forApp = cloneDeep(asJsonLd);
    delete forApp['@context'];
    forApp.id = forApp['@id'];
    if (forApp['@type']) forApp.type = forApp['@type'];
    return forApp;
  }

}
