import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorConfigToolComponent } from './sensor-config-tool.component';

describe('SensorConfigToolComponent', () => {
  let component: SensorConfigToolComponent;
  let fixture: ComponentFixture<SensorConfigToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorConfigToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorConfigToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
