import { Component, OnInit, EventEmitter, Input, Output, Inject } from '@angular/core';
import {Timeseries} from '../timeseries';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TimeseriesService} from '../timeseries.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {catchError, filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {throwError, timer} from 'rxjs';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'uo-single-timeseries',
  templateUrl: './single-timeseries.component.html',
  styleUrls: ['./single-timeseries.component.css']
})
export class SingleTimeseriesComponent implements OnInit {

  @Input() timeseries: Timeseries;
  @Output() deleted = new EventEmitter<string>();
  @Output() merged = new EventEmitter<any>();
  state = 'pending';
  idOfTimeseriesToMergeIntoThisOne;
  mergeState = 'pending';
  mergeErrorMessage = '';
  mergeSuccessMessage = '';

  constructor(
    private logger: UoLoggerService,
    public dialog: MatDialog,
    private timeseriesService: TimeseriesService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {

    this.idOfTimeseriesToMergeIntoThisOne = new FormControl('', Validators.required);

  }



  mergeTimeseries() {

    const goodTimeseriesIdKept = this.timeseries.id;
    const timeseriesIdsMerged = [this.idOfTimeseriesToMergeIntoThisOne.value];

    this.mergeState = 'merging';
    this.mergeErrorMessage = '';
    this.mergeSuccessMessage = '';
    this.logger.debug(`Merging timeseries ${timeseriesIdsMerged[0]} into ${goodTimeseriesIdKept}`);

    this.timeseriesService.mergeTimeseries(this.timeseries.id, timeseriesIdsMerged)
    .pipe(
      catchError((error) => {
        this.mergeState = 'failed';
        this.mergeErrorMessage = error.message;
        timer(1400).subscribe(() => {
          // not that this really matters as the whole component should be removed
          this.mergeState = 'pending';
        });
        return throwError(error);
      })
    )
    .subscribe(({nObservationsMerged}) => {
      this.logger.debug(`Merged ${nObservationsMerged} observations`);
      this.mergeState = 'pending';
      this.mergeSuccessMessage = `Successfully merged ${nObservationsMerged} observations.`
      this.merged.emit({
        goodTimeseriesIdKept,
        timeseriesIdsMerged,
        nObservationsMerged
      });
    })    

  }

  showMergeSuccessSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 8000,
    });
  }


  deleteTimeseries() {
    this.logger.debug(`Deleting timeseries '${this.timeseries.id}'`)
    this.state = 'deleting';
    this.timeseriesService.deleteTimeseries(this.timeseries.id)
    .pipe(
      catchError((err) => {
        this.logger.error(`Failed to delete timeseries ${this.timeseries.id}`);
        this.showErrorSnackBar(err.message);
        this.state = 'pending';
        return throwError(err);
      })
    )
    .subscribe(() => {
      this.logger.debug(`Timeseries ${this.timeseries.id} successfully deleted`);
      this.deleted.emit(this.timeseries.id);
    })  
  }


  showErrorSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 8000,
    });
  }


  deleteButtonClicked() {
    this.logger.debug('clicked delete');
    this.openDeleteDialog();
  }


  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeleteTimeseriesDialog, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(choseToDelete => {
      if (choseToDelete) {
      this.deleteTimeseries();
      }
    });
  }  

}


// Delete Dialog
@Component({
  selector: 'delete-timeseries-dialog',
  templateUrl: './delete-timeseries-dialog.html',
})
export class DeleteTimeseriesDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteTimeseriesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {}
  ) {}
}
