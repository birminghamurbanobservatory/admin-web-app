import { Component, OnInit, OnDestroy } from '@angular/core';
import {timer, Observable, throwError, Subject} from 'rxjs';
import {catchError, takeUntil} from 'rxjs/operators';
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
export class CreatePermanentHostComponent implements OnInit, OnDestroy {

  createPermanentHostForm;
  createErrorMessage = '';
  state = 'pending';
  createdPermanentHost: PermanentHost;
  private unsubscribe$ = new Subject();

  constructor(
    private permanentHostService: PermanentHostService,
    private logger: UoLoggerService,
    private fb: FormBuilder,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {

    this.createPermanentHostForm = this.fb.group({
      id: ['', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
      label: '',
      description: '',
      static: false,
      passLocationToObservations: true
    });

    // Begin by setting the form as invalid, because neither the id or label has been specified yet.
    // We need to use setTimeout here to wait till the next 'tick' otherwise the form validation won't have had a chance to run.
    setTimeout(() => {
      this.createPermanentHostForm.setErrors({invalid: true});
    })

    this.listenForFormChanges();

  }


  listenForFormChanges() {
    this.createPermanentHostForm.valueChanges
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((values) => {
      if (values.id === '' && values.label === '') {
        this.logger.debug('Form is currently invalid because neither an id or label is given');
        this.createPermanentHostForm.setErrors({invalid: true});
      }
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


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


}
