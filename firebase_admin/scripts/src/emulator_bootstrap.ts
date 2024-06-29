// Bootstraps the Firebase project with users, Firestore data, and Storage files.
// Primarily used for testing purposes.
//
// The format of the input file is as follows:
// Each line is a separate command.
// auth: {"email": "", "password": "", "admin": true/false}
// firestore: {"collection": "", "data": {}}
// storage: {"src": "", "dest": ""}
import * as fs from 'fs/promises';

import { initializeApp } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore  } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

import { CreateUserParams, createUser } from './create_user';
import { CreateDocumentParams, createDocument } from './firestore_create_doc';
import { UploadParams, uploadFile } from './storage_upload';

enum ProcessType {
  AUTH,
  FIRESTORE,
  STORAGE
};

interface FirebaseAppWrapper {
  auth: Auth;
  firestore: FirebaseFirestore.Firestore;
  storage: Storage,
};

function initialize(projectId: string): FirebaseAppWrapper {
  initializeApp({
    projectId,
    storageBucket: `${projectId}.appspot.com`,
  });

  const auth = getAuth();
  const firestore = getFirestore();
  const storage = getStorage();

  return {
    auth,
    firestore,
    storage,
  };
}


async function* processFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      if (line.trim() === '') {
        continue;
      }

      if (line.startsWith('auth: ')) {
        yield { type: ProcessType.AUTH, data: line.substring(6)}
      } else if (line.startsWith('firestore: ')) {
        yield { type: ProcessType.FIRESTORE, data: line.substring(11)}
      } else if (line.startsWith('storage: ')) {
        yield { type: ProcessType.STORAGE, data: line.substring(9)}
      } else {
        throw new Error(`Invalid line: ${line}`);
      }
    }
  } catch (error) {
    console.error('Error reading the file:', error);
  }
}

process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';
process.env['FIREBASE_STORAGE_EMULATOR_HOST'] = 'localhost:9199';

const PROJECT_ID = 'webtrax-1fc7d';
const SAMPLES_DIR = '../../data/samples';
const INPUT_FILE = '../../data/bootstrap.txt';

// Bootstrap the Firebase project with users, Firestore data, and Storage files.
(async () => {
  const { auth, firestore, storage } = initialize(PROJECT_ID);

  for await (const item of processFile(INPUT_FILE)) {
    switch (item.type) {
      case ProcessType.AUTH:
        const userParams = JSON.parse(item.data) as CreateUserParams;
        const userId = await createUser(auth, userParams);
        console.log('User ID:', userId);
        break;
      case ProcessType.FIRESTORE:
        const firestoreParams = JSON.parse(item.data) as CreateDocumentParams;
        await createDocument(firestore, firestoreParams);
        break;
      case ProcessType.STORAGE:
        const storageParams = JSON.parse(item.data) as UploadParams;
        await uploadFile(storage, storageParams, SAMPLES_DIR);
        break;
    }
  }
})();
