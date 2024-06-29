import { App, deleteApp, initializeApp} from 'firebase-admin/app';

import { Storage, getStorage } from 'firebase-admin/storage';

import { UploadParams, uploadFile } from './storage_upload';

process.env['FIREBASE_STORAGE_EMULATOR_HOST'] = 'localhost:9199';

const PROJECT_ID = 'webtrax-1fc7d';

describe('storage_upload', () => {
  let app: App
  let storage: Storage;

  beforeAll(() => {
    app = initializeApp({
      projectId: PROJECT_ID,
      storageBucket: `${PROJECT_ID}.appspot.com`,
    });

    storage = getStorage();
  });

  afterAll(async () => {
    await deleteApp(app);
  });

  beforeEach(async () => {
    await storage.bucket().deleteFiles();
  })

  it('uploads a doc', async () => {
    const params: UploadParams = {
      src: 'sample.txt',
      dest: 'sample.txt',
    };
    await uploadFile(storage, params, __dirname);

    const file = storage.bucket().file(params.dest);
    const response = await file.download();
    expect(response[0].toString().trim()).toEqual('Sample text');
  });
});
