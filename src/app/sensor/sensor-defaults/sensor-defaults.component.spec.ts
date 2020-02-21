import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorDefaultsComponent } from './sensor-defaults.component';

describe('SensorDefaultsComponent', () => {
  let component: SensorDefaultsComponent;
  let fixture: ComponentFixture<SensorDefaultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorDefaultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorDefaultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
