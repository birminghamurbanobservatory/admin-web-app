import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSingleTimeseriesComponent } from './view-single-timeseries.component';

describe('ViewSingleTimeseriesComponent', () => {
  let component: ViewSingleTimeseriesComponent;
  let fixture: ComponentFixture<ViewSingleTimeseriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSingleTimeseriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSingleTimeseriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
