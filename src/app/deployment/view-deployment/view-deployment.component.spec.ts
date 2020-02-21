import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeploymentComponent } from './view-deployment.component';

describe('ViewDeploymentComponent', () => {
  let component: ViewDeploymentComponent;
  let fixture: ComponentFixture<ViewDeploymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewDeploymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDeploymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
