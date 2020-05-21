import { Component, OnInit, Input, Output, Inject, EventEmitter } from '@angular/core';
import {FeatureOfInterest} from '../feature-of-interest';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {FeatureOfInterestService} from '../feature-of-interest.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'uo-featureOfInterest',
  templateUrl: './feature-of-interest.component.html',
  styleUrls: ['./feature-of-interest.component.css']
})
export class FeatureOfInterestComponent implements OnInit {

  @Input() featureOfInterest: FeatureOfInterest;
  @Output() deleted = new EventEmitter<string>();
  state = 'pending';
  public viewLocationType: string;

  constructor(
    private logger: UoLoggerService,
    public dialog: MatDialog,
    private featureOfInterestService: FeatureOfInterestService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }


  deleteButtonClicked() {
    this.logger.debug('clicked delete');
    this.openDeleteDialog();
  }


  deleteFeatureOfInterest() {
    this.logger.debug(`Deleting featureOfInterest '${this.featureOfInterest.id}'`)
    this.state = 'deleting';
    this.featureOfInterestService.deleteFeatureOfInterest(this.featureOfInterest.id)
    .pipe(
      catchError((err) => {
        this.logger.error(`Failed to delete featureOfInterest ${this.featureOfInterest.id}`);
        this.showErrorSnackBar(err.message);
        this.state = 'pending';
        return throwError(err);
      })
    )
    .subscribe(() => {
      this.logger.debug(`Deployment ${this.featureOfInterest.id} successfully deleted`);
      this.deleted.emit(this.featureOfInterest.id);
    })  
  }


  showErrorSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 8000,
    });
  }  


  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeleteFeatureOfInterestDialog, {
      width: '250px',
      data: {featureOfInterestLabel: this.featureOfInterest.label}
    });

    dialogRef.afterClosed().subscribe(choseToDelete => {
      if (choseToDelete) {
      this.deleteFeatureOfInterest();
      }
    });
  }  

}



// Delete Dialog
@Component({
  selector: 'delete-feature-of-interest-dialog',
  templateUrl: './delete-feature-of-interest-dialog.html',
})
export class DeleteFeatureOfInterestDialog {

  constructor(
    public dialogRef: MatDialogRef<DeleteFeatureOfInterestDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {featureOfInterestLabel: string}
  ) {}


}
