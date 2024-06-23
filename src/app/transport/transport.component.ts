import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportService, TransportStatus } from './transport.service';
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
  private transportService: TransportService = inject(TransportService);
  bpm$ = this.transportService.transportState$.pipe(
    map(state => state.bpm),
    distinctUntilChanged()
  );
  isPlaying$ = this.transportService.transportState$.pipe(
    map(state => state.status === TransportStatus.PLAYING),
    distinctUntilChanged()
  );
  isStopped$ = this.transportService.transportState$.pipe(
    map(state => state.status === TransportStatus.STOPPED),
    distinctUntilChanged()
  );

  onClickPlay() {
    this.transportService.start();
  }

  onClickStop() {
    this.transportService.stop();
  }

  onBpmChange(e: Event) {
    const el = e.target as HTMLInputElement;
    this.transportService.setBpm(el.valueAsNumber);
  }
}
