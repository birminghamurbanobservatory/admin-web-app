import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFeatureOfInterestComponent } from './edit-feature-of-interest.component';

describe('EditFeatureOfInterestComponent', () => {
  let component: EditFeatureOfInterestComponent;
  let fixture: ComponentFixture<EditFeatureOfInterestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFeatureOfInterestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFeatureOfInterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
