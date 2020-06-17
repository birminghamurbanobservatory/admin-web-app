import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeseriesListComponent } from './timeseries-list.component';

describe('TimeseriesListComponent', () => {
  let component: TimeseriesListComponent;
  let fixture: ComponentFixture<TimeseriesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeseriesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeseriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
