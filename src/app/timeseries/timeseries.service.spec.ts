import { TestBed } from '@angular/core/testing';

import { TimeseriesService } from './timeseries.service';

describe('TimeseriesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimeseriesService = TestBed.get(TimeseriesService);
    expect(service).toBeTruthy();
  });
});
