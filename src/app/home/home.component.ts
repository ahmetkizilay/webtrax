import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sample, SampleLibraryService, SampleLibraryStatus } from '../sample-library.service';
import { BehaviorSubject, Subscription, filter, first, fromEvent } from 'rxjs';
import { SampleListComponent } from '../sample_list/sample_list.component';
import { TransportComponent } from '../transport/transport.component';
import { TrackComponent } from '../track/track.component';
import { TrackDetailComponent } from '../track_detail/track_detail.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TransportComponent,
    TrackComponent,
    TrackDetailComponent,
    SampleListComponent,
  ],
  template: `
<div class="main">
  <div class="left-bar">
    <button class="material-symbols-outlined toggle-btn" 
    (click)="toggleSampleLibrary()">{{isSampleLibraryVisible ? "chevron_right" : "expand_more"}}</button>
    <app-sample-list *ngIf="isSampleLibraryVisible"></app-sample-list>
  </div>
  <div style="width: 100%">
    <div>
      <app-transport></app-transport>
      <button *ngIf="false" (click)="addNewTrack('kick')">New Track</button>
      <app-track *ngFor="let track of tracks" [trackName]="track.name" (trackSelect)="onTrackSelected($event)"></app-track>
    </div>
    <div class="detail-container" *ngIf="selectedTrack">
      <app-track-detail trackName="{{selectedTrack}}"></app-track-detail>
    </div>
  </div>
</div>
<div class="modal-audio" *ngIf="!isAudioEnabled"
    (click)="enableAudio()">
  <p>Click anywhere to get started...</p>
</div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  title = "My App"; // TODO - Remove this line.

  private audioContext: AudioContext;
  sampleLibraryService: SampleLibraryService = inject(SampleLibraryService);

  audioStateSubscription$: Subscription; 

  tracks: Sample[] = [];

  isAudioEnabled = false;
  selectedTrack: string | null = null;

  isSampleLibraryVisible = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.isAudioEnabled = this.getAudioEnabled();
    this.audioStateSubscription$ = fromEvent(this.audioContext, 'statechange').subscribe(()=> {
      this.isAudioEnabled = this.getAudioEnabled();
    });
      
  }
  ngOnInit(): void {
    // One-time subscription to load the template at the beginning.
    this.sampleLibraryService.onStatusChange$.pipe(
      filter(state => state === SampleLibraryStatus.INITIALIZED),
      first()
    ).subscribe(() => {
      this.loadNewTemplate();
    });
  }

  ngOnDestroy() {
    this.audioStateSubscription$.unsubscribe();
  }

  enableAudio() {
    this.audioContext.resume();
  }

  addNewTrack(sampleName: string) {
    let sample = this.sampleLibraryService.getSample(sampleName);
    if (sample) {
      this.tracks.push(sample);
    } else {
      console.error(`No sample found for ${sampleName}`);
    }
  }

  onTrackSelected(selectedTrack: string) {
    this.selectedTrack = selectedTrack;
  }

  toggleSampleLibrary() {
    this.isSampleLibraryVisible = !this.isSampleLibraryVisible; 
  }

  private loadNewTemplate() {
    const initialTracks = [
      'kick', 'snare', 'tom', 'clap', 
      'cowbell', 'closed_hat', 'open_hat', 'cymbal'
    ];
    initialTracks.forEach(name => this.addNewTrack(name));
  }

  private getAudioEnabled(): boolean {
    return this.audioContext.state == 'running';
  }
}
