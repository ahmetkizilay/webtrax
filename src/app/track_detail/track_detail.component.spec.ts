import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackDetailComponent } from './track_detail.component';
import { TrackManager } from '../scene/scene.service';
import { By } from '@angular/platform-browser';
import { SampleLibraryService } from '../sample_library/sample_library.service';
import { Subject } from 'rxjs';

describe('TrackDetailComponent', () => {
  let component: TrackDetailComponent;
  let fixture: ComponentFixture<TrackDetailComponent>;

  let mockGetSampleBufferFn: jasmine.Spy;
  let mockRequestWaveformFn: jasmine.Spy;

  beforeEach(() => {
    mockGetSampleBufferFn = jasmine.createSpy();
    mockGetSampleBufferFn.and.returnValue(
      new AudioBuffer({ length: 100, sampleRate: 44100 })
    );
    mockRequestWaveformFn = jasmine.createSpy().and.returnValue(new Subject());

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SampleLibraryService,
          useValue: {
            getSampleBuffer: mockGetSampleBufferFn,
            requestWaveform: mockRequestWaveformFn,
          },
        },
      ],
      imports: [TrackDetailComponent],
    });
    fixture = TestBed.createComponent(TrackDetailComponent);
    component = fixture.componentInstance;
  });

  it('creates component', () => {
    component.track = TrackManager.createEmptyTrack('test', 'test.wav', 4);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('adds track detail labels', () => {
    component.track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);
    fixture.detectChanges();

    const sampleId = fixture.debugElement.query(By.css('.id'));
    expect(sampleId.nativeElement.textContent).toEqual('test.wav');

    const sampleDuration = fixture.debugElement.query(By.css('.duration'));
    // 100 samples at 44100 Hz is
    expect(sampleDuration.nativeElement.textContent).toEqual('2 ms');

    const sampleRate = fixture.debugElement.query(By.css('.sample-rate'));
    expect(sampleRate.nativeElement.textContent).toEqual('44100');

    const numChannels = fixture.debugElement.query(By.css('.num-channels'));
    expect(numChannels.nativeElement.textContent).toEqual('1');
  });

  it('formats track durations for longer than 1 second', () => {
    // 66150 samples at 44100 Hz is 1.5 seconds
    mockGetSampleBufferFn.and.returnValue(
      new AudioBuffer({ length: 66150, sampleRate: 44100 })
    );
    component.track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);
    fixture.detectChanges();

     const sampleDuration = fixture.debugElement.query(By.css('.duration'));
    expect(sampleDuration.nativeElement.textContent).toEqual('1.50 s');
  });

  it('handles gain change', () => {
    const track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);

    component.track = track;
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css('.param-block input[data-param=gain]')
    );
    input.triggerEventHandler('input', { target: { valueAsNumber: 50 } });

    fixture.detectChanges();
    expect(component.trackParams.gain).toEqual(0.5);
    expect(track.params.gain).toEqual(0.5);
  });

  it('handles pan change', () => {
    const track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);
    component.track = track;
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css('.param-block input[data-param=pan]')
    );
    input.triggerEventHandler('input', { target: { valueAsNumber: 50 } });

    fixture.detectChanges();
    expect(component.trackParams.pan).toBe(0);
    expect(track.params.pan).toBe(0);

    input.triggerEventHandler('input', { target: { valueAsNumber: 0 } });
    fixture.detectChanges();
    expect(component.trackParams.pan).toEqual(-1);
    expect(track.params.pan).toEqual(-1);

    input.triggerEventHandler('input', { target: { valueAsNumber: 100 } });
    fixture.detectChanges();
    expect(component.trackParams.pan).toEqual(1);
    expect(track.params.pan).toEqual(1);
  });

  it('handles delay send change', () => {
    const track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);
    component.track = track;
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css('.param-block input[data-param=delaySend]')
    );
    input.triggerEventHandler('input', { target: { valueAsNumber: 50 } });

    fixture.detectChanges();
    expect(component.trackParams.delaySend).toEqual(0.5);
  });
});
