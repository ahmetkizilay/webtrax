import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneComponent } from './scene.component';
import { SampleLibraryService, SampleLibraryStatus } from '../sample-library.service';
import { ReplaySubject, Subject } from 'rxjs';
import { TransportService } from '../transport/transport.service';
import { AudioService } from '../audio.service';
import { By } from '@angular/platform-browser';

describe('SceneComponent', () => {
  let component: SceneComponent;
  let fixture: ComponentFixture<SceneComponent>;

  // Used by SampleLibraryService
  let mockStatusChange: ReplaySubject<SampleLibraryStatus>;
  let mockGetSampleFn: jasmine.Spy;
  let mockDownloadSampleFn: jasmine.Spy;

  // Used by Mocked TransportService
  let mockOnBeat;
  let mockTransportState;

  // Used by AudioService
  let mockAudioService;

  beforeEach(() => {
    mockStatusChange = new ReplaySubject<SampleLibraryStatus>();
    mockGetSampleFn = jasmine.createSpy();
    mockDownloadSampleFn = jasmine.createSpy();

    mockOnBeat = new Subject();
    mockTransportState = new Subject();

    mockAudioService = jasmine.createSpyObj('AudioService', [
      'registerTrack',
      'unregisterTrack',
      'getTrackParams',
    ]);

    TestBed.configureTestingModule({
      providers: [
        {provide: SampleLibraryService, useValue: {
          onStatusChange$: mockStatusChange,
          getSample: mockGetSampleFn,
          downloadSample: mockDownloadSampleFn,
        }},
        {provide: TransportService, useValue: {
          onBeat: mockOnBeat,
          transportState$: mockTransportState,
        }},
        {provide: AudioService, useValue: mockAudioService},
      ],
      imports: [SceneComponent]
    });
    fixture = TestBed.createComponent(SceneComponent);
    component = fixture.componentInstance;
  });

  it('creates component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('loads default template', () => {
    mockGetSampleFn.and.returnValue(true);
    mockDownloadSampleFn.and.returnValue(Promise.resolve(true));
    mockStatusChange.next(SampleLibraryStatus.INITIALIZED);
    fixture.detectChanges();

    expect(component.tracks.length).toBeGreaterThan(0);
    expect(fixture.debugElement.queryAll(By.css('app-track')).length).toBe(6);
    expect(mockDownloadSampleFn).toHaveBeenCalledTimes(6);
  });

  it('should create app-track-detail when a track is selected', async () => {
    // Load the default template
    mockGetSampleFn.and.returnValue(true);
    mockDownloadSampleFn.and.returnValue(Promise.resolve(true));
    mockStatusChange.next(SampleLibraryStatus.INITIALIZED);
    fixture.detectChanges();

    // Step 1: Trigger the selection of a track
    // Assuming there's at least one track to select and using the first one for this test
    const firstTrack = component.tracks[0];
    component.onTrackSelected(firstTrack.name);
    fixture.detectChanges();

    // Step 2: Check for the creation of app-track-detail
    const trackDetail = fixture.debugElement.query(By.css('app-track-detail'));
    expect(trackDetail).not.toBeNull();
    expect(trackDetail.componentInstance.track).toEqual(firstTrack);

    // Select another track
    const secondTrack = component.tracks[1];
    component.onTrackSelected(secondTrack.name);
    fixture.detectChanges();

    // Check if the track detail is updated
    expect(trackDetail.componentInstance.track).toEqual(secondTrack);
  });
});
