import { Component, OnInit } from '@angular/core';
import {timer, Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {FormBuilder, Validators} from '@angular/forms';
import {PermanentHostService} from '../permanent-host.service';
import {UtilsService} from 'src/app/utils/utils.service';
import {PermanentHost} from '../permanent-host';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';

@Component({
  selector: 'uo-create-permanent-host',
  templateUrl: './create-permanent-host.component.html',
  styleUrls: ['./create-permanent-host.component.css']
})
export class CreatePermanentHostComponent implements OnInit {

  createPermanentHostForm;
  createErrorMessage = '';
  state = 'pending';
  createdPermanentHost: PermanentHost;

  constructor(
    private permanentHostService: PermanentHostService,
    private logger: UoLoggerService,
    private fb: FormBuilder,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {

    this.createPermanentHostForm = this.fb.group({
      name: ['', Validators.required],
      id: ['', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
      description: '',
      static: false
    });

  }


  onSubmit(permanentHostToCreate) {
    
    this.state = 'creating';
    this.createErrorMessage = '';

    const cleanedPermanentHost = this.utilsService.stripEmptyStrings(permanentHostToCreate);
    this.logger.debug(cleanedPermanentHost);
    
    this.permanentHostService.createPermanentHost(cleanedPermanentHost)
    .pipe(
      catchError((err) => {
        this.state = 'failed';
        this.createErrorMessage = err.message;
        this.briefDelay().subscribe(() => {
          this.state = 'pending';
        });
        return throwError(err);
      })
    )
    .subscribe((createdPermanentHost) => {
      this.state = 'created';
      this.logger.debug(createdPermanentHost);
      this.createdPermanentHost = createdPermanentHost;
      // Might be a better way to do this.
      this.briefDelay().subscribe(() => {
        this.state = 'pending';
      });

    })    

  }


  briefDelay(): Observable<number> {
    return timer(1400);
  }


}
