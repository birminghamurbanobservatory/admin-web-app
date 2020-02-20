import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnknownSensorsComponent } from './unknown-sensors.component';

describe('UnknownSensorsComponent', () => {
  let component: UnknownSensorsComponent;
  let fixture: ComponentFixture<UnknownSensorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnknownSensorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnknownSensorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
