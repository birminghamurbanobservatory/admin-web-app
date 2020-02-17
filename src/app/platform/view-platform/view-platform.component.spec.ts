import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPlatformComponent } from './view-platform.component';

describe('ViewPlatformComponent', () => {
  let component: ViewPlatformComponent;
  let fixture: ComponentFixture<ViewPlatformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPlatformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPlatformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
