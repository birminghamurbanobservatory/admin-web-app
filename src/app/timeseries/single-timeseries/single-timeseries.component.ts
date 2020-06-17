import { Component, OnInit, EventEmitter, Input, Output, Inject } from '@angular/core';
import {Timeseries} from '../timeseries';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TimeseriesService} from '../timeseries.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';
import {catchError, filter, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {throwError, timer} from 'rxjs';
import {FormControl, Validators} from '@angular/forms';
import {ObservationService} from 'src/app/observation/observation.service';
import {Observation} from 'src/app/observation/observation';

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
  getObsState = 'pending';
  mergeErrorMessage = '';
  getObsErrorMessage = '';
  latestObservation: Observation;
  

  constructor(
    private logger: UoLoggerService,
    public dialog: MatDialog,
    private timeseriesService: TimeseriesService,
    private observationService: ObservationService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {

    this.idOfTimeseriesToMergeIntoThisOne = new FormControl('', Validators.required);

  }


  getLatestObservation() {

    this.getObsErrorMessage = '';
    this.getObsState = 'getting';

    this.observationService.getObservations({
      inTimeseries: this.timeseries.id
    }, {
      limit: 1,
      sortBy: 'resultTime',
      sortOrder: 'desc'
    })
    .pipe(
      catchError((err) => {
        this.logger.debug(err.message);
        this.getObsErrorMessage = err.message;
        this.getObsState = 'pending';
        return throwError(err);
      })
    )
    .subscribe(({data: observations}) => {
      this.logger.debug('Got latest observation');
      this.latestObservation = observations[0]; 
      delete this.latestObservation.id; // As we don't want to show both id and @id.
      this.getObsState = 'pending';
    })

  }


  mergeTimeseries() {

    const goodTimeseriesIdKept = this.timeseries.id;
    const timeseriesIdsMerged = [this.idOfTimeseriesToMergeIntoThisOne.value];

    this.mergeState = 'merging';
    this.mergeErrorMessage = '';
    this.logger.debug(`Merging timeseries ${timeseriesIdsMerged[0]} into ${goodTimeseriesIdKept}`);

    this.timeseriesService.mergeTimeseries(this.timeseries.id, timeseriesIdsMerged)
    .pipe(
      catchError((err) => {
        this.mergeState = 'failed';
        this.mergeErrorMessage = err.message;
        timer(1400).subscribe(() => {
          // not that this really matters as the whole component should be removed
          this.mergeState = 'pending';
        });
        return throwError(err);
      })
    )
    .subscribe(({nObservationsMerged}) => {
      this.logger.debug(`Merged ${nObservationsMerged} observations`);
      this.mergeState = 'pending';
      // We use a snackbar here, because when a merge occurs the parent component will likely update this component, e.g. because the start and end dates of the timeseries have changed, and therefore any success messages written in the component itself will be lost, however the snackbar will persist. 
      this.showMergeSuccessSnackBar(`Successfully merged ${nObservationsMerged} observations.`);
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


  copyToClipboard(val: string){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
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
