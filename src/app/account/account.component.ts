import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

  // TODO: It'll be worth showing the user's list of permissions in this account section. To get this list why not create an endpoint in the API gateway which when called returns the permissions of the user that called it.

}
