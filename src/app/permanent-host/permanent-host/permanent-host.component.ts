import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import {PermanentHost} from '../permanent-host';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {PermanentHostService} from '../permanent-host.service';
import {catchError, filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {throwError, Observable, timer} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl} from '@angular/forms';
import {DeploymentService} from 'src/app/deployment/deployment.service';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';

@Component({
  selector: 'uo-permanent-host',
  templateUrl: './permanent-host.component.html',
  styleUrls: ['./permanent-host.component.css']
})
export class PermanentHostComponent implements OnInit {

  @Input() permanentHost: PermanentHost;
  @Output() deleted = new EventEmitter<string>();
  deleteState = 'pending';
  registerToDeploymentId;
  deploymentChoices = [];
  registerState = 'pending';
  registerErrorMessage = '';

  constructor(
    private logger: UoLoggerService,
    public dialog: MatDialog,
    public permanentHostService: PermanentHostService,
    public deploymentService: DeploymentService,
    private _snackBar: MatSnackBar    
  ) { }

  ngOnInit() {

    if (!this.permanentHost.registeredAs) {
      this.registerToDeploymentId = new FormControl('');
      this.watchForDeploymentIdChanges();
    }

  }

  watchForDeploymentIdChanges() {

    this.registerToDeploymentId.valueChanges
    .pipe(
      filter((value: string) => value.length > 0),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.deploymentService.getDeployments({id: {begins: value}}))
    )
    .subscribe(({data: deployments}) => {
      this.deploymentChoices = deployments;
      this.logger.debug(deployments);
    });

  }


  register() {

    this.registerState = 'registering';
    this.registerErrorMessage = '';
    this.logger.debug(`Registering permanent host to deployment '${this.registerToDeploymentId.value}' using key ${this.permanentHost.registrationKey}`);

    this.permanentHostService.register(this.permanentHost.registrationKey, this.registerToDeploymentId.value)
    .pipe(
      catchError((error) => {
        this.registerState = 'failed';
        this.registerErrorMessage = error.message;
        timer(1400).subscribe(() => {
          this.registerState = 'pending';
        });
        return throwError(error);
      })
    )
    .subscribe((createdPlatform) => {
      this.logger.debug(createdPlatform);
      this.permanentHost.registeredAs = createdPlatform.id;
      this.registerState = 'pending';
    })    

  }



  deleteButtonClicked() {
    this.logger.debug('clicked delete');
    this.openDeleteDialog();
  }


  deletePermanentHost() {
    this.logger.debug(`Deleting permamentHost '${this.permanentHost.id}'`)
    this.deleteState = 'deleting';
    this.permanentHostService.deletePermanentHost(this.permanentHost.id)
    .pipe(
      catchError((error) => {
        this.logger.error(`Failed to delete permanent host '${this.permanentHost.id}'`);
        this.showErrorSnackBar(error.message);
        this.deleteState = 'pending';
        return throwError(error);
      })
    )
    .subscribe(() => {
      this.logger.debug(`Deployment ${this.permanentHost.id} successfully deleted`);
      this.deleted.emit(this.permanentHost.id);
    })  
  }


  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeletePermanentHostDialog, {
      width: '250px',
      data: {permanentHostLabel: this.permanentHost.label}
    });

    dialogRef.afterClosed().subscribe(choseToDelete => {
      if (choseToDelete) {
      this.deletePermanentHost();
      }
    });
  }  


  showErrorSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 8000,
    });
  }


}



// Delete Dialog
@Component({
  selector: 'delete-permanent-host-dialog',
  templateUrl: './delete-permanent-host-dialog.html',
})
export class DeletePermanentHostDialog {

  constructor(
    public dialogRef: MatDialogRef<DeletePermanentHostDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {permanentHostLabel: string}
  ) {}

}