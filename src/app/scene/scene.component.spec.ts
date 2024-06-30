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

  // Used by Mocked TransportService
  let mockOnBeat;
  let mockTransportState;

  // Used by AudioService
  let mockAudioService;

  beforeEach(() => {
    mockStatusChange = new ReplaySubject<SampleLibraryStatus>();
    mockGetSampleFn = jasmine.createSpy();

    mockOnBeat = new Subject();
    mockTransportState = new Subject();

    mockAudioService = jasmine.createSpyObj('AudioService', [
      'registerTrack',
      'unregisterTrack',
    ]);

    TestBed.configureTestingModule({
      providers: [
        {provide: SampleLibraryService, useValue: {
          onStatusChange$: mockStatusChange,
          getSample: mockGetSampleFn,
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
    mockStatusChange.next(SampleLibraryStatus.INITIALIZED);
    fixture.detectChanges();

    expect(component.tracks.length).toBeGreaterThan(0);
    expect(fixture.debugElement.queryAll(By.css('app-track')).length).toBeGreaterThan(0);
  });
});
