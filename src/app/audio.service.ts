import { Injectable, inject } from '@angular/core';
import { Observable, of, fromEvent, animationFrameScheduler, ReplaySubject, scheduled, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { SampleLibraryService } from './sample-library.service';
import { AudioContextService } from './audio-context.service';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio: AudioContextService = inject(AudioContextService);
  private sampleLibrary: SampleLibraryService = inject(SampleLibraryService);

  private readonly lookAheadTime = 0.01;
  private nextBeatTime = 0;
  private bpm = 60;

  public onAudioStateChange: Observable<string>;
  onBeat: ReplaySubject<number> = new ReplaySubject(1);

  constructor() {
    this.audio.context.addEventListener('statechange', this.onAudioContextStateChange.bind(this));

    this.onAudioStateChange = fromEvent<Event>(this.audio.context, 'statechange').pipe(
      map(e => this.audio.context.state)
    );

    animationFrameScheduler.schedule(function (fn: Function | undefined) {
      fn?.call(undefined);

      this.schedule(fn);
    }, 0, this.#tick.bind(this));
  }

  resumeAudioContext(): Promise<void> {
    return this.audio.context.resume();
  }

  onAudioContextStateChange() {
    switch (this.audio.context.state) {
      case 'suspended':
        console.log('Audio context is suspended');
        break;
      case 'running':
        console.log('AudioContext is running');
        break;
      case 'closed':
        console.log('AudioContext is closed');
        break;
      default:
        break;
    }
  }

  playSample(sampleName: string, when: number) {
    let source = this.audio.context.createBufferSource();
    source.buffer = this.sampleLibrary.getSampleBuffer(sampleName);
    source.connect(this.audio.context.destination);
    source.start(when);
    source.addEventListener('ended', () => {
      source.disconnect();
    }, {once: true});
  }

  #tick() {
    if (this.audio.context.state !== 'running') {
      return;
    }

    if (this.audio.context.currentTime + this.lookAheadTime >= this.nextBeatTime) {
      this.onBeat.next(Math.max(0, this.nextBeatTime - this.audio.context.currentTime));
      this.nextBeatTime = Math.max(this.nextBeatTime, this.audio.context.currentTime) + (60 / this.bpm);
    }
  }
}
