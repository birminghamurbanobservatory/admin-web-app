import { Component, OnInit } from '@angular/core';
import {Procedure} from '../procedure';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {ProcedureService} from '../procedure.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {UtilsService} from 'src/app/utils/utils.service';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {catchError, filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {throwError, timer} from 'rxjs';
import {Deployment} from 'src/app/deployment/deployment';

@Component({
  selector: 'uo-edit-procedure',
  templateUrl: './edit-procedure.component.html',
  styleUrls: ['./edit-procedure.component.css']
})
export class EditProcedureComponent implements OnInit {

  procedureId: string;
  procedure: Procedure; 
  getState = 'getting';
  getErrorMessage: string;
  editProcedureForm;
  updateState = 'pending';
  updateErrorMessage: string;
  deploymentChoices: Deployment[] = [];

  constructor(
    private logger: UoLoggerService,
    private procedureService: ProcedureService,
    private deploymentService: DeploymentService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.procedureId = params.get('procedureId');
      this.logger.debug(`Procedure ID from route params: '${this.procedureId}'`);
      this.getProcedureAndPopulateForm(this.procedureId);
    });

  }

  getProcedureAndPopulateForm(procedureId: string) {

    this.getState = 'getting';
    this.procedureService.getProcedure(procedureId)
    .pipe(
      catchError((error) => {
        this.getState = 'failed';
        this.getErrorMessage = error.message;
        return throwError(error);
      })
    )
    .subscribe((procedure: Procedure) => {
      this.logger.debug(procedure);

      this.editProcedureForm = this.fb.group({
        label: [procedure.label, Validators.required],
        description: [procedure.description],
        listed: [procedure.listed],
        inCommonVocab: [procedure.inCommonVocab],
        belongsToDeployment: [
          procedure.belongsToDeployment || ''
        ],
      });

      this.getState = 'got';
      this.procedure = procedure;

      this.onChanges();
 
    })

  }

  onChanges() {

    // autocomplete for isHostedBy
    this.editProcedureForm.get('belongsToDeployment').valueChanges
    .pipe(
      filter((value: string) => value.length > 2),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.deploymentService.getDeployments({id: {begins: value}}))
    )
    .subscribe(({data: deployments}) => {
      this.deploymentChoices = deployments;
      this.logger.debug(deployments);
    });

  }


  onSubmit(updates) {

    this.updateState = 'updating';
    this.updateErrorMessage = '';

    // If some of the properties haven't even changed then don't bother sending them to the server.
    const cleanedUpdates = this.utilsService.removeUnchangedUpdates(updates, this.procedure);

    const keysToNullOrRemove = ['belongsToDeployment'];
    keysToNullOrRemove.forEach((key) => {  
      if (cleanedUpdates[key] === '') {
        if (this.procedure[key]) {
          // Allows this property to be unset
          cleanedUpdates[key] = null;
        } else {
          // Won't unset a property that wasn't previously set.
          delete cleanedUpdates[key];
        }
      }
    })

    this.logger.debug('Updates after tidying:')
    this.logger.debug(cleanedUpdates);

    if (Object.keys(cleanedUpdates).length === 0) {
      this.updateErrorMessage = 'None of the details were any different.';
      this.updateState = 'pending';
      
    } else {
      this.procedureService.updateProcedure(this.procedureId, cleanedUpdates)
      .pipe(
        catchError((error) => {
          this.updateState = 'failed';
          this.updateErrorMessage = error.message;
          timer(1400).subscribe(() => {
            this.updateState = 'pending';
          });
          return throwError(error);
        })
      )
      .subscribe((updatedProcedure: Procedure) => {
        this.updateState = 'updated';
        this.procedure = updatedProcedure;
        this.logger.debug(updatedProcedure);
        timer(1400).subscribe(() => {
          this.updateState = 'pending';
        });
      })    
    }
  }

}
