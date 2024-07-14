
import { inject, Injectable } from '@angular/core';
import { Storage, getBytes, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageWrapper {
  public storage: Storage = inject(Storage);

  ref: Function = ref;
  getBytes: Function = getBytes;
  uploadBytes: Function = uploadBytes;
}
