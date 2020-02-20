import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnknownSensorComponent } from './unknown-sensor.component';

describe('UnknownSensorComponent', () => {
  let component: UnknownSensorComponent;
  let fixture: ComponentFixture<UnknownSensorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnknownSensorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnknownSensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
