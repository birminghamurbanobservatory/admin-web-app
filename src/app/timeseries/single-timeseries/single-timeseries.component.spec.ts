import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTimeseriesComponent } from './single-timeseries.component';

describe('SingleTimeseriesComponent', () => {
  let component: SingleTimeseriesComponent;
  let fixture: ComponentFixture<SingleTimeseriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleTimeseriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleTimeseriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
