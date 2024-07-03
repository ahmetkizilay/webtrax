import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track, SampleTrackParams } from '../scene.service';
import { WaveformComponent } from '../waveform/waveform.component';

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [WaveformComponent, CommonModule],
  template: `
<div class="track-detail">
  <div class="device-block">
    <app-waveform [track]="track"></app-waveform>
  </div>
  <div class="device-block">
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
        value="{{trackParams.gain! * 100}}"/>
    </div>
    <div class="param-block">
      <label class="param-name">Pan:</label>
      <input data-param="pan" type="range" min="0" max="100"
        (input)="onPanChange($event)"
        value="{{(trackParams.pan! * 50) + 50}}"/>
    </div>
    <div class="param-block">
      <label class="param-name">Delay Send:</label>
      <input data-param="delaySend"  type="range" min="0" max="100"
        (input)="onDelaySendChange($event)"
        value="{{trackParams.delaySend! * 100}}"/>
    </div>
  </div>
</div>
  `,
  styleUrls: ['./track_detail.component.css']
})
export class TrackDetailComponent implements OnInit, OnChanges {

  @Input({ required: true }) track!: Track;
  trackParams = {} as SampleTrackParams;

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
  }

  onDelaySendChange(e: Event) {
    const el = e.target as HTMLInputElement;
    this.trackParams.delaySend = el.valueAsNumber / 100;
  }

  onPanChange(e: Event) {
    const el = e.target as HTMLInputElement;
    this.trackParams.pan = (el.valueAsNumber - 50.) / 50.;
  }

  handleDrop(ev: Event) {
    ev.stopPropagation();

    let e = ev as DragEvent;
    const data = e.dataTransfer?.getData("sample");
    if (data) {
      this.trackParams.sampleId = data;
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

    this.trackParams = this.track.params;
    // Ensure that the values are valid.
    this.trackParams.gain = Number.isNaN(this.trackParams.gain) ? 1.0 : this.trackParams.gain;
    this.trackParams.pan = Number.isNaN(this.trackParams.pan) ? 0.0 : this.trackParams.pan;
    this.trackParams.delaySend = Number.isNaN(this.trackParams.delaySend) ? 0.0 : this.trackParams.delaySend;
  }
}
