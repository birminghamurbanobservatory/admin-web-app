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
    CallbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule,
    // TODO: change the level depending on the environment, i.e. production vs development
    // Options: TRACE|DEBUG|INFO|LOG|WARN|ERROR|FATAL|OFF
    LoggerModule.forRoot({level: NgxLoggerLevel.DEBUG, timestampFormat: 'shortTime', enableSourceMaps: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
