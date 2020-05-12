import { TestBed } from '@angular/core/testing';

import { FeatureOfInterestService } from './feature-of-interest.service';

describe('FeatureOfInterestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FeatureOfInterestService = TestBed.get(FeatureOfInterestService);
    expect(service).toBeTruthy();
  });
});
