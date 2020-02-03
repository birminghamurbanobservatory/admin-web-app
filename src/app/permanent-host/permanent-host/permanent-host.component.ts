import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import {PermanentHost} from '../permanent-host';
import {NGXLogger} from 'ngx-logger';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {PermanentHostService} from '../permanent-host.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'uo-permanent-host',
  templateUrl: './permanent-host.component.html',
  styleUrls: ['./permanent-host.component.css']
})
export class PermanentHostComponent implements OnInit {

  @Input() permanentHost: PermanentHost;
  @Output() deleted = new EventEmitter<string>();
  state = 'pending';

  constructor(
    private logger: NGXLogger,
    public dialog: MatDialog,
    public permanentHostService: PermanentHostService,
    private _snackBar: MatSnackBar    
  ) { }

  ngOnInit() {
  }


  deleteButtonClicked() {
    this.logger.debug('clicked delete');
    this.openDeleteDialog();
  }


  deletePermanentHost() {
    this.logger.debug(`Deleting permamentHost '${this.permanentHost.id}'`)
    this.state = 'deleting';
    this.permanentHostService.deletePermanentHost(this.permanentHost.id)
    .pipe(
      catchError((error) => {
        this.logger.error(`Failed to delete permanent host '${this.permanentHost.id}'`);
        this.showErrorSnackBar(error.message);
        this.state = 'pending';
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
      data: {permanentHostName: this.permanentHost.name}
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
    @Inject(MAT_DIALOG_DATA) public data: {permanentHostName: string}
  ) {}

}