import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import {Platform} from '../platform';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material/dialog';
import {PlatformService} from '../platform.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';

@Component({
  selector: 'uo-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.css']
})
export class PlatformComponent implements OnInit {

  @Input() platform: Platform;
  @Output() deleted = new EventEmitter<string>();
  deleteState = 'pending';
  public viewLocationType: string;

  constructor(
    private logger: UoLoggerService,
    public dialog: MatDialog,
    private platformService: PlatformService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {

  }


  deleteButtonClicked() {
    this.logger.debug('clicked delete');
    this.openDeleteDialog();
  }

  deletePlatform() {

    this.logger.debug(`Deleting platform '${this.platform.id}'`)
    this.deleteState = 'deleting';
    this.platformService.deletePlatform(this.platform.id)
    .pipe(
      catchError((error) => {
        this.logger.error(`Failed to delete platform ${this.platform.id}`);
        this.showErrorSnackBar(error.message);
        this.deleteState = 'pending';
        return throwError(error);
      })
    )
    .subscribe(() => {
      this.logger.debug(`Platform ${this.platform.id} successfully deleted`);
      this.deleted.emit(this.platform.id);
    })  

  }

  showErrorSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 8000,
    });
  }

  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeletePlatformDialog, {
      width: '250px',
      data: {platformLabel: this.platform.label}
    });

    dialogRef.afterClosed().subscribe(choseToDelete => {
      if (choseToDelete) {
      this.deletePlatform();
      }
    });
  }  



}





// Delete Dialog
@Component({
  selector: 'delete-platform-dialog',
  templateUrl: './delete-platform-dialog.html',
})
export class DeletePlatformDialog {

  constructor(
    public dialogRef: MatDialogRef<DeletePlatformDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {platformLabel: string}
  ) {}

}
