import { TestBed } from '@angular/core/testing';

import { UoLoggerService } from './uo-logger.service';

describe('UoLoggerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UoLoggerService = TestBed.get(UoLoggerService);
    expect(service).toBeTruthy();
  });
});
