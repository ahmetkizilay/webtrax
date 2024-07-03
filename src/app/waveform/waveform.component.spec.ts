import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveformComponent } from './waveform.component';
import { TrackManager } from '../scene.service';
import { SampleLibraryService } from '../sample-library.service';

describe('WaveformComponent', () => {
  let component: WaveformComponent;
  let fixture: ComponentFixture<WaveformComponent>;

  let mockGetSampleBufferFn: jasmine.Spy;

  beforeEach(() => {
    mockGetSampleBufferFn = jasmine.createSpy();

    TestBed.configureTestingModule({
      providers: [
        { provide: SampleLibraryService, useValue: {
          getSampleBuffer: mockGetSampleBufferFn,
        }},
      ],
      imports: [WaveformComponent]
    });
    fixture = TestBed.createComponent(WaveformComponent);
    component = fixture.componentInstance;
  });

  it('creates component', () => {
    mockGetSampleBufferFn.and.returnValue(
      new AudioBuffer({ length: 100, sampleRate: 44100 })
    );
    component.track = TrackManager.createEmptyTrack('test', 'test.wav', 4);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
