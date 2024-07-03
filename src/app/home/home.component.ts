import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleListComponent } from '../sample_list/sample_list.component';
import { TransportComponent } from '../transport/transport.component';
import { SceneComponent } from '../scene/scene.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TransportComponent,
    SampleListComponent,
    SceneComponent
  ],
  template: `
    <div class="main">
      <div class="left-bar" [class.collapsed]="!isSampleLibraryVisible">
        <button
          class="material-symbols-outlined toggle-btn"
          (click)="toggleSampleLibrary()"
        >
          {{ isSampleLibraryVisible ? 'chevron_right' : 'expand_more' }}
        </button>
        <app-sample-list *ngIf="isSampleLibraryVisible"></app-sample-list>
      </div>
      <app-scene></app-scene>
    </div>
    <div class="modal-audio" *ngIf="!isAudioEnabled" (click)="enableAudio()">
      <p>Click anywhere to get started...</p>
    </div>
  `,
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnDestroy {

  private audioContext: AudioContext;

  isAudioEnabled = false;

  isSampleLibraryVisible = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;

    // Binding the function to the class instance, so we can remove it later.
    this.onAudioStateChange = this.onAudioStateChange.bind(this);

    this.audioContext.addEventListener('statechange', this.onAudioStateChange);
    this.isAudioEnabled = this.getAudioEnabled();
  }

  ngOnDestroy() {
    this.audioContext.removeEventListener('statechange', this.onAudioStateChange);
  }

  enableAudio() {
    this.audioContext.resume();
  }

  toggleSampleLibrary() {
    this.isSampleLibraryVisible = !this.isSampleLibraryVisible;
  }

  private getAudioEnabled(): boolean {
    return this.audioContext.state == 'running';
  }

  private onAudioStateChange() {
    this.isAudioEnabled = this.getAudioEnabled();
  }
}
