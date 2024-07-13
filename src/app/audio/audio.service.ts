import { Injectable, inject } from '@angular/core';
import { SampleLibraryService } from '../sample_library/sample_library.service';
import { Track, SampleTrackParams } from '../scene/scene.service';
import { TransportService } from '../transport/transport.service';

export type TrackParams = SampleTrackParams;

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
  private audio: AudioContext = inject(AudioContext);
  private sampleLibrary: SampleLibraryService = inject(SampleLibraryService);
  private transport: TransportService = inject(TransportService);

  private bpm = 128;
  private delayTime = 60 / (this.bpm * 2);

  private tracks = new Map<string, TrackNode>();

  private delaySend: DelayNode;
  private mainOut: GainNode;

  constructor() {
    this.mainOut = this.audio.createGain();
    this.mainOut.connect(this.audio.destination);

    this.delaySend = this.audio.createDelay();
    this.delaySend.delayTime.setValueAtTime(this.delayTime, 0);
    this.delaySend.connect(this.mainOut);

    this.transport.transportState$.subscribe((state) => {
      this.bpm = state.bpm;
      this.delayTime = 60 / (this.bpm * 2);
      this.delaySend.delayTime.setValueAtTime(this.delayTime, 0);
    });
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

  registerTrack(track: Track) {
    console.log(`registered track: ${track.name}`);

    let trackNode = {
      name: track.name,
      out: new TrackSignalChain(this.audio, this.mainOut, this.delaySend),
      params: track.params,
    };
    this.tracks.set(track.name, trackNode);
  }

  unregisterTrack(name: string) {
    console.log(`unregistered track: ${name}`);
    this.tracks.delete(name);
  }

}
