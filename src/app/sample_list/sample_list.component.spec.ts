import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleListComponent } from './sample_list.component';
import { Sample, SampleLibraryService } from '../sample_library/sample_library.service';
import { AudioService } from '../audio.service';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('SampleListComponent', () => {
  let component: SampleListComponent;
  let fixture: ComponentFixture<SampleListComponent>;

  let mockPlaySampleFn: jasmine.Spy;
  let mockSamples$: Subject<Sample[]>;

  beforeEach(() => {
    mockSamples$ = new Subject<Sample[]>();
    mockPlaySampleFn = jasmine.createSpy();

    TestBed.configureTestingModule({
      providers: [
        { provide: SampleLibraryService, useValue: {
          samples$: mockSamples$,
        }},
        { provide: AudioService, useValue: {
          playSample: mockPlaySampleFn,
        }},
      ],
      imports: [SampleListComponent]
    });
    fixture = TestBed.createComponent(SampleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('lists samples', () => {
    mockSamples$.next([
      {name: 'public/test.wav', path: 'public/test.wav'},
      {name: 'public/test2.wav', path: 'public/test2.wav'}
    ]);
    fixture.detectChanges();
    const sampleList = Array.from(fixture.debugElement.queryAll(By.css('.sample')));
    expect(sampleList.length).toBe(2);
  });

  it('plays sample', () => {
    mockSamples$.next([
      {name: 'public/test.wav', path: 'public/test.wav'},
    ]);
    fixture.detectChanges();

    const playButton = fixture.debugElement.query(By.css('.sample button'));
    playButton.triggerEventHandler('click', null);

    expect(mockPlaySampleFn).toHaveBeenCalledWith('test');
  });
});
