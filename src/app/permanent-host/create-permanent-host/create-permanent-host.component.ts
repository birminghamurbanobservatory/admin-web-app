import { Component, OnInit } from '@angular/core';
import {timer, Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {NGXLogger} from 'ngx-logger';
import {FormBuilder, Validators} from '@angular/forms';
import {PermanentHostService} from '../permanent-host.service';

@Component({
  selector: 'uo-create-permanent-host',
  templateUrl: './create-permanent-host.component.html',
  styleUrls: ['./create-permanent-host.component.css']
})
export class CreatePermanentHostComponent implements OnInit {

  createPermanentHostForm;
  createErrorMessage = '';
  state = 'pending';

  constructor(
    private permanentHostService: PermanentHostService,
    private logger: NGXLogger,
    private fb: FormBuilder
  ) {}

  ngOnInit() {

    this.createPermanentHostForm = this.fb.group({
      name: ['', Validators.required],
      id: '',
      description: '',
      static: false
    });

  }


  onSubmit(permanentHostToCreate) {
    this.state = 'creating';
    this.createErrorMessage = '';
    this.logger.debug(permanentHostToCreate);

    if (permanentHostToCreate.id === '') {
      delete permanentHostToCreate.id;
    }
    if (permanentHostToCreate.description === '') {
      delete permanentHostToCreate.description;
    }

    this.permanentHostService.createPermanentHost(permanentHostToCreate)
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
