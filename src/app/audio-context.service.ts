import { Injectable } from '@angular/core';
import { Observable, fromEvent, map, tap } from 'rxjs';

export enum AudioContextState {
  UNKNOWN,
  SUSPENDED,
  RUNNING,
  CLOSED,
};

@Injectable({
  providedIn: 'root'
})
export class AudioContextService {
  private context: AudioContext;
  onAudioStateChange: Observable<string>;

  constructor() {
    this.context = new AudioContext();

    this.onAudioStateChange = fromEvent<Event>(this.context, 'statechange').pipe(
      tap(this.logStateChange.bind(this)),
      map(e => this.context.state)
    );
  }

  resumeAudioContext(): Promise<void> {
    return this.context.resume();
  }

  getState(): AudioContextState {
    switch (this.context.state) {
      case 'suspended':
        return AudioContextState.SUSPENDED;
      case 'running':
        return AudioContextState.RUNNING;
      case 'closed':
        return AudioContextState.CLOSED;
      default:
        return AudioContextState.UNKNOWN;
    }
  }

  getCurrentTime(): number {
    return this.context.currentTime;
  }

  getDestination() {
    return this.context.destination;
  }

  decodeAudioData(buffer: ArrayBuffer) : Promise<AudioBuffer> {
    return this.context.decodeAudioData(buffer);
  }

  createBufferSource() {
    return this.context.createBufferSource();
  }

  createGain() {
    return this.context.createGain();
  }

  private logStateChange() {
    switch (this.context.state) {
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

}
