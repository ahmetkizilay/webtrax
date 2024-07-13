import { TestBed } from '@angular/core/testing';

import { MockAudioContext, MockDelayNode } from '../mocks/audio_context';
import { AudioService } from './audio.service';
import { SampleLibraryService } from '../sample_library/sample_library.service';
import {
  TransportService,
  TransportState,
  TransportStatus,
} from '../transport/transport.service';
import { Subject } from 'rxjs';

describe('AudioService', () => {
  let service: AudioService;
  let mockAudioContext: MockAudioContext;

  let mockTransportState$: Subject<TransportState>;

  beforeEach(() => {
    mockAudioContext = new MockAudioContext();
    mockTransportState$ = new Subject<TransportState>();

    TestBed.configureTestingModule({
      providers: [
        { provide: AudioContext, useValue: mockAudioContext },
        { provide: SampleLibraryService, useValue: {} },
        {
          provide: TransportService,
          useValue: { transportState$: mockTransportState$ },
        },
      ],
    });
    service = TestBed.inject(AudioService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('updates the delay time', () => {
    let mockDelayNode = mockAudioContext.nodes.find(
      (node) => node instanceof MockDelayNode
    ) as MockDelayNode;
    spyOn(mockDelayNode.delayTime, 'setValueAtTime').and.callThrough();

    mockTransportState$.next({ bpm: 120, status: TransportStatus.PLAYING });
    expect(mockDelayNode.delayTime.setValueAtTime).toHaveBeenCalledWith(0.25, 0);
  });
});
