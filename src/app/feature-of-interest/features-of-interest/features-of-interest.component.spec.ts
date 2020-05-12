import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesOfInterestComponent } from './features-of-interest.component';

describe('FeaturesOfInterestComponent', () => {
  let component: FeaturesOfInterestComponent;
  let fixture: ComponentFixture<FeaturesOfInterestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeaturesOfInterestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturesOfInterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
