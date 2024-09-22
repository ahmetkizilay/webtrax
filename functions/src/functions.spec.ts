import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
  Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
  collection,
  where,
  query,
  onSnapshot,
} from 'firebase/firestore';
import {
  FirebaseStorage,
  getStorage,
  connectStorageEmulator,
  uploadBytes,
  ref as storageRef,
} from 'firebase/storage';

const APP_CONFIG = {
  apiKey: 'AIzaSyDhpofRoptDDxq2W0HZDO8kaJAKpn6kUcs',
  projectId: 'webtrax-1fc7d',
  storageBucket: 'webtrax-1fc7d.appspot.com',
};

xdescribe('Firebase Functions', () => {
  let app: FirebaseApp;
  let functions;
  let auth: Auth;
  let firestore: Firestore;
  let storage: FirebaseStorage;

  beforeAll(() => {
    const appName = `test-app-${Date.now()}`;
    app = initializeApp(APP_CONFIG, appName);
  });

  beforeEach(() => {
    auth = getAuth(app);
    firestore = getFirestore(app);
    functions = getFunctions(app);
    storage = getStorage(app);

    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    });
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    connectStorageEmulator(storage, 'localhost', 9199);
  });

  describe('obObjectFinalized', () => {
    it('creates a sample doc when a new sample is uploaded', async () => {
      // sign-in as admin
      const userCredential = await signInWithEmailAndPassword(
        auth,
        'admin@test.com',
        'adminpass'
      );
      expect(userCredential.user).toBeTruthy();

      const audioData = new Uint8Array([1, 2, 3, 4, 5]);
      const blob = new Blob([audioData], { type: 'audio/wav' });

      // Upload a file to the storage bucket
      await uploadBytes(
        storageRef(storage, `samples/${userCredential.user.uid}/test.wav`),
        blob
      );

      // check if the samples doc was created
      const q = query(
        collection(firestore, 'samples'),
        where('owner', '==', userCredential.user.uid)
      );

      let numFoundDocs = 0;
      const unSub = onSnapshot(q, (snap) => {
        snap.docs.forEach((doc) => {
          expect(doc.data().path).toBe(
            `samples/${userCredential.user.uid}/test.wav`
          );
        });
        numFoundDocs += snap.docs.length;
      });

      // wait for a little bit for the snapshot to be updated
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (numFoundDocs > 0) {
            clearInterval(interval);
            resolve();
          }
        }, 500);
      });

      unSub();
      // expect one doc to be found
      expect(numFoundDocs).toBe(1);
    }, 20000);
  });
});
