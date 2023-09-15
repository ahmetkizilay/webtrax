import { Component, OnDestroy, inject} from '@angular/core';
import { AudioService } from './audio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  audioService: AudioService = inject(AudioService);
  audioStateSubscription$ = this.audioService.onAudioStateChange.subscribe(audioState => {
    this.isAudioEnabled = audioState == 'running'
  });

  isAudioEnabled: boolean = false;
  title = 'MyApp';
  
  ngOnDestroy() {
    this.audioStateSubscription$.unsubscribe();
  }

  enableAudio() {
    this.audioService.resumeAudioContext();
  }
}
