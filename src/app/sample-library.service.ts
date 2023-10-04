import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { distinctUntilChanged, filter, first, map, sample, switchMap, tap } from 'rxjs/operators';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Storage, getBytes, ref } from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { collectionData } from 'rxfire/firestore';

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
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  private auth: AuthService = inject(AuthService);

  private bufferMap = new Map<string, AudioBuffer>();

  onStatusChange$ = new BehaviorSubject(SampleLibraryStatus.UNINITIALIZED);

  samples: Sample[] = [];
  samples$ = new BehaviorSubject<Sample[]>([]);
  userSamples$ = this.auth.isSignedIn$.pipe(
    filter(val => val),
    distinctUntilChanged(),
    switchMap(() => {
      const sampleCollection = collection(this.firestore, 'samples');
      return collectionData(query(sampleCollection, where('owner', '==', this.auth.getCurrentUserId()!)));
    }), map(docs => docs.map(doc => doc as Sample)));;

  constructor(audioContext: AudioContext) {
    this.audio = audioContext;
    const sampleCollection = collection(this.firestore, 'samples');
    from(getDocs(query(sampleCollection, where("owner", "==", null)))).pipe(
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
      this.samples$.next(samples);
    });
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
    this.bufferMap.set(sample.name, audioBuffer);
    console.log(`downloaded ${sample.name}`);
  }
}
