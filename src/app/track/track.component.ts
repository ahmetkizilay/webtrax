import { Component, Input, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../audio.service';

export interface TrackCell {
  active: boolean;
}

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="track">
  <label class="track-name">{{trackName}}</label>
  <div *ngFor="let cell of cells; let i = index" 
      class="track-step" 
      [class.engaged]="cell.active"
      [class.current]="i === activeCell"
      (click)="onStepClicked($event, i)"></div>
</div>
  `,
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnDestroy {
  readonly num_steps = 16;
  cells: TrackCell[] = [];
  activeCell = -1;

  audioService: AudioService = inject(AudioService);
  beatSubscription$ = this.audioService.onBeat.subscribe(this.selectNextCell.bind(this));

  @Input({required: true}) trackName!: string;

  constructor() {
    for (let i = 0; i < this.num_steps; i++) {
      this.cells.push({ active: false });
    }
  }

  ngOnDestroy(): void {
    this.beatSubscription$.unsubscribe();
  }

  onStepClicked(e: Event, i: number) {
    this.cells[i].active = !this.cells[i].active;
  }

  private selectNextCell(when: number) {
    this.activeCell = (this.activeCell + 1) % this.num_steps;
    if (this.cells[this.activeCell]?.active) {
      this.audioService.playSample(this.trackName, when);
    }
  }
}
