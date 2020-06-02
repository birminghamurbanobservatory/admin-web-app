import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import {Sensor} from '../sensor';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SensorService} from '../sensor.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UoLoggerService} from 'src/app/utils/uo-logger.service';

@Component({
  selector: 'uo-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnInit {

  @Input() sensor: Sensor;
  @Output() deleted = new EventEmitter<string>();
  state = 'pending';

  constructor(
    private logger: UoLoggerService,
    public dialog: MatDialog,
    private sensorService: SensorService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }


  deleteButtonClicked() {
    this.logger.debug('clicked delete');
    this.openDeleteDialog();
  }


  deleteSensor() {
    this.logger.debug(`Deleting sensor '${this.sensor.id}'`)
    this.state = 'deleting';
    this.sensorService.deleteSensor(this.sensor.id)
    .pipe(
      catchError((err) => {
        this.logger.error(`Failed to delete sensor ${this.sensor.id}`);
        this.showErrorSnackBar(err.message);
        this.state = 'pending';
        return throwError(err);
      })
    )
    .subscribe(() => {
      this.logger.debug(`Deployment ${this.sensor.id} successfully deleted`);
      this.deleted.emit(this.sensor.id);
    })  
  }


  showErrorSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 8000,
    });
  }  


  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeleteSensorDialog, {
      width: '250px',
      data: {sensorLabel: this.sensor.label}
    });

    dialogRef.afterClosed().subscribe(choseToDelete => {
      if (choseToDelete) {
      this.deleteSensor();
      }
    });
  }  

}




// Delete Dialog
@Component({
  selector: 'delete-sensor-dialog',
  templateUrl: './delete-sensor-dialog.html',
})
export class DeleteSensorDialog {

  constructor(
    public dialogRef: MatDialogRef<DeleteSensorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {sensorLabel: string}
  ) {}

}
