import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorConfigsComponent } from './sensor-configs.component';

describe('SensorConfigsComponent', () => {
  let component: SensorConfigsComponent;
  let fixture: ComponentFixture<SensorConfigsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorConfigsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorConfigsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
