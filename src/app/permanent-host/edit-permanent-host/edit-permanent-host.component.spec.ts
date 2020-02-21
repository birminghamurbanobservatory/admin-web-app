import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPermanentHostComponent } from './edit-permanent-host.component';

describe('EditPermanentHostComponent', () => {
  let component: EditPermanentHostComponent;
  let fixture: ComponentFixture<EditPermanentHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPermanentHostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPermanentHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
