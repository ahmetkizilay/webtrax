import { TestBed } from '@angular/core/testing';

import { MockAudioContext } from '../mocks/audio_context';
import { AudioService } from './audio.service';
import { SampleLibraryService } from '../sample_library/sample_library.service';

describe('AudioService', () => {
  let service: AudioService;
  let mockAudioContext: MockAudioContext;

  beforeEach(() => {
    mockAudioContext = new MockAudioContext();
    TestBed.configureTestingModule({
      providers: [
        { provide: AudioContext, useValue: mockAudioContext},
        { provide: SampleLibraryService, useValue: {}},
      ],
    });
    service = TestBed.inject(AudioService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });
});
