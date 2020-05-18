import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';


import { FeatureOfInterestRoutingModule } from './feature-of-interest-routing.module';
import { FeatureOfInterestComponent, DeleteFeatureOfInterestDialog } from './feature-of-interest/feature-of-interest.component';
import { FeaturesOfInterestComponent } from './features-of-interest/features-of-interest.component';
import { CreateFeatureOfInterestComponent } from './create-feature-of-interest/create-feature-of-interest.component';
import { ViewFeatureOfInterestComponent } from './view-feature-of-interest/view-feature-of-interest.component';
import {EditFeatureOfInterestComponent} from './edit-feature-of-interest/edit-feature-of-interest.component';
import {LocationSelectorComponent} from '../location/location-selector/location-selector.component';


@NgModule({
  declarations: [
    FeatureOfInterestComponent, 
    FeaturesOfInterestComponent, 
    EditFeatureOfInterestComponent, 
    CreateFeatureOfInterestComponent, 
    ViewFeatureOfInterestComponent,
    DeleteFeatureOfInterestDialog,
    LocationSelectorComponent
  ],
  imports: [
    CommonModule,
    FeatureOfInterestRoutingModule,
    SharedModule
  ],
  entryComponents: [
    DeleteFeatureOfInterestDialog
  ]
})
export class FeatureOfInterestModule { }
