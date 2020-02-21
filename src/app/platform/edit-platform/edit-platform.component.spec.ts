import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlatformComponent } from './edit-platform.component';

describe('EditPlatformComponent', () => {
  let component: EditPlatformComponent;
  let fixture: ComponentFixture<EditPlatformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPlatformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPlatformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
