import { Component, OnInit } from '@angular/core';
import {ProcedureService} from '../procedure.service';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {UtilsService} from 'src/app/utils/utils.service';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {filter, debounceTime, distinctUntilChanged, switchMap, catchError} from 'rxjs/operators';
import {timer, throwError} from 'rxjs';

@Component({
  selector: 'uo-create-procedure',
  templateUrl: './create-procedure.component.html',
  styleUrls: ['./create-procedure.component.css']
})
export class CreateProcedureComponent implements OnInit {

  createProcedureForm;
  createErrorMessage = '';
  state = 'pending';
  deploymentChoices = [];
  hostProcedureChoices = [];
  selectedGeometry: any;

  constructor(
    private procedureService: ProcedureService,
    private deploymentService: DeploymentService,
    private logger: UoLoggerService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {

    this.createProcedureForm = this.fb.group({
      id: [this.route.snapshot.paramMap.get('id') || '', Validators.pattern('[a-z0-9]+(-[a-z0-9]+)*$')],
      label: ['', Validators.required],
      description: '',
      listed: true,
      inCommonVocab: false,
      // N.B. this snapshot approach is fine as long as you never reuse the component, i.e. you always naviagate to another component before coming back to this one, e.g. with a different permanentHost.
      belongsToDeployment: [this.route.snapshot.paramMap.get('belongsToDeployment') || '']
    });

    this.listenForImportantChanges();

  }

  listenForImportantChanges() {

    this.createProcedureForm.get('belongsToDeployment').valueChanges
    .pipe(
      filter((value: string) => value.length > 1),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.deploymentService.getDeployments({id: {begins: value}}))
    )
    .subscribe(({data: deployments}) => {
      this.deploymentChoices = deployments;
      this.logger.debug(deployments);
    });

  }

  onSubmit(procedureToCreate) {
    this.state = 'creating';
    this.createErrorMessage = '';
    this.logger.debug(procedureToCreate);

    const cleanedProcedure = this.utilsService.stripEmptyStrings(procedureToCreate);

    this.procedureService.createProcedure(cleanedProcedure)
    .pipe(
      catchError((error) => {
        this.state = 'failed';
        this.createErrorMessage = error.message;
        timer(1400).subscribe(() => {
          this.state = 'pending';
        });
        return throwError(error);
      })
    )
    .subscribe((createdProcedure) => {
      this.state = 'created';
      this.logger.debug(createdProcedure);

      timer(1400).subscribe(() => {
        this.state = 'pending';
      });

    })    

  }

}
