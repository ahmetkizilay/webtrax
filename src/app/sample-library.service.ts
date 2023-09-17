import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AudioService } from './audio.service';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Storage, getBytes, ref } from '@angular/fire/storage';

export interface Sample {
  name: string,
  path: string,
};

@Injectable({
  providedIn: 'root',
})
export class SampleLibraryService {
  private audioService: AudioService = inject(AudioService);
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  private bufferMap = new Map<string, ArrayBuffer>();

  onStatusChange$ = new BehaviorSubject('uninitialized');

  samples$: Observable<Sample[]>;

  constructor() {
    this.audioService.onAudioStateChange.subscribe(audioState => {
      if (audioState !== 'running') {
        console.log('Waiting on AudioService to be ready');
        return;
      } else {
        console.log('SampleService can start now');
      }
    });

    const sampleCollection = collection(this.firestore, 'samples');
    this.samples$ = from(getDocs(sampleCollection)).pipe(
      map(docs => docs.docs.map(doc => doc.data() as Sample)),
      tap(samples => {
        Promise.all(samples.map(sample => this.downloadSample(sample))).then(() => {
          console.log('downloaded all samples');
        });
      })
    );
  }

  async downloadSample(sample: Sample) {
    const pathReference = ref(this.storage, `samples/${sample.path}`);
    const buffer = await getBytes(pathReference);
    this.bufferMap.set(sample.name, buffer);
    console.log(`downloaded ${sample.name}`);
  }
}
