import { TestBed } from '@angular/core/testing';

import { UnknownSensorService } from './unknown-sensor.service';

describe('UnknownSensorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnknownSensorService = TestBed.get(UnknownSensorService);
    expect(service).toBeTruthy();
  });
});
