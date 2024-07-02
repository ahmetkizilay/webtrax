import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackComponent } from './track.component';
import { AudioService } from '../audio.service';
import { TrackManager } from '../scene.service';
import { TransportService } from '../transport/transport.service';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('TrackComponent', () => {
  let component: TrackComponent;
  let fixture: ComponentFixture<TrackComponent>;

  let mockAudioService;
  let mockOnBeat;
  let mockTransportState;

  beforeEach(() => {
    mockAudioService = jasmine.createSpyObj('AudioService', [
      'registerTrack',
      'unregisterTrack',
    ]);
    mockOnBeat = new Subject();
    mockTransportState = new Subject();

    TestBed.configureTestingModule({
      providers: [
        {provide: AudioService, useValue: mockAudioService},
        {provide: TransportService, useValue: {
          onBeat: mockOnBeat,
          transportState$: mockTransportState,
        }},
      ],
      imports: [TrackComponent]
    });
    fixture = TestBed.createComponent(TrackComponent);
    component = fixture.componentInstance;
  });

  it('creates component', () => {
    component.track = TrackManager.createEmptyTrack('test', 'test.wav', 16);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('creates steps ui', () => {
    component.track = TrackManager.createEmptyTrack('test', 'test.wav', 4);
    fixture.detectChanges();
    expect(component.cells.length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('.track-step').length).toBe(4);
  });

  it('creates steps ui with active/passive rendering', () => {

    const track  = TrackManager.createTrackWithSteps('test', 'test.wav', [true, false, true, false]);

    component.track = track;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.track-step.engaged').length).toBe(2);
  });

  it('updates the track step on click', () => {
    const track  = TrackManager.createTrackWithSteps('test', 'test.wav', [true, false, true, false]);

    component.track = track;
    fixture.detectChanges();

    const step = fixture.debugElement.query(By.css('.track-step'));
    step.triggerEventHandler('click');
    fixture.detectChanges();

    expect(track.steps[0].active).toBe(false);
    expect(step.classes['engaged']).toBeFalsy();

    step.triggerEventHandler('click');
    fixture.detectChanges();

    expect(track.steps[0].active).toBe(true);
    expect(step.classes['engaged']).toBe(true);

  });

  it('should emit trackSelect event when track header is clicked', () => {
  component.track = TrackManager.createEmptyTrack('test-track', 'test.wav', 4);
  // Step 1: Spy on the event emitter
  spyOn(component.trackSelect, 'emit');

  // Assuming 'trackHeader' is the template reference variable for the track header element
  const trackHeader = fixture.debugElement.query(By.css('.track-header'));

  // Step 2: Simulate the click event on the track header
  trackHeader.triggerEventHandler('click', null);
  fixture.detectChanges();

  // Step 3: Assert that the trackSelect event was emitted
  expect(component.trackSelect.emit).toHaveBeenCalledOnceWith('test-track');
});
});
