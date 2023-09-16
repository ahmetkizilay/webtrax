import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AudioService } from './audio.service';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

export interface Sample {
  name: string,
};

@Injectable({
  providedIn: 'root',
})
export class SampleLibraryService {
  audioService: AudioService = inject(AudioService);
  firestore: Firestore = inject(Firestore);

  onStatusChange$ = new BehaviorSubject('uninitialized');

  samples$: Observable<Sample[]>;
  private library: Sample[] = [{
    name: 'kick',
  }, {
    name: 'snare',
  }, {
    name: 'closed_hihat',
  }, {
    name: 'My very long sample from Splice',
  }];

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
      map(docs => docs.docs.map(doc => doc.data() as Sample)));
  }
}
