import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, TransportStatus } from '../audio.service';
import { distinctUntilChanged, map, tap } from 'rxjs';

@Component({
  selector: 'app-transport',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="transport">
  <label>BPM: </label>
  <input type="number" value="{{bpm$ | async}}" (change)="onBpmChange($event)" min="1" max="360"/>
  <button (click)="onClickPlay()" [disabled]="isPlaying$ | async">Play</button>
  <button (click)="onClickStop()" [disabled]="isStopped$ | async">Stop</button>
</div>
  `,
  styleUrls: ['./transport.component.css']
})
export class TransportComponent {
  private audio: AudioService = inject(AudioService);
  bpm$ = this.audio.transportState$.pipe(
    map(state => state.bpm),
    distinctUntilChanged()
  );
  isPlaying$ = this.audio.transportState$.pipe(
    map(state => state.status === TransportStatus.PLAYING),
    distinctUntilChanged()
  );
  isStopped$ = this.audio.transportState$.pipe(
    map(state => state.status === TransportStatus.STOPPED),
    distinctUntilChanged()
  );

  onClickPlay() {
    this.audio.start();
  }

  onClickStop() {
    this.audio.stop();
  }

  onBpmChange(e: Event) {
    const el = e.target as HTMLInputElement;
    this.audio.setBpm(el.valueAsNumber);
  }
}
