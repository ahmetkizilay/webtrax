import { TestBed } from '@angular/core/testing';

import { AudioContextService } from './audio-context.service';

describe('AudioContextService', () => {
  let service: AudioContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
