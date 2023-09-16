import { Component, OnDestroy, inject} from '@angular/core';
import { AudioService } from './audio.service';
import { Sample, SampleLibraryService } from './sample-library.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  audioService: AudioService = inject(AudioService);
  sampleLibraryService: SampleLibraryService = inject(SampleLibraryService);
  
  audioStateSubscription$ = this.audioService.onAudioStateChange.subscribe(audioState => {
    this.isAudioEnabled = audioState == 'running'
  });
  sampleLibraryStateSubscription$ = this.sampleLibraryService.onStatusChange$.subscribe(state => {
    console.log(`The sample Library is ${state}`);
  });

  tracks: Sample[] = this.sampleLibraryService.getSampleList().slice(0, 4);

  isAudioEnabled: boolean = false;
  
  ngOnDestroy() {
    this.audioStateSubscription$.unsubscribe();
  }

  enableAudio() {
    this.audioService.resumeAudioContext();
  }
}
