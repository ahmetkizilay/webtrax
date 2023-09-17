import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Storage, getBytes, ref } from '@angular/fire/storage';
import { AudioContextService } from './audio-context.service';

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
  private audio: AudioContextService = inject(AudioContextService);
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  private bufferMap = new Map<string, AudioBuffer>();

  onStatusChange$ = new BehaviorSubject(SampleLibraryStatus.UNINITIALIZED);

  samples: Sample[] = [];

  constructor() {
    const sampleCollection = collection(this.firestore, 'samples');
    from(getDocs(sampleCollection)).pipe(
      map(docs => docs.docs.map(doc => doc.data() as Sample)),
      tap(samples => {
        // TODO - local caching?
        Promise.all(samples.map(sample => this.downloadSample(sample))).then(() => {
          console.log('downloaded all samples');
        });
      })
    ).subscribe(samples => {
      this.samples = samples;
      this.onStatusChange$.next(SampleLibraryStatus.INITIALIZED);
    });
  }

  getSample(name: string): Sample|undefined {
    return this.samples.find(sample => sample.name === name);
  }

  getSampleBuffer(name: string) : AudioBuffer|null {
    return this.bufferMap.get(name) ?? null;
  }

  async downloadSample(sample: Sample) {
    const pathReference = ref(this.storage, `samples/${sample.path}`);
    const arrayBuffer = await getBytes(pathReference);
    const audioBuffer = await this.audio.decodeAudioData(arrayBuffer);
    this.bufferMap.set(sample.name, audioBuffer);
    console.log(`downloaded ${sample.name}`);
  }
}
