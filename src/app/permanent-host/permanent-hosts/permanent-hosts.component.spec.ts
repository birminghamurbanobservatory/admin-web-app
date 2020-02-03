import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermanentHostsComponent } from './permanent-hosts.component';

describe('PermanentHostsComponent', () => {
  let component: PermanentHostsComponent;
  let fixture: ComponentFixture<PermanentHostsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermanentHostsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermanentHostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
