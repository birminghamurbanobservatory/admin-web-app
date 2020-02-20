import { Component, OnInit } from '@angular/core';
import {AuthService} from 'src/app/auth/auth.service';
import {AccountService} from '../account.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {sortBy} from 'lodash';

@Component({
  selector: 'uo-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent implements OnInit {

  permissions: string[];
  getPermissionsState = 'getting';
  getPermissionsErrorMessage: string;

  constructor(
    public auth: AuthService,
    private accountService: AccountService
  ) { }

  ngOnInit() {

    this.getPermissions();

  }

  getPermissions() {
    this.getPermissionsState = 'getting';
    this.accountService.getPermissions()
    .pipe(
      catchError((err) => {
        this.getPermissionsErrorMessage = err.message;
        this.getPermissionsState = 'failed';
        return throwError(err);
      })
    )
    .subscribe((permissions: string[]) => {
      this.permissions = sortBy(permissions);
      this.getPermissionsState = 'got';
    })
  }


}
