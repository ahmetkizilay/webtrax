import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioContextService {
  context: AudioContext;
  constructor() { 
    this.context = new AudioContext();
  }
}
