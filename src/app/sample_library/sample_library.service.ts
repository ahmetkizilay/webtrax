import { Inject, Injectable, inject } from '@angular/core';
import { BehaviorSubject, filter, first, Observable, Subject } from 'rxjs';
import { WAVEFORM_WORKER_TOKEN } from '../app.config';
import { AuthService } from '../login/auth.service';
import { FirebaseStorageWrapper } from '../firebase/storage';

export interface Sample {
  name: string;
  path: string;
}

export enum SampleLibraryStatus {
  UNKNOWN,
  UNINITIALIZED,
  INITIALIZED,
  BUSY,
}

export interface WaveformData {
  sampleId: string;
  data: Float32Array;
}

@Injectable({
  providedIn: 'root',
})
export class SampleLibraryService {
  private audio: AudioContext = inject(AudioContext);
  private auth: AuthService = inject(AuthService);
  private wrappedStorage: FirebaseStorageWrapper = inject(
    FirebaseStorageWrapper
  );

  // triggered from the waveform worker.
  private onWaveformReady$ = new Subject<WaveformData>();

  private bufferMap = new Map<string, AudioBuffer>();

  onStatusChange$ = new BehaviorSubject(SampleLibraryStatus.UNINITIALIZED);

  samples: Sample[] = [];
  samples$ = new BehaviorSubject<Sample[]>([]);
  userSamples$ = new BehaviorSubject<Sample[]>([]);

  constructor(@Inject(WAVEFORM_WORKER_TOKEN) public waveformWorker: Worker) {
    this.samples = [];
    this.onStatusChange$.next(SampleLibraryStatus.INITIALIZED);

    this.waveformWorker.onmessage = ({ data }) => {
      if (data.status === 'done') {
        let audioBuffer = this.bufferMap.get(data.sampleId)!;
        audioBuffer.copyToChannel(new Float32Array(data.audioBuffer), 0);

        this.onWaveformReady$.next({
          sampleId: data.sampleId,
          data: data.waveformBuffer,
        });
      }
    };
  }

  requestWaveform(
    sampleId: string,
    waveform: Float32Array
  ): Observable<WaveformData> {
    let audioBuffer = this.bufferMap.get(sampleId);
    // Set default blockSize to 10ms, which can be calculated by the sample rate of the audio buffer.
    const blockSize = 0.01 * audioBuffer!.sampleRate;
    this.waveformWorker.postMessage(
      {
        audioBuffer: audioBuffer?.getChannelData(0).buffer,
        waveformBuffer: waveform.buffer,
        blockSize,
        sampleId,
      },
      [waveform.buffer]
    );
    return this.onWaveformReady$.asObservable().pipe(
      filter((data) => data.sampleId === sampleId),
      first()
    );
  }

  getSample(name: string): Sample | undefined {
    return this.samples.find((sample) => sample.name === name);
  }

  getSampleBuffer(name: string): AudioBuffer | null {
    return this.bufferMap.get(name) ?? null;
  }

  async downloadSample(sample: Sample) {
    const pathReference = this.wrappedStorage.ref(
      this.wrappedStorage.storage,
      `samples/${sample.path}`
    );
    const arrayBuffer = await this.wrappedStorage.getBytes(pathReference);
    const audioBuffer = await this.audio.decodeAudioData(arrayBuffer);

    console.log(`downloaded ${sample.name}`);

    this.bufferMap.set(sample.name, audioBuffer);
    this.samples.push(sample);
    this.samples$.next(this.samples);
  }

  async uploadSample(file: File): Promise<boolean> {
    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      return false;
    }

    if (file.type !== 'audio/wav') {
      console.error('filetype must be audio/wav. Given filetype: ${file.type}');
      return false;
    }

    if (file.size > 5_000_000) {
      console.error('file is larger than 5MB');
      return false;
    }

    const sampleRefence = this.wrappedStorage.ref(
      this.wrappedStorage,
      `samples/${userId}/${Date.now()}.wav`
    );
    try {
      await this.wrappedStorage.uploadBytes(sampleRefence, file, {

      });
    } catch (error) {
      console.error('upload failed:', error);
      return false;
    }
    return true;
  }
}
