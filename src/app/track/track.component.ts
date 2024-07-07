import { Component, Input, OnDestroy, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService  } from '../audio.service';
import { distinctUntilChanged, map } from 'rxjs';
import { TransportService, TransportStatus } from '../transport/transport.service';
import { Track } from '../scene/scene.service';

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
    <label class="track-name">{{track.name}}</label>
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
  cells: TrackCell[] = [];
  activeCell = -1;

  transportService: TransportService = inject(TransportService);
  audioService: AudioService = inject(AudioService);
  beatSubscription$ = this.transportService.onBeat.subscribe(this.selectNextCell.bind(this));
  transportStopped$ = this.transportService.transportState$.pipe(
    map(state => state.status === TransportStatus.STOPPED),
    distinctUntilChanged()
  ).subscribe(this.resetActiveStep.bind(this));

  @Input({ required: true }) track!: Track;
  @Output() trackSelect = new EventEmitter<string>();


  ngOnInit(): void {
    const stepLength = this.track.steps.length;
    this.cells = new Array(stepLength);
    for (let i = 0; i < stepLength; i++) {
      this.cells[i]  = {
        active: this.track.steps[i].active,
      };
    }
    this.audioService.registerTrack(this.track);
  }

  ngOnDestroy(): void {
    this.audioService.unregisterTrack(this.track.name);
    this.beatSubscription$.unsubscribe();
    this.transportStopped$.unsubscribe();
  }

  onStepClicked(e: Event, i: number) {
    this.cells[i].active = !this.cells[i].active;
    this.track.steps[i].active = this.cells[i].active;
  }

  onTrackSelected() {
    this.trackSelect.emit(this.track.name);
  }

  private selectNextCell(when: number) {
    this.activeCell = (this.activeCell + 1) % this.cells.length;
    if (this.cells[this.activeCell]?.active) {
      this.audioService.playSample(this.track.name, when);
    }
  }

  private resetActiveStep() {
    this.activeCell = -1;
  }
}
