import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlatformComponent } from './create-platform.component';

describe('CreatePlatformComponent', () => {
  let component: CreatePlatformComponent;
  let fixture: ComponentFixture<CreatePlatformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePlatformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePlatformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
