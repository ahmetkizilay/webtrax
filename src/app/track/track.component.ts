import { Component, Input, OnDestroy, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService  } from '../audio.service';
import { distinctUntilChanged, map } from 'rxjs';
import { TransportService, TransportStatus } from '../transport/transport.service';

export interface TrackCell {
  active: boolean;
}

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="track">
  <div class="track-header" (click)="onTrackSelected()">
    <label class="track-name">{{trackName}}</label>
  </div>
  <div *ngFor="let cell of cells; let i = index"
      class="track-step"
      [class.engaged]="cell.active"
      [class.current]="i === activeCell"
      [class.separated]="i % 4 == 3"
      (click)="onStepClicked($event, i)"></div>
</div>
  `,
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit, OnDestroy {
  readonly num_steps = 16;
  cells: TrackCell[] = [];
  activeCell = -1;

  transportService: TransportService = inject(TransportService);
  audioService: AudioService = inject(AudioService);
  beatSubscription$ = this.transportService.onBeat.subscribe(this.selectNextCell.bind(this));
  transportStopped$ = this.transportService.transportState$.pipe(
    map(state => state.status === TransportStatus.STOPPED),
    distinctUntilChanged()
  ).subscribe(this.resetActiveStep.bind(this));

  @Input({ required: true }) trackName!: string;
  @Output() trackSelect = new EventEmitter<string>();

  constructor() {
    for (let i = 0; i < this.num_steps; i++) {
      this.cells.push({ active: false });
    }
  }

  ngOnInit(): void {
    this.audioService.registerTrack(this.trackName);
  }

  ngOnDestroy(): void {
    this.audioService.unregisterTrack(this.trackName);
    this.beatSubscription$.unsubscribe();
    this.transportStopped$.unsubscribe();
  }

  onStepClicked(e: Event, i: number) {
    this.cells[i].active = !this.cells[i].active;
  }

  onTrackSelected() {
    this.trackSelect.emit(this.trackName);
  }

  private selectNextCell(when: number) {
    this.activeCell = (this.activeCell + 1) % this.num_steps;
    if (this.cells[this.activeCell]?.active) {
      this.audioService.playSample(this.trackName, when);
    }
  }

  private resetActiveStep() {
    this.activeCell = -1;
  }
}
