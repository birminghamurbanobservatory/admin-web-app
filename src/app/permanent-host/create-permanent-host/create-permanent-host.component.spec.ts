import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePermanentHostComponent } from './create-permanent-host.component';

describe('CreatePermanentHostComponent', () => {
  let component: CreatePermanentHostComponent;
  let fixture: ComponentFixture<CreatePermanentHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePermanentHostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePermanentHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
