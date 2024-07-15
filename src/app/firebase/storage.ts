
import { inject, Injectable } from '@angular/core';
import { Storage, getBytes, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageWrapper {
  public storage: Storage = inject(Storage);
  public ref = ref;
  public getBytes = getBytes;
  public uploadBytes = uploadBytes;
}
