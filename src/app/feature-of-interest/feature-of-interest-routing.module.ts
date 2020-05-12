import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {FeaturesOfInterestComponent} from './features-of-interest/features-of-interest.component';
import {CreateFeatureOfInterestComponent} from './create-feature-of-interest/create-feature-of-interest.component';
import {ViewFeatureOfInterestComponent} from './view-feature-of-interest/view-feature-of-interest.component';
import {EditFeatureOfInterestComponent} from './edit-feature-of-interest/edit-feature-of-interest.component';


const routes: Routes = [
  {
    path: '',
    component: FeaturesOfInterestComponent
  },
  {
    path: 'create',
    component: CreateFeatureOfInterestComponent
  },
  {
    path: 'view/:featureOfInterestId',
    component: ViewFeatureOfInterestComponent
  },
  {
    path: 'edit/:featureOfInterestId',
    component: EditFeatureOfInterestComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeatureOfInterestRoutingModule { }
