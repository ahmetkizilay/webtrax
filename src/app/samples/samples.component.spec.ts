import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SamplesComponent } from './samples.component';
import { Sample, SampleLibraryService } from '../sample_library/sample_library.service';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('SamplesComponent', () => {
  let component: SamplesComponent;
  let fixture: ComponentFixture<SamplesComponent>;

  let mockUserSamples$: Subject<Sample[]>;
  let mockUploadSampleFn: jasmine.Spy;

  beforeEach(() => {
    mockUserSamples$ = new Subject<Sample[]>();
    mockUploadSampleFn = jasmine.createSpy();

    TestBed.configureTestingModule({
      providers: [
        { provide: SampleLibraryService, useValue: {
          userSamples$: mockUserSamples$,
          uploadSample: mockUploadSampleFn,
        }},
      ],
      imports: [SamplesComponent]
    });
    fixture = TestBed.createComponent(SamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('uploads sample', () => {
    const audioData = new Uint8Array([1, 2, 3, 4, 5]);
    const blob = new Blob([audioData], { type: 'audio/wav' });
    const file = new File([blob], 'test.wav', {type: 'audio/wav'});

    const inputEl = fixture.debugElement.query(By.css('input[type="file"]'));
    inputEl.triggerEventHandler('change', { target: { files: [file] } });

    expect(mockUploadSampleFn).toHaveBeenCalledWith(file);
  });
});
