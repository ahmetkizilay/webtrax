import { readFileSync } from 'fs';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {ref, getBytes, uploadBytes } from 'firebase/storage'


async function expectPermissionDenied(operation: Promise<any>) {
  const err = await assertFails(operation);
  expect(err.code).toBe('storage/unauthorized');
}

async function createFile(filePath: string) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const samplesRef = ref(context.storage(), filePath);
    await uploadBytes(samplesRef, new Uint8Array([0, 1, 2]), {
      contentType: 'audio/wav'
    });
  });
}
let testEnv: RulesTestEnvironment;

describe('Firestore rules', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'my-test-project',
      storage: {
        rules: readFileSync('./firebase_admin/cloud_storage/storage.rules', 'utf8'),
        host: 'localhost',
        port: 9199,
      }
    });
  });

  beforeEach(async() => {
    await testEnv.clearStorage();
  })

  describe('public samples collection', () => {
    it('allows unauthenticated reads', async () => {
      const samplePath = 'samples/public/sample1.wav';
      await createFile(samplePath);

      let unauthed = testEnv.unauthenticatedContext().storage();
      let obj = ref(unauthed, samplePath);
      await assertSucceeds(getBytes(obj));
    });

    it('rejects unauthenticated writes', async () => {
      const samplePath = 'samples/public/sample1.wav';
      let unauthed = testEnv.unauthenticatedContext().storage();
      let obj = ref(unauthed, samplePath);
      await expectPermissionDenied(uploadBytes(obj, new Uint8Array([0, 1, 2]), {
        contentType: 'audio/wav'
      }));
    });

    it('rejects writes from non-admin users', async () => {
      const samplePath = 'samples/public/sample1.wav';
      let authed = testEnv.authenticatedContext('user', {admin: false}).storage();
      let obj = ref(authed, samplePath);
      await expectPermissionDenied(uploadBytes(obj, new Uint8Array([0, 1, 2]), {
        contentType: 'audio/wav'
      }));
    });

    it('allows writes from admin users', async () => {
      const samplePath = 'samples/public/sample1.wav';
      let authed = testEnv.authenticatedContext('user', {admin: true}).storage();
      let obj = ref(authed, samplePath);
      await assertSucceeds(uploadBytes(obj, new Uint8Array([0, 1, 2]), {
        contentType: 'audio/wav'
      }));
    });

    it('rejects if not audio/wave file', async () => {
      const samplePath = 'samples/public/sample1.wav';
      let authed = testEnv.authenticatedContext('user', {admin: true}).storage();
      let obj = ref(authed, samplePath);
      await expectPermissionDenied(uploadBytes(obj, new Uint8Array([0, 1, 2]), {
        contentType: 'audio/mp3'
      }));
    });
  });

  describe('user samples collection', () => {
    let userId: string;
    beforeEach(() => {
      userId = `user-${Date.now()}`;
    });

    it('rejects unauthenticated reads', async () => {
      const samplePath = `samples/${userId}/sample1.wav`;
      await createFile(samplePath);

      let unauthed = testEnv.unauthenticatedContext().storage();
      let obj = ref(unauthed, samplePath);
      await expectPermissionDenied(getBytes(obj));
    });

    it('rejects users from reading samples by other users', async () => {
      const samplePath = `samples/${userId}/sample1.wav`;
      await createFile(samplePath);

      let authed = testEnv.authenticatedContext('unrelated-user').storage();
      let obj = ref(authed, samplePath);
      await expectPermissionDenied(getBytes(obj));
    });

    it('allows users read their own samples', async () => {
      const samplePath = `samples/${userId}/sample1.wav`;
      await createFile(samplePath);

      let authed = testEnv.authenticatedContext(userId).storage();
      let obj = ref(authed, samplePath);
      await assertSucceeds(getBytes(obj));
    });

    it('rejects unauthenticated writes', async () => {
      const samplePath = `samples/${userId}/sample1.wav`;
      let unauthed = testEnv.unauthenticatedContext().storage();
      let obj = ref(unauthed, samplePath);
      await expectPermissionDenied(uploadBytes(obj, new Uint8Array([0, 1, 2]), {
        contentType: 'audio/wav'
      }));
    });

    it('rejects authenticated writes into other users samples', async () => {
      const samplePath = `samples/${userId}/sample1.wav`;
      let authed = testEnv.authenticatedContext('unrelated-user', {admin: true}).storage();
      let obj = ref(authed, samplePath);
      await expectPermissionDenied(uploadBytes(obj, new Uint8Array([0, 1, 2]), {
        contentType: 'audio/wav'
      }));
    });

    it('allows authenticated writes into their own samples', async () => {
      const samplePath = `samples/${userId}/sample1.wav`;
      let authed = testEnv.authenticatedContext(userId, {admin: true}).storage();
      let obj = ref(authed, samplePath);
      await assertSucceeds(uploadBytes(obj, new Uint8Array([0, 1, 2]), {
        contentType: 'audio/wav'
      }));
    });

    it('rejects non-admin writes', async () => {
      const samplePath = `samples/${userId}/sample1.wav`;
      let authed = testEnv.authenticatedContext(userId, {admin: false}).storage();
      let obj = ref(authed, samplePath);
      await expectPermissionDenied(uploadBytes(obj, new Uint8Array([0, 1, 2]), {
        contentType: 'audio/wav'
      }));
    });
  });
});
