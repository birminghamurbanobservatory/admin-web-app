import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

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

@NgModule({
  imports: [
    // You only need to import those modules that a required by the assets in the SharedModule.
    CommonModule, 
    ReactiveFormsModule,
  ],
  declarations: [
    // Declare any custom components, pipes, etc, you create in here so that they can be easily used by all your feature modules.
  ],
  providers: [],
  exports: [
    CommonModule,
    ReactiveFormsModule,
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
    MatExpansionModule  
  ]
})
export class SharedModule { }