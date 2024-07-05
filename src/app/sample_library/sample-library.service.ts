import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage, getBytes, ref } from '@angular/fire/storage';

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

@Injectable({
  providedIn: 'root',
})
export class SampleLibraryService {
  private audio: AudioContext;
  private storage: Storage = inject(Storage);

  private bufferMap = new Map<string, AudioBuffer>();

  onStatusChange$ = new BehaviorSubject(SampleLibraryStatus.UNINITIALIZED);

  samples: Sample[] = [];
  samples$ = new BehaviorSubject<Sample[]>([]);
  userSamples$ = new BehaviorSubject<Sample[]>([]);

  constructor(audioContext: AudioContext) {

    this.audio = audioContext;
    this.samples = [];
    this.onStatusChange$.next(SampleLibraryStatus.INITIALIZED);
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
