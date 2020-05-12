import { Component, OnInit, Input, Output, Inject, EventEmitter } from '@angular/core';
import {Procedure} from '../procedure';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {ProcedureService} from '../procedure.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'uo-procedure',
  templateUrl: './procedure.component.html',
  styleUrls: ['./procedure.component.css']
})
export class ProcedureComponent implements OnInit {

  @Input() procedure: Procedure;
  @Output() deleted = new EventEmitter<string>();
  state = 'pending';

  constructor(
    private logger: UoLoggerService,
    public dialog: MatDialog,
    private procedureService: ProcedureService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }


  deleteButtonClicked() {
    this.logger.debug('clicked delete');
    this.openDeleteDialog();
  }


  deleteProcedure() {
    this.logger.debug(`Deleting procedure '${this.procedure.id}'`)
    this.state = 'deleting';
    this.procedureService.deleteProcedure(this.procedure.id)
    .pipe(
      catchError((err) => {
        this.logger.error(`Failed to delete procedure ${this.procedure.id}`);
        this.showErrorSnackBar(err.message);
        this.state = 'pending';
        return throwError(err);
      })
    )
    .subscribe(() => {
      this.logger.debug(`Deployment ${this.procedure.id} successfully deleted`);
      this.deleted.emit(this.procedure.id);
    })  
  }


  showErrorSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 8000,
    });
  }  


  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeleteProcedureDialog, {
      width: '250px',
      data: {procedureLabel: this.procedure.label}
    });

    dialogRef.afterClosed().subscribe(choseToDelete => {
      if (choseToDelete) {
      this.deleteProcedure();
      }
    });
  }  

}



// Delete Dialog
@Component({
  selector: 'delete-procedure-dialog',
  templateUrl: './delete-procedure-dialog.html',
})
export class DeleteProcedureDialog {

  constructor(
    public dialogRef: MatDialogRef<DeleteProcedureDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {procedureLabel: string}
  ) {}


}
