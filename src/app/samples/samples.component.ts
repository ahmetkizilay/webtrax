import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Storage, ref, uploadBytes } from '@angular/fire/storage';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';
import { SampleLibraryService, Sample } from '../sample-library.service';
import { Subscription } from 'rxjs';

interface FirestoreSample {
  name: string,
  path: string,
  owner: string,
};

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
  private readonly storage: Storage = inject(Storage);
  private readonly firestore: Firestore = inject(Firestore);
  private readonly auth: AuthService = inject(AuthService);
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

  private upload(files: File[]) {
    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      // This should never be the case, because this component is auth-guarded.
      console.error("Cannot upload: No Active User");
      return;
    }

    const samplesCollection = collection(this.firestore, 'samples');

    const samplesBucket = `gs://${environment.firebase.config.storageBucket}`;
    let uploads = [];
    const now = Date.now();
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const bucketPath = `samples/${userId}/${now}_${i}/${file.name}`;
      const storageRef = ref(this.storage, `${samplesBucket}/${bucketPath}`);
      uploads.push(Promise.all([
        // Cloud Storage
        uploadBytes(storageRef, file),
        // Firestore
        addDoc(samplesCollection, <FirestoreSample>{
          name: file.name,
          path: bucketPath,
          owner: userId,
        }),
      ]));
    }
    Promise.all(uploads).then(() => {
      console.log('Finished the uploads');
    }).catch(e => {
      console.log(e);
    }).finally(() => {
      // clear the state
    });
  }
}
