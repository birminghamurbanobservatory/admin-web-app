import { Component, OnInit } from '@angular/core';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {ProcedureService} from '../procedure.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Procedure} from '../procedure';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'uo-view-procedure',
  templateUrl: './view-procedure.component.html',
  styleUrls: ['./view-procedure.component.css']
})
export class ViewProcedureComponent implements OnInit {

  procedure: Procedure;
  procedureId: string;
  getState = 'getting';
  deleteState = 'pending';
  getErrorMessage = '';

  constructor(
    private logger: UoLoggerService,
    private procedureService: ProcedureService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.procedureId = params.get('procedureId');
      this.logger.debug(`Procedure id from route params: '${this.procedureId}'`);

      this.getState = 'getting';
      this.procedureService.getProcedure(this.procedureId)
      .pipe(
        catchError((error) => {
          this.getState = 'failed';
          this.getErrorMessage = error.message;
          return throwError(error);
        })
      )
      .subscribe((procedure) => {
        this.logger.debug(procedure);
        this.getState = 'got';
        this.procedure = procedure;
      })

    });

  }

  onDeleted(procedureId: string) {
    this.logger.debug(`${this.constructor.name} is aware that '${procedureId}' has been deleted.`)
    this.deleteState = 'deleted';
  }

}
