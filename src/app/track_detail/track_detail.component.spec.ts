import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackDetailComponent } from './track_detail.component';
import { TrackManager } from '../scene.service';
import { By } from '@angular/platform-browser';
import { SampleLibraryService } from '../sample_library/sample-library.service';
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

  it('labels track detail', () => {
    component.track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('.track-label'));
    expect(label.nativeElement.textContent).toEqual('my track');
  });

  it('renders sample name', () => {
    const track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);

    component.track = track;
    fixture.detectChanges();

    const sampleLabel = fixture.debugElement.query(
      By.css('.param-block .sample-name')
    );
    expect(sampleLabel.nativeElement.textContent).toEqual('test.wav');
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
