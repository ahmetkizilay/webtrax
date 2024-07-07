import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleLibraryService } from '../sample_library/sample_library.service';
import { map } from 'rxjs';
import { AudioService } from '../audio/audio.service';

@Component({
  selector: 'app-sample-list',
  standalone: true,
  imports: [CommonModule],
  template: `
<div>
<label>SAMPLES</label>
<ul class="samples">
  <li *ngFor="let sample of samples$ | async" class="sample">
    <div draggable="true"
      (dragstart)="handleDragStart($event, sample.name)"
      (dragenter)="cancelEvent($event)" (dragover)="cancelEvent($event)">
      <label>{{sample.name}}</label>
      <button class="material-symbols-outlined play"
        title="Play sample"
        (click)="playSample(sample.name)">play_arrow</button>
    </div>
  </li>
</ul>
</div>
  `,
  styleUrls: ['./sample_list.component.css']
})
export class SampleListComponent {
  private sampleLibrary: SampleLibraryService = inject(SampleLibraryService);
  private audioService: AudioService = inject(AudioService);

  samples$ = this.sampleLibrary.samples$.pipe(map(samples => {
    return samples.map(sample => {
      return {
        name: sample.name,
      };
    });
  }));

  playSample(sample: string) {
    // Temporarily exclude 'public/' from the beginning of the sample name.
    const strippedSampleName = sample.replace('public/', '').replace('.wav', '');
    this.audioService.playSample(strippedSampleName);
  }

  handleDragStart(ev:Event, name: string) {
    let e = ev as DragEvent;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('sample', name);
    }
  }

  cancelEvent(e: Event) {
    e.preventDefault();
  }
}
