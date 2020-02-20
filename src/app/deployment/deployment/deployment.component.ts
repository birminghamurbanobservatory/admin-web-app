import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import {Deployment} from '../deployment';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DeploymentService} from '../deployment.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';

@Component({
  selector: 'uo-deployment',
  templateUrl: './deployment.component.html',
  styleUrls: ['./deployment.component.css']
})
export class DeploymentComponent implements OnInit {

  @Input() deployment: Deployment;
  @Output() deleted = new EventEmitter<string>();
  state = 'pending';

  constructor(
    private logger: UoLoggerService,
    public dialog: MatDialog,
    private deploymentService: DeploymentService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }


  deleteButtonClicked() {
    this.logger.debug('clicked delete');
    this.openDeleteDialog();
  }


  deleteDeployment() {
    this.logger.debug(`Deleting deployment '${this.deployment.id}'`)
    this.state = 'deleting';
    this.deploymentService.deleteDeployment(this.deployment.id)
    .pipe(
      catchError((error) => {
        this.logger.error(`Failed to delete deployment ${this.deployment.id}`);
        this.showErrorSnackBar(error.message);
        this.state = 'pending';
        return throwError(error);
      })
    )
    .subscribe(() => {
      this.logger.debug(`Deployment ${this.deployment.id} successfully deleted`);
      this.deleted.emit(this.deployment.id);
    })  
  }

  showErrorSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 8000,
    });
  }


  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeleteDeploymentDialog, {
      width: '250px',
      data: {deploymentName: this.deployment.name}
    });

    dialogRef.afterClosed().subscribe(choseToDelete => {
      if (choseToDelete) {
      this.deleteDeployment();
      }
    });
  }  

}



// Delete Dialog
@Component({
  selector: 'delete-deployment-dialog',
  templateUrl: './delete-deployment-dialog.html',
})
export class DeleteDeploymentDialog {

  constructor(
    public dialogRef: MatDialogRef<DeleteDeploymentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {deploymentName: string}
  ) {}

}
