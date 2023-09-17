import { Injectable, inject } from '@angular/core';
import { animationFrameScheduler, ReplaySubject } from 'rxjs';
import { SampleLibraryService } from './sample-library.service';
import { AudioContextService, AudioContextState } from './audio-context.service';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio: AudioContextService = inject(AudioContextService);
  private sampleLibrary: SampleLibraryService = inject(SampleLibraryService);

  private readonly lookAheadTime = 0.01;
  private nextBeatTime = 0;
  private bpm = 60;

  onBeat: ReplaySubject<number> = new ReplaySubject(1);

  constructor() {
    // Manages the event scheduler to keep the beat.
    animationFrameScheduler.schedule(function (fn: Function | undefined) {
      fn?.call(undefined);

      this.schedule(fn);
    }, 0, this.#tick.bind(this));
  }

  playSample(sampleName: string, when: number) {
    let source = this.audio.createBufferSource();
    source.buffer = this.sampleLibrary.getSampleBuffer(sampleName);
    source.connect(this.audio.getDestination());
    source.start(when);
    source.addEventListener('ended', () => {
      source.disconnect();
    }, { once: true });
  }

  #tick() {
    if (this.audio.getState() !== AudioContextState.RUNNING) {
      return;
    }

    if (this.audio.getCurrentTime() + this.lookAheadTime >= this.nextBeatTime) {
      this.onBeat.next(Math.max(0, this.nextBeatTime - this.audio.getCurrentTime()));
      this.nextBeatTime = Math.max(this.nextBeatTime, this.audio.getCurrentTime()) + (60 / this.bpm);
    }
  }
}
