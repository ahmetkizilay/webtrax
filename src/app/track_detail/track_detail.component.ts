import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, TrackParams } from '../audio.service';
import { Track } from '../scene.service';

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="track-detail">
  <div>
    <label>Track Detail: </label>
    <label class="track-label">{{track.name}}</label>
  </div>
  <div class="param-block" (drop)="handleDrop($event)"
      (dragenter)="cancelEvent($event)" (dragover)="cancelEvent($event)">
    <label class="param-name">Sample: </label>
    <label class="sample-name">{{trackParams.sampleId}}</label>
  </div>
  <div class="param-block">
    <label class="param-name">Gain:</label>
    <input data-param="gain" type="range" min="0" max="100"
      (input)="onGainChange($event)"
      value="{{trackParams.gain * 100}}"/>
  </div>
  <div class="param-block">
    <label class="param-name">Pan:</label>
    <input data-param="pan" type="range" min="0" max="100"
      (input)="onPanChange($event)"
      value="{{(trackParams.pan * 50) + 50}}"/>
  </div>
  <div class="param-block">
    <label class="param-name">Delay Send:</label>
    <input data-param="delaySend"  type="range" min="0" max="100"
      (input)="onDelaySendChange($event)"
      value="{{trackParams.delaySend * 100}}"/>
  </div>
</div>
  `,
  styleUrls: ['./track_detail.component.css']
})
export class TrackDetailComponent implements OnInit, OnChanges {
  private audio: AudioService = inject(AudioService);

  @Input({ required: true }) track!: Track;
  trackParams = {} as TrackParams;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['track']) {
      this.updateTrackParams();
    }
  }

  ngOnInit() {
    this.updateTrackParams();
  }

  onGainChange(e: Event) {
    const el = e.target as HTMLInputElement;
    this.trackParams.gain = el.valueAsNumber / 100;
    this.audio.setTrackParams(this.track.name, this.trackParams);
  }

  onDelaySendChange(e: Event) {
    const el = e.target as HTMLInputElement;
    this.trackParams.delaySend = el.valueAsNumber / 100;
    this.audio.setTrackParams(this.track.name, this.trackParams);
  }

  onPanChange(e: Event) {
    const el = e.target as HTMLInputElement;
    this.trackParams.pan = (el.valueAsNumber - 50.) / 50.;
    this.audio.setTrackParams(this.track.name, this.trackParams);
  }

  handleDrop(ev: Event) {
    ev.stopPropagation();

    let e = ev as DragEvent;
    const data = e.dataTransfer?.getData("sample");
    if (data) {
      this.trackParams.sampleId = data;
      this.audio.setTrackParams(this.track.name, this.trackParams);
    }

    return false;
  }

  cancelEvent(e: Event) {
    e.preventDefault();
  }

  private updateTrackParams() {
    if (!this.track) {
      return;
    }
    let params = this.audio.getTrackParams(this.track.name);
    if (params) {
      this.trackParams = params;

      // Ensure that the values are valid.
      if (isNaN(this.trackParams.gain)) {
        this.trackParams.gain = 1.0;
      }
      if (isNaN(this.trackParams.pan)) {
        this.trackParams.pan = 0.0;
      }
      if (isNaN(this.trackParams.delaySend)) {
        this.trackParams.delaySend = 0.0;
      }
    }
  }
}
