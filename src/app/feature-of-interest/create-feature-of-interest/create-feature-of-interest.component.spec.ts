import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFeatureOfInterestComponent } from './create-feature-of-interest.component';

describe('CreateFeatureOfInterestComponent', () => {
  let component: CreateFeatureOfInterestComponent;
  let fixture: ComponentFixture<CreateFeatureOfInterestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateFeatureOfInterestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFeatureOfInterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
