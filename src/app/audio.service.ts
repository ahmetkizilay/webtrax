import { Injectable, inject } from '@angular/core';
import { SampleLibraryService } from './sample-library.service';

export interface TrackParams {
  sampleId: string,
  gain: number,
  pan: number,
  delaySend: number,
};

class TrackSignalChain {
  private gain: GainNode;
  private pan: StereoPannerNode;
  private delaySend: GainNode;

  constructor(audio: AudioContext, mainOut: GainNode, delayOut: DelayNode) {
    this.gain = audio.createGain();
    this.pan = audio.createStereoPanner();
    this.gain.connect(this.pan);
    this.pan.connect(mainOut);

    this.delaySend = audio.createGain();
    this.delaySend.gain.setValueAtTime(0, 0);
    this.delaySend.connect(delayOut);
    this.pan.connect(this.delaySend);
  }

  head() {
    return this.gain;
  }

  updateParams(params: TrackParams, when: number) {
    this.gain.gain.setValueAtTime(params.gain, when);
    this.pan.pan.setValueAtTime(params.pan, when);
    this.delaySend.gain.setValueAtTime(params.delaySend, when);
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
  private audio: AudioContext;
  private sampleLibrary: SampleLibraryService = inject(SampleLibraryService);

  private bpm = 128;

  private tracks = new Map<string, TrackNode>();

  private delaySend: DelayNode;
  private mainOut: GainNode;

  constructor(audioContext: AudioContext) {
    this.audio = audioContext;
    this.mainOut = this.audio.createGain();
    this.mainOut.connect(this.audio.destination);

    this.delaySend = this.audio.createDelay();
    this.delaySend.delayTime.setValueAtTime(60 / (this.bpm * 2), 0);
    this.delaySend.connect(this.mainOut);
  }

  playSample(trackName: string, when = 0) {
    let track = this.tracks.get(trackName);
    if (!track) {
      console.error(`No track with name: ${'trackName'}`);
      return;
    }

    let trackNode = track.out;
    trackNode.updateParams(track.params, when);

    let source = this.audio.createBufferSource();
    source.buffer = this.sampleLibrary.getSampleBuffer(track.params.sampleId);
    source.connect(trackNode.head());
    source.start(when);
    source.addEventListener('ended', () => {
      source.disconnect();
    }, { once: true });
  }

  registerTrack(name: string) {
    console.log(`registered track: ${name}`);

    let trackNode = {
      name: name,
      out: new TrackSignalChain(this.audio, this.mainOut, this.delaySend),
      params: {
        sampleId: name,
        gain: 1.0,
        pan: 0,
        delaySend: 0,
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

}
