import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorDefaultComponent } from './sensor-default.component';

describe('SensorDefaultComponent', () => {
  let component: SensorDefaultComponent;
  let fixture: ComponentFixture<SensorDefaultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorDefaultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
