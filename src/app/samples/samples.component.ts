import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SampleLibraryService, Sample } from '../sample_library/sample_library.service';

@Component({
  selector: 'app-samples',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
  template: `
<div class="form-wrapper">
  <form [formGroup]="uploadForm">
    <div class="input-row">
      <input id="file" type="file" class="upload"
        title="&nbsp;" value=""
        accept="audio/wav"
        formControlName="file"
        (change)="onFileChange($event)" multiple>
    </div>
  </form>
</div>
<div class="sample-list">
  <ul>
    <li *ngFor="let f of files">{{f.name}}</li>
  </ul>
</div>
  `,
  styleUrls: ['./samples.component.css']
})
export class SamplesComponent implements OnDestroy {
  private readonly sampleLibrary: SampleLibraryService = inject(SampleLibraryService);

  files: Sample[] = [];
  userSamplesSub = this.sampleLibrary.userSamples$.subscribe(samples => {
    this.files = samples;
  });

  uploadForm = new FormGroup({
    file: new FormControl(''),
  });

  ngOnDestroy(): void {
    this.userSamplesSub.unsubscribe();
  }

  onFileChange(e: Event) {
    const rawFiles = (e.target as HTMLInputElement).files;
    if (!rawFiles) {
      return;
    }
    const files = Array.from(rawFiles);
    // validate
    // file type
    for (let file of files) {
      if (file.type !== 'audio/wav') {
        console.log(`${file.name} is not a supported audio file.`);
        return;
      }
      if (file.size > 5_000_000) {
        console.log(`${file.name} is larger than 5MB.`);
        return;
      }
    }

    this.upload(files);
  }

  private async upload(files: File[]) {
    await Promise.all(files.map(file => {
      return this.sampleLibrary.uploadSample(file);
    }));
  }
}
