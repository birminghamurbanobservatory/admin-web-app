import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Custom stuff
import {LocationViewerComponent} from '../location/location-viewer/location-viewer.component';

// Angular Material
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatPaginatorModule} from '@angular/material/paginator';

@NgModule({
  imports: [
    // You only need to import those modules that a required by the assets in the SharedModule.
    CommonModule, 
    ReactiveFormsModule,
  ],
  declarations: [
    // Declare any custom components, pipes, etc, you create in here so that they can be easily used by all your feature modules.
    LocationViewerComponent
  ],
  providers: [],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    // Custom
    LocationViewerComponent,
    // Angular Material (add any material components you need to use in here first)
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    FlexLayoutModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,  
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatCardModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatPaginatorModule
  ]
})
export class SharedModule { }