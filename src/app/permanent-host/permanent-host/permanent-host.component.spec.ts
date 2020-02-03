import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermanentHostComponent } from './permanent-host.component';

describe('PermanentHostComponent', () => {
  let component: PermanentHostComponent;
  let fixture: ComponentFixture<PermanentHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermanentHostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermanentHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
