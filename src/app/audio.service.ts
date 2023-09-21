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

export interface TrackParams {
  gain: number,
  pan: number,
};

class TrackSignalChain {
  private gain: GainNode;
  private pan: StereoPannerNode;

  constructor(audio: AudioContextService) {
    this.gain = audio.createGain();
    this.pan = audio.createStereoPanner();
    this.gain.connect(this.pan);
    this.pan.connect(audio.getDestination());
  }

  head() {
    return this.gain;
  }

  updateParams(params: TrackParams, when: number) {
    this.gain.gain.setValueAtTime(params.gain, when);
    this.pan.pan.setValueAtTime(params.pan, when);
  }
};

interface TrackNode {
  name: string,
  out: TrackSignalChain, 
  params: TrackParams,
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

  private tracks = new Map<string, TrackNode>();

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
    let track = this.tracks.get(sampleName);
    if (!track) {
      console.error(`No track with name: ${'sampleName'}`);
      return;
    }

    let trackNode = track.out;
    trackNode.updateParams(track.params, when);

    let source = this.audio.createBufferSource();
    source.buffer = this.sampleLibrary.getSampleBuffer(sampleName);
    source.connect(trackNode.head());
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

  registerTrack(name: string) {
    console.log(`registered track: ${name}`);
    
    let trackNode = {
      name: name,
      out: new TrackSignalChain(this.audio),
      params: {
        gain: 1.0,
        pan: 0,
      },
    };
    this.tracks.set(name, trackNode);
  }

  unregisterTrack(name: string) {
    console.log(`unregistered track: ${name}`);
    this.tracks.delete(name);
  }

  getTrackParams(name: string) {
    let trackNode = this.tracks.get(name);
    if (!trackNode) {
      console.error(`${name} is not a known track`);
      return;
    }

    return trackNode.params;
  }

  setTrackParams(name: string, params: TrackParams) {
    let trackNode = this.tracks.get(name);
    if (!trackNode) {
      console.error(`${name} is not a known track`);
      return;
    }

    trackNode.params = params;
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
