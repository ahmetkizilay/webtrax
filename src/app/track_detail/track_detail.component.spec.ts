import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackDetailComponent } from './track_detail.component';
import { AudioService } from '../audio.service';
import { TrackManager } from '../scene.service';
import { By } from '@angular/platform-browser';

describe('TrackDetailComponent', () => {
  let component: TrackDetailComponent;
  let fixture: ComponentFixture<TrackDetailComponent>;

  let mockGetTrackParams: jasmine.Spy;
  let mockSetTrackParams: jasmine.Spy;

  beforeEach(() => {
    mockGetTrackParams = jasmine.createSpy();
    mockSetTrackParams = jasmine.createSpy();

    TestBed.configureTestingModule({
      providers: [{
        provide: AudioService, useValue: {
          getTrackParams: mockGetTrackParams,
          setTrackParams: mockSetTrackParams,
        }
      }],
      imports: [TrackDetailComponent]
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

  it ('renders sample name', () => {
    const track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);
    mockGetTrackParams.and.returnValue(track.params);

    component.track = track;
    fixture.detectChanges();

    const sampleLabel = fixture.debugElement.query(By.css('.param-block .sample-name'));
    expect(sampleLabel.nativeElement.textContent).toEqual('test.wav');
  });

  it ('handles gain change', () => {
    const track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);
    mockGetTrackParams.and.returnValue(track.params);

    component.track = track;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('.param-block input[data-param=gain]'));
    input.triggerEventHandler('input', { target: { valueAsNumber: 50 } });

    fixture.detectChanges();
    expect(component.trackParams.gain).toEqual(0.5);
    expect(mockSetTrackParams).toHaveBeenCalledWith('my track', component.trackParams);
  });

  it ('handles pan change', () => {
    const track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);
    mockGetTrackParams.and.returnValue(track.params);
    component.track = track;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('.param-block input[data-param=pan]'));
    input.triggerEventHandler('input', { target: { valueAsNumber: 50 } });

    fixture.detectChanges();
    expect(component.trackParams.pan).toBe(0);
    expect(mockSetTrackParams).toHaveBeenCalledWith('my track', component.trackParams);

    mockSetTrackParams.calls.reset();
    input.triggerEventHandler('input', { target: { valueAsNumber: 0 } });
    fixture.detectChanges();
    expect(component.trackParams.pan).toEqual(-1);
    expect(mockSetTrackParams).toHaveBeenCalledWith('my track', component.trackParams);

    mockSetTrackParams.calls.reset();
    input.triggerEventHandler('input', { target: { valueAsNumber: 100 } });
    fixture.detectChanges();
    expect(component.trackParams.pan).toEqual(1);
    expect(mockSetTrackParams).toHaveBeenCalledWith('my track', component.trackParams);
  });

  it('handles delay send change', () => {
    const track = TrackManager.createEmptyTrack('my track', 'test.wav', 4);
    mockGetTrackParams.and.returnValue(track.params);
    component.track = track;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('.param-block input[data-param=delaySend]'));
    input.triggerEventHandler('input', { target: { valueAsNumber: 50 } });

    fixture.detectChanges();
    expect(component.trackParams.delaySend).toEqual(0.5);
    expect(mockSetTrackParams).toHaveBeenCalledWith('my track', component.trackParams);
  });
});
