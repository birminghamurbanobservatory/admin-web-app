import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPermanentHostComponent } from './view-permanent-host.component';

describe('ViewPermanentHostComponent', () => {
  let component: ViewPermanentHostComponent;
  let fixture: ComponentFixture<ViewPermanentHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPermanentHostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPermanentHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
