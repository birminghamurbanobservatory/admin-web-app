import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureOfInterestComponent } from './feature-of-interest.component';

describe('FeatureOfInterestComponent', () => {
  let component: FeatureOfInterestComponent;
  let fixture: ComponentFixture<FeatureOfInterestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureOfInterestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureOfInterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
