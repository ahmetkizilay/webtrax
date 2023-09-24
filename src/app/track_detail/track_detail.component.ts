import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, TrackParams } from '../audio.service';

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="track-detail">
  <div (drop)="handleDrop($event)"
      (dragenter)="cancelEvent($event)" (dragover)="cancelEvent($event)">
    <label>Track Detail: </label>
    <label>{{trackName}}</label>
  </div>
  <div class="param-block">
    <label class="param-name">Gain:</label>
    <input type="range" min="0" max="100"
      (input)="onGainChange($event)" 
      value="{{trackParams.gain * 100}}"/>
  </div>
  <div class="param-block">
    <label class="param-name">Pan:</label>
    <input type="range" min="0" max="100"
      (input)="onPanChange($event)" 
      value="{{(trackParams.pan * 50) + 50}}"/>
  </div>
  <div class="param-block">
    <label class="param-name">Delay Send:</label>
    <input type="range" min="0" max="100"
      (input)="onDelaySendChange($event)" 
      value="{{trackParams.delaySend * 100}}"/>
  </div>
</div>
  `,
  styleUrls: ['./track_detail.component.css']
})
export class TrackDetailComponent implements OnChanges {
  private audio: AudioService = inject(AudioService);

  @Input({ required: true }) trackName!: string;
  trackParams = {} as TrackParams;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trackName']) {
      let params = this.audio.getTrackParams(this.trackName);
      if (params) {
        this.trackParams = params;
      }
    }
  }

  onGainChange(e: Event) {
    const el = e.target as HTMLInputElement;
    this.trackParams.gain = el.valueAsNumber / 100;
    this.audio.setTrackParams(this.trackName, this.trackParams);
  }

  onDelaySendChange(e: Event) {
    const el = e.target as HTMLInputElement;
    this.trackParams.delaySend = el.valueAsNumber / 100;
    this.audio.setTrackParams(this.trackName, this.trackParams);
  }

  onPanChange(e: Event) {
    const el = e.target as HTMLInputElement;
    this.trackParams.pan = (el.valueAsNumber - 50.) / 50.;
    console.log(this.trackParams.pan);
    this.audio.setTrackParams(this.trackName, this.trackParams);
  }

  handleDrop(ev: Event) {
    ev.stopPropagation();

    let e = ev as DragEvent;
    const data = e.dataTransfer?.getData("sample");
    if (data) {
      this.trackParams.sampleId = data;
      this.audio.setTrackParams(this.trackName, this.trackParams);
    }
    
    return false;
  }

  cancelEvent(e: Event) {
    e.preventDefault();
  }
}
