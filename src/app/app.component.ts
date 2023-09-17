import { Component, OnDestroy, inject} from '@angular/core';
import { AudioService } from './audio.service';
import { Sample, SampleLibraryService } from './sample-library.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  title = "My App"; // TODO - Remove this line.

  audioService: AudioService = inject(AudioService);
  sampleLibraryService: SampleLibraryService = inject(SampleLibraryService);
  
  audioStateSubscription$ = this.audioService.onAudioStateChange.subscribe(audioState => {
    this.isAudioEnabled = audioState == 'running'
  });
  sampleLibraryStateSubscription$ = this.sampleLibraryService.onStatusChange$.subscribe(state => {
    console.log(`The sample Library is ${state}`);
  });

  // Just limiting to 4 tracks.
  tracks$ = this.sampleLibraryService.samples$.pipe(map(samples => samples.slice(0, 4)));

  isAudioEnabled: boolean = false;
  
  ngOnDestroy() {
    this.audioStateSubscription$.unsubscribe();
  }

  enableAudio() {
    this.audioService.resumeAudioContext();
  }
}
