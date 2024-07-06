import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveformComponent } from './waveform.component';
import { TrackManager } from '../scene.service';
import { SampleLibraryService } from '../sample_library/sample_library.service';
import { Subject } from 'rxjs';
import { SimpleChange } from '@angular/core';

describe('WaveformComponent', () => {
  let component: WaveformComponent;
  let fixture: ComponentFixture<WaveformComponent>;

  let mockGetSampleBufferFn: jasmine.Spy;
  let mockRequestWaveformFn: jasmine.Spy;

  beforeEach(() => {
    mockGetSampleBufferFn = jasmine.createSpy();
    mockRequestWaveformFn = jasmine.createSpy().and.returnValue(new Subject());

    TestBed.configureTestingModule({
      providers: [
        { provide: SampleLibraryService, useValue: {
          getSampleBuffer: mockGetSampleBufferFn,
          requestWaveform: mockRequestWaveformFn,
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

  it('requests waveform on track changes', () => {
    mockGetSampleBufferFn.and.returnValue(
      new AudioBuffer({ length: 100, sampleRate: 44100 })
    );
    const track1 = TrackManager.createEmptyTrack('test', 'test.wav', 4);
    component.track = track1;
    fixture.detectChanges();
    expect(mockRequestWaveformFn).toHaveBeenCalledWith('test.wav', jasmine.any(Float32Array));
    mockRequestWaveformFn.calls.reset();

    const track2 = TrackManager.createEmptyTrack('test2', 'test2.wav', 4);
    component.track = track2;
    component.ngOnChanges({
      track: new SimpleChange(track1, track2, false),
    });
    fixture.detectChanges();
    expect(mockRequestWaveformFn).toHaveBeenCalledWith('test2.wav', jasmine.any(Float32Array));
  });

  it('renders waveform', () => {
    let mockContext = {
      clearRect: jasmine.createSpy(),
      fillRect: jasmine.createSpy(),
      beginPath: jasmine.createSpy(),
      moveTo: jasmine.createSpy(),
      lineTo: jasmine.createSpy(),
      stroke: jasmine.createSpy(),
    };
    mockGetSampleBufferFn.and.returnValue(
      new AudioBuffer({ length: 100, sampleRate: 44100 })
    );
    let waveformSubject = new Subject();
    mockRequestWaveformFn.and.returnValue(waveformSubject);

    component.track = TrackManager.createEmptyTrack('test', 'test.wav', 4);
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas.width).toEqual(360);
    expect(canvas.height).toEqual(136);

    spyOn(canvas, 'getContext').and.returnValue(mockContext);

    expect(mockRequestWaveformFn).toHaveBeenCalled();

    waveformSubject.next({ data: new Float32Array([0, 1, 0, -1]) });
    fixture.detectChanges();

    // TODO: better tests for renderings
    expect(mockContext.clearRect).toHaveBeenCalledTimes(1);
    expect(mockContext.fillRect).toHaveBeenCalledTimes(1);
    expect(mockContext.beginPath).toHaveBeenCalledTimes(4);
    expect(mockContext.moveTo).toHaveBeenCalledTimes(4);
    expect(mockContext.lineTo).toHaveBeenCalledTimes(4);
    expect(mockContext.stroke).toHaveBeenCalledTimes(4);
  });
});
