import { Injectable, inject } from '@angular/core';
import { animationFrameScheduler, BehaviorSubject, ReplaySubject } from 'rxjs';
import { SampleLibraryService } from './sample-library.service';
import { AudioContextService, AudioContextState } from './audio-context.service';

export enum TransportStatus {
  UNKNOWN,
  STOPPED,
  PLAYING,
  PAUSED
};

interface SchedulerPayload {
  checkStatus: () => boolean;
  tick: () => void;
};

export interface TransportState {
  bpm: number,
  status: TransportStatus,
};

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio: AudioContextService = inject(AudioContextService);
  private sampleLibrary: SampleLibraryService = inject(SampleLibraryService);

  private readonly lookAheadTime = 0.01;
  private nextBeatTime = 0;
  private bpm = 128;

  private transportStatus = TransportStatus.STOPPED;

  onBeat: ReplaySubject<number> = new ReplaySubject(1);
  transportState$: BehaviorSubject<TransportState> = new BehaviorSubject({
    bpm: this.bpm,
    status: this.transportStatus,
  });
  
  private runScheduler() {
    animationFrameScheduler.schedule(function (payload: SchedulerPayload | undefined) {
      if (!payload?.checkStatus.call(undefined)) {
        return;
      }

      payload?.tick.call(undefined);
      this.schedule(payload);
    }, 0, {
      checkStatus: this.#isTransportRunning.bind(this),
      tick: this.#tick.bind(this),
    });
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

  start() {
    if (this.transportStatus === TransportStatus.PLAYING) {
      return;
    }

    this.transportStatus = TransportStatus.PLAYING;
    this.transportState$.next({
      bpm: this.bpm,
      status: this.transportStatus,
    });
    this.runScheduler();
  }

  stop() {
    this.transportStatus = TransportStatus.STOPPED;
    this.transportState$.next({
      bpm: this.bpm,
      status: this.transportStatus,
    });
  }

  setBpm(val: number) {
    this.bpm = val;
    this.transportState$.next({
      bpm: this.bpm,
      status: this.transportStatus,
    });
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

  #isTransportRunning() {
    return this.transportStatus === TransportStatus.PLAYING;
  }
}
