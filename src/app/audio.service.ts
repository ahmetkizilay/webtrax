import { Injectable } from '@angular/core';
import { Observable, of, fromEvent, animationFrameScheduler, ReplaySubject, scheduled, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private readonly lookAheadTime = 0.01;
  private nextBeatTime = 0;
  private bpm = 60;

  private audioContext: AudioContext;
  public onAudioStateChange: Observable<string>;
  onBeat: ReplaySubject<void> = new ReplaySubject(1);
  constructor() {
    this.audioContext = new AudioContext();
    this.audioContext.addEventListener('statechange', this.onAudioContextStateChange.bind(this));

    this.onAudioStateChange = fromEvent<Event>(this.audioContext, 'statechange').pipe(
      map(e => this.audioContext.state)
    );

    animationFrameScheduler.schedule(function (fn: Function | undefined) {
      fn?.call(undefined);

      this.schedule(fn);
    }, 0, this.#tick.bind(this));
  }

  resumeAudioContext(): Promise<void> {
    return this.audioContext.resume();
  }

  onAudioContextStateChange() {
    switch (this.audioContext.state) {
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

  #tick() {
    if (this.audioContext.state !== 'running') {
      return;
    }

    if (this.audioContext.currentTime + this.lookAheadTime >= this.nextBeatTime) {
      this.onBeat.next();
      this.nextBeatTime = Math.max(this.nextBeatTime, this.audioContext.currentTime) + (60 / this.bpm);
    }
  }
}
