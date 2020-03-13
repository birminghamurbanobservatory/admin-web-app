import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CallbackComponent } from './callback/callback.component';
import {SharedModule} from './shared/shared.module';
import {HttpClientModule} from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';


@NgModule({
  declarations: [
    AppComponent,
    CallbackComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule,
    // Although I set these config options here, the uo-logger.service creates a new instance anyway.
    LoggerModule.forRoot({level: NgxLoggerLevel.DEBUG, timestampFormat: 'shortTime'})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
