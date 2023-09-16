import { TestBed } from '@angular/core/testing';

import { SampleLibraryService } from './sample-library.service';

describe('SampleLibraryService', () => {
  let service: SampleLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SampleLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
