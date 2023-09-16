import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AudioService } from './audio.service';

export interface Sample {
  name: string,
  downloaded: boolean,
};

@Injectable({
  providedIn: 'root'
})
export class SampleLibraryService {
  audioService: AudioService = inject(AudioService);

  onStatusChange$ = new BehaviorSubject('uninitialized');
  
  private library: Sample[] = [{
    name: 'kick',
    downloaded: false,
  }, {
    name: 'snare',
    downloaded: false
  }, {
    name: 'closed_hihat',
    downloaded: false
  },
  {
    name: 'My very long sample from Splice',
    downloaded: false
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
  }

  getSampleList(): Sample[] {
    return this.library;
  }
}
