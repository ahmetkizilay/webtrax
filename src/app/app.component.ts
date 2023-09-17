import { Component, OnInit, OnDestroy, inject} from '@angular/core';
import { Sample, SampleLibraryService, SampleLibraryStatus } from './sample-library.service';
import { filter, first } from 'rxjs';
import { AudioContextService } from './audio-context.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "My App"; // TODO - Remove this line.

  private audioContext: AudioContextService = inject(AudioContextService); 
  sampleLibraryService: SampleLibraryService = inject(SampleLibraryService);
  
  audioStateSubscription$ = this.audioContext.onAudioStateChange.subscribe(audioState => {
    this.isAudioEnabled = audioState == 'running'
  });

  tracks: Sample[] = [];

  isAudioEnabled: boolean = false;
  
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
    this.audioContext.resumeAudioContext();
  }

  addNewTrack(sampleName: string) {
    let sample = this.sampleLibraryService.getSample(sampleName);
    if (sample) {
      this.tracks.push(sample);
    } else {
      console.error(`No sample found for ${sampleName}`);
    }
  }

  private loadNewTemplate() {
    const initialTracks = ['kick', 'snare', 'closed_hat'];
    initialTracks.forEach(name => this.addNewTrack(name));
  }
}
