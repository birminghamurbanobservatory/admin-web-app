import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(
    private http: HttpClient
  ) { }

  getPermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/account/permissions`);
  }

}
