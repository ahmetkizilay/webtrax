import { TestBed } from '@angular/core/testing';

import { Sample, SampleLibraryService } from './sample_library.service';
import { WAVEFORM_WORKER_TOKEN } from '../app.config';
import { AuthService } from '../login/auth.service';
import { FirebaseStorageWrapper } from '../firebase/storage';

class MockWorker {
  onmessage?: Function;
  postMessage = jasmine.createSpy();
}

class MockStorage {
  ref = jasmine.createSpy();
  getBytes = jasmine.createSpy();
  uploadBytes = jasmine.createSpy();
}

class MockAuth {
  getCurrentUserId = jasmine.createSpy();
}

describe('SampleLibraryService', () => {
  // 4 samples long stereo 44100Hz 16-bit PCM WAV file.
  const wavBytes = new Uint8Array([
    // RIFF header
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x2C, 0x00, 0x00, 0x00, // ChunkSize: 44 bytes header + 16 bytes data = 60 bytes total - 8 bytes = 52 bytes
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    // fmt subchunk
    0x66, 0x6D, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // Subchunk1Size: 16 for PCM
    0x01, 0x00,             // AudioFormat: 1 (PCM)
    0x02, 0x00,             // NumChannels: 2 (stereo)
    0x44, 0xAC, 0x00, 0x00, // SampleRate: 44100
    0x10, 0xB1, 0x02, 0x00, // ByteRate: SampleRate * NumChannels * BitsPerSample/8 = 44100 * 2 * 16/8 = 176400
    0x04, 0x00,             // BlockAlign: NumChannels * BitsPerSample/8 = 2 * 16/8 = 4
    0x10, 0x00,             // BitsPerSample: 16
    // data subchunk
    0x64, 0x61, 0x74, 0x61, // "data"
    0x10, 0x00, 0x00, 0x00, // Subchunk2Size: NumSamples * NumChannels * BitsPerSample/8 = 4 * 2 * 16/8 = 16
    // Audio data (4 stereo samples, 16-bit each, values are arbitrary)
    0x00, 0x00, // Sample 1, Channel 1
    0x00, 0x00, // Sample 1, Channel 2
    0x7F, 0xFF, // Sample 2, Channel 1 (max positive value for 16-bit audio)
    0x7F, 0xFF, // Sample 2, Channel 2
    0x80, 0x00, // Sample 3, Channel 1 (min negative value for 16-bit audio)
    0x80, 0x00, // Sample 3, Channel 2
    0x00, 0x00, // Sample 4, Channel 1
    0x00, 0x00  // Sample 4, Channel 2
  ]);

  let mockWorker: MockWorker;
  let mockStorage: MockStorage;
  let mockAuth: MockAuth;

  beforeEach(() => {
    mockWorker = new MockWorker();
    mockStorage = new MockStorage();
    mockAuth = new MockAuth();
    TestBed.configureTestingModule({
      providers: [
        { provide: AudioContext, useValue: new AudioContext() },
        { provide: WAVEFORM_WORKER_TOKEN, useValue: mockWorker },
        { provide: FirebaseStorageWrapper, useValue: mockStorage },
        { provide: AuthService, useValue: mockAuth },
      ],
    });

    mockStorage.ref.and.returnValue({});
    mockStorage.getBytes.and.returnValue(
      wavBytes.buffer.slice(0, wavBytes.byteLength)
    );
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
    expect(buffer instanceof AudioBuffer).toBeTrue();
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

    service
      .requestWaveform('public/test.wav', new Float32Array(4))
      .subscribe(mockResponse);

    expect(mockWorker.postMessage).toHaveBeenCalled();

    expect(service.waveformWorker.onmessage).toBeDefined();
    service.waveformWorker.onmessage!({
      data: {
        status: 'done',
        sampleId: 'public/test.wav',
        audioBuffer: new Float32Array(4),
        waveformBuffer: new Float32Array(4),
      },
    } as any);

    expect(mockResponse).toHaveBeenCalled();
  });

  it('rejects upload if current user is not authenticated', async () => {
    mockAuth.getCurrentUserId.and.returnValue(null);

    const service = TestBed.inject(SampleLibraryService);

    const audioData = new Uint8Array([1, 2, 3, 4, 5]);
    const blob = new Blob([audioData], { type: 'audio/wav' });
    const file = new File([blob], 'test.wav', {type: 'audio/wav'});
    const res = await service.uploadSample(file);

    expect(res).toBeFalse();
  });

  it('uploads sample', async () => {
    mockAuth.getCurrentUserId.and.returnValue('user');
    mockStorage.ref.and.returnValue({});
    mockStorage.uploadBytes.and.returnValue(Promise.resolve());

    const service = TestBed.inject(SampleLibraryService);

    const audioData = new Uint8Array([1, 2, 3, 4, 5]);
    const blob = new Blob([audioData], { type: 'audio/wav' });
    const file = new File([blob], 'test.wav', {type: 'audio/wav'});

    const res = await service.uploadSample(file);

    expect(res).toBeTrue();
  });

  it('rejects upload if file is not audio/wav', async () => {
    mockAuth.getCurrentUserId.and.returnValue('user');
    mockStorage.ref.and.returnValue({});
    mockStorage.uploadBytes.and.returnValue(Promise.resolve());

    const service = TestBed.inject(SampleLibraryService);

    const audioData = new Uint8Array([1, 2, 3, 4, 5]);
    const blob = new Blob([audioData], { type: 'audio/wav' });
    const file = new File([blob], 'test.wav', {type: 'text/plain'});

    const res = await service.uploadSample(file);

    expect(res).toBeFalse();
  });

  it ('rejects upload if file size is larger than 5MB', async () => {
    mockAuth.getCurrentUserId.and.returnValue('user');
    mockStorage.ref.and.returnValue({});
    mockStorage.uploadBytes.and.returnValue(Promise.resolve());

    const service = TestBed.inject(SampleLibraryService);

    const audioData = new Uint8Array(5_000_001);
    const blob = new Blob([audioData], { type: 'audio/wav' });
    const file = new File([blob], 'test.wav', {type: 'audio/wav'});

    const res = await service.uploadSample(file);

    expect(res).toBeFalse();
  });

  it ('allows upload if file size is not larger than 5MB', async () => {
    mockAuth.getCurrentUserId.and.returnValue('user');
    mockStorage.ref.and.returnValue({});
    mockStorage.uploadBytes.and.returnValue(Promise.resolve());

    const service = TestBed.inject(SampleLibraryService);

    const audioData = new Uint8Array(5_000_000);
    const blob = new Blob([audioData], { type: 'audio/wav' });
    const file = new File([blob], 'test.wav', {type: 'audio/wav'});

    const res = await service.uploadSample(file);

    expect(res).toBeTrue();
  });
});
