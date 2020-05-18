import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointLocationSelectorComponent } from './point-location-selector.component';

describe('PointLocationSelectorComponent', () => {
  let component: PointLocationSelectorComponent;
  let fixture: ComponentFixture<PointLocationSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointLocationSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointLocationSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
