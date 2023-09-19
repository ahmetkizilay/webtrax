import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, TrackParams } from '../audio.service';

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="track-detail">
  <div>
    <label>Track Detail: </label>
    <label>{{trackName}}</label>
  </div>
  <div class="param-block">
    <label class="param-name">Gain:</label>
    <input type="range" min="0" max="100"
      (input)="onGainChange($event)" 
      value="{{trackParams.gain * 100}}"/>
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
}
