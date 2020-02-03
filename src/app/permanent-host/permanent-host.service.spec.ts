import { TestBed } from '@angular/core/testing';

import { PermanentHostService } from './permanent-host.service';

describe('PermanentHostService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PermanentHostService = TestBed.get(PermanentHostService);
    expect(service).toBeTruthy();
  });
});
