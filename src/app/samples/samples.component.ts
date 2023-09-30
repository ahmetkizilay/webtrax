import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Storage, ref, uploadBytes } from '@angular/fire/storage';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';

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
  <form [formGroup]="uploadForm" (submit)="upload()">
    <div class="input-row">
      <label for="file">File</label>
      <input id="file" type="file" formControlName="file" (change)="onFileChange($event)" multiple>
    </div>
    <button type="submit" class="primary">Upload</button>
  </form>
</div>
  `,
  styleUrls: ['./samples.component.css']
})
export class SamplesComponent {
  private readonly storage: Storage = inject(Storage);
  private readonly firestore: Firestore = inject(Firestore);
  private readonly auth: AuthService = inject(AuthService);

  private files: File[] = [];

  uploadForm = new FormGroup({
    file: new FormControl(''),
  });

  onFileChange(e: Event) {
    const newFiles = (e.target as HTMLInputElement).files;
    if (!newFiles) {
      return;
    }
    for(let i = 0; i < newFiles.length; i+= 1) {
      this.files.push(newFiles.item(0)!);
    }
  }

  upload() {
    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      // This should never be the case, because this component is auth-guarded.
      console.error("Cannot upload: No Active User");
      return;
    }

    const samplesCollection = collection(this.firestore, 'samples');

    const samplesBucket = `gs://${environment.firebase.storageBucket}`;
    let uploads = [];
    const now = Date.now();
    for (let i = 0; i < this.files.length; i += 1) {
      const file = this.files[i];
      const bucketPath = `samples/${userId}/${now}_${i}/${file.name}`;
      const storageRef = ref(this.storage, `${samplesBucket}/${bucketPath}`);
      uploads.push(Promise.all([
        // Cloud Storage
        uploadBytes(storageRef, file),
        // Firestore
        addDoc(samplesCollection, <FirestoreSample> {
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
