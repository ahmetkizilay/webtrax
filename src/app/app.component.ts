import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Sample, SampleLibraryService, SampleLibraryStatus } from './sample-library.service';
import { Observable, Subscription, filter, first, fromEvent } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "My App"; // TODO - Remove this line.

  private audioContext: AudioContext;
  sampleLibraryService: SampleLibraryService = inject(SampleLibraryService);

  audioStateSubscription$: Subscription; 

  tracks: Sample[] = [];

  isAudioEnabled: boolean = false;
  selectedTrack: string | null = null;

  isSampleLibraryVisible = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.audioStateSubscription$ = fromEvent(this.audioContext, 'statechange').subscribe(()=> {
      this.isAudioEnabled = this.audioContext.state == 'running';
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
}
