import { TestBed } from '@angular/core/testing';

import { ObservablePropertyService } from './observable-property.service';

describe('ObservablePropertyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ObservablePropertyService = TestBed.get(ObservablePropertyService);
    expect(service).toBeTruthy();
  });
});
