import { Inject, Injectable, inject } from '@angular/core';
import { BehaviorSubject, filter, first, Observable, Subject } from 'rxjs';
import { Storage, getBytes, ref } from '@angular/fire/storage';
import { WAVEFORM_WORKER_TOKEN } from '../app.config';

export interface Sample {
  name: string,
  path: string,
};

export enum SampleLibraryStatus {
  UNKNOWN,
  UNINITIALIZED,
  INITIALIZED,
  BUSY,
};

export interface WaveformData {
  sampleId: string,
  data: Float32Array,
}

@Injectable({
  providedIn: 'root',
})
export class SampleLibraryService {
  private audio: AudioContext = inject(AudioContext);
  private storage: Storage = inject(Storage);
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

  requestWaveform(sampleId: string, waveform: Float32Array): Observable<WaveformData> {
    let audioBuffer = this.bufferMap.get(sampleId);
    // Set default blockSize to 10ms, which can be calculated by the sample rate of the audio buffer.
    const blockSize = 0.01 * audioBuffer!.sampleRate;
    this.waveformWorker.postMessage({
      audioBuffer: audioBuffer?.getChannelData(0).buffer,
      waveformBuffer: waveform.buffer,
      blockSize,
      sampleId
    }, [waveform.buffer]);
    return this.onWaveformReady$.asObservable().pipe(filter(data => data.sampleId === sampleId), first());
  }

  getSample(name: string): Sample | undefined {
    return this.samples.find(sample => sample.name === name);
  }

  getSampleBuffer(name: string): AudioBuffer | null {
    return this.bufferMap.get(name) ?? null;
  }

  async downloadSample(sample: Sample) {
    const pathReference = ref(this.storage, `samples/${sample.path}`);
    const arrayBuffer = await getBytes(pathReference);
    const audioBuffer = await this.audio.decodeAudioData(arrayBuffer);

    console.log(`downloaded ${sample.name}`);

    this.bufferMap.set(sample.name, audioBuffer);
    this.samples.push(sample);
    this.samples$.next(this.samples);
  }
}
