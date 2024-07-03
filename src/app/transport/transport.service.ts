import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  ReplaySubject,
  TimestampProvider,
  animationFrames,
  filter,
  takeWhile,
} from 'rxjs';

export enum TransportStatus {
  UNKNOWN,
  STOPPED,
  PLAYING,
  PAUSED,
}

export interface TransportState {
  bpm: number;
  status: TransportStatus;
}

// Scheduler-like timestamp provider based on animation frames and audio context.
@Injectable({
  providedIn: 'root',
})
export class ClockProvider {
  private audio = inject(AudioContext);
  private timestampProvider: TimestampProvider = {
    now: () => this.audio.currentTime,
  };

  tick$ = animationFrames(this.timestampProvider).pipe(
    filter(() => this.audio.state === 'running')
  );
}

/**
 * Service to manage the transport of the application.
 * This is based on the https://web.dev/articles/audio-scheduling/ article.
 */
@Injectable({
  providedIn: 'root',
})
export class TransportService {
  private clockProvider = inject(ClockProvider);

  private readonly lookAheadTime = 0.01;
  private nextBeatTime = 0;

  private transportStatus = TransportStatus.STOPPED;
  private bpm = 128;
  private divOfBeat = 4;

  onBeat: ReplaySubject<number> = new ReplaySubject(1);
  transportState$: BehaviorSubject<TransportState> = new BehaviorSubject({
    bpm: this.bpm,
    status: this.transportStatus,
  });

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

  private runScheduler() {
    this.clockProvider.tick$
      .pipe(takeWhile(() => this.isTransportRunning()))
      .subscribe(({ timestamp }) => {
        this.handleTick(timestamp);
      });
  }

  private handleTick(clockTime: number) {
    if (clockTime + this.lookAheadTime >= this.nextBeatTime) {
      this.onBeat.next(Math.max(0, this.nextBeatTime - clockTime));
      this.nextBeatTime =
        Math.max(this.nextBeatTime, clockTime) + this.timeToEvent();
    }
  }

  private isTransportRunning() {
    return this.transportStatus === TransportStatus.PLAYING;
  }

  private timeToEvent() {
    return 60 / (this.bpm * this.divOfBeat);
  }
}
