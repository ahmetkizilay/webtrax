import { TestBed } from '@angular/core/testing';

import { Sample, SampleLibraryService } from './sample-library.service';
import { FirebaseApp, getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { Storage, connectStorageEmulator, getStorage, provideStorage, ref, uploadBytes } from '@angular/fire/storage';
import { WAVEFORM_WORKER_TOKEN } from '../app.config';

class MockWorker {
  onmessage?: Function;
  postMessage = jasmine.createSpy();
}
describe('SampleLibraryService', () => {
  const projectId = 'webtrax-1fc7d';
  let appName: string;
  let app: FirebaseApp;
  let storage: Storage;

  let mockWorker: MockWorker;

  beforeEach(() => {
    appName = `sampleLibrary-${Date.now()}`;
    mockWorker = new MockWorker();
    TestBed.configureTestingModule({
      providers: [
        provideFirebaseApp(() => initializeApp({
          projectId,
          storageBucket: `${projectId}.appspot.com`,
        }, appName)),
        provideStorage(() => {
          let storage = getStorage(getApp(appName));
          connectStorageEmulator(storage, 'localhost', 9199);
          return storage;
        }),
        { provide: AudioContext, useValue: new AudioContext()},
        { provide: WAVEFORM_WORKER_TOKEN, useValue: mockWorker},
      ],
    });
    app = TestBed.inject(FirebaseApp);
    storage = TestBed.inject(Storage);
  });

  it('creates SampleLibrary Service instance', () => {
    const service = TestBed.inject(SampleLibraryService);
    expect(service).toBeTruthy();
  });

  it('downloads sample', async () => {
    const service = TestBed.inject(SampleLibraryService);
    // This sample is imported into the Firebase emulator.
    const sample: Sample = {
      name: 'public/test.wav',
      path: 'public/test.wav',
    };
    await service.downloadSample(sample);
    expect(service.samples.length).toBe(1);

    const receivedSample = service.getSample(sample.name)!;
    expect(receivedSample.name).toEqual(sample.name);
    expect(receivedSample.path).toEqual(sample.path);

    const buffer = service.getSampleBuffer(sample.name)!;
    // TODO: Figure out why sampleRate value is not reliable.
    // expect(buffer.sampleRate).toBe(44100);
    expect(buffer.numberOfChannels).toBe(2);
    expect(buffer.duration).toBeCloseTo(0.6, 0.1);
  });

  it('requests waveform data from the worker', async () => {
    const service = TestBed.inject(SampleLibraryService);

    // This sample is imported into the Firebase emulator.
    const sample: Sample = {
      name: 'public/test.wav',
      path: 'public/test.wav',
    };
    await service.downloadSample(sample);

    let mockResponse = jasmine.createSpy();

    service.requestWaveform('public/test.wav', new Float32Array(4)).subscribe(mockResponse);

    expect(mockWorker.postMessage).toHaveBeenCalled();

    expect(service.waveformWorker.onmessage).toBeDefined();
    service.waveformWorker.onmessage!({data: {
      status: 'done',
      sampleId: 'public/test.wav',
      audioBuffer: new Float32Array(4),
      waveformBuffer: new Float32Array(4),
    }} as any);

    expect(mockResponse).toHaveBeenCalled();
  });
});
