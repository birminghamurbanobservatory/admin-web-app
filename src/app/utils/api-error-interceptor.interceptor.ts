import { Injectable } from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import {catchError} from 'rxjs/operators';
import {NGXLogger} from 'ngx-logger';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {

  constructor(
    private logger: NGXLogger
  ) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    return next.handle(req)
    .pipe(

      catchError((err: HttpErrorResponse) => {
        
        // Look to see if the response is the standard JSON error object used by the API
        if (err.error && err.error.errorCode && err.error.message) {
          this.logger.error(`API error response (${err.error.errorCode}): ${err.error.message}`);
          let errCopy = JSON.parse(JSON.stringify(err));
          // Bring the following properties out of the nested error object inside of the HttpErrorResponse
          errCopy.message = err.error.message;
          errCopy.errorCode = err.error.errorCode;
          return throwError(errCopy);
        } else {
          return throwError(err);
        }
        
      })

    )
  }
}
