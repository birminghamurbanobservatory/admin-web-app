import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFeatureOfInterestComponent } from './view-feature-of-interest.component';

describe('ViewFeatureOfInterestComponent', () => {
  let component: ViewFeatureOfInterestComponent;
  let fixture: ComponentFixture<ViewFeatureOfInterestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFeatureOfInterestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFeatureOfInterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
