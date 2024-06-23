import { readFileSync } from 'fs';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { addDoc, getDoc, setDoc, collection, setLogLevel, doc } from 'firebase/firestore';

async function expectPermissionDenied(operation: Promise<any>) {
  const err = await assertFails(operation);
  expect(err.code).toBe('permission-denied' || 'PERMISSION_DENIED');
}

let testEnv: RulesTestEnvironment;

describe('Firestore rules', () => {
  setLogLevel('error');
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'my-test-project',
      firestore: {
        rules: readFileSync('./firestore/firestore.rules', 'utf8'),
        host: 'localhost',
        port: 8080,
      }
    });
  });

  beforeEach(async() => {
    await testEnv.clearFirestore();
  })

  describe('samples collection', () => {
    it ('reject write if not authenticated', async() => {
      let unauthedDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthedDb, 'samples', 'sample');
      await expectPermissionDenied(setDoc(docRef, { }));
    });

    it('reject write if authenticated but not admin', async () => {
      let authedDb = testEnv.authenticatedContext('user', {admin: false}).firestore();
      const docRef = doc(authedDb, 'samples', 'sample');
      await expectPermissionDenied(setDoc(docRef, { }));
    });

    it('allow write if authenticated as admin', async () => {
      let authedDb = testEnv.authenticatedContext('user', {admin: true}).firestore();
      const samplesRef = collection(authedDb, 'samples');
      await assertSucceeds(addDoc(samplesRef, {}));
    });

    it('allow unauthenticated read if the sample owner is null', async () => {
      let authedDb = testEnv.authenticatedContext('user', {admin: true}).firestore();
      const samplesRef = collection(authedDb, 'samples');
      const docRef = await addDoc(samplesRef, {owner: null});

      let unauthedDb = testEnv.unauthenticatedContext().firestore();
      const unauthDocRef = doc(unauthedDb, 'samples', docRef.id);
      await assertSucceeds(getDoc(unauthDocRef));
    });

    it('reject unauthenticated read if the sample has an owner', async () => {
      const userId = `user-${Date.now()}`;
      let authedDb = testEnv.authenticatedContext(userId, {admin: true}).firestore();
      const samplesRef = collection(authedDb, 'samples');
      const docRef = await addDoc(samplesRef, {owner: userId});

      let unauthedDb = testEnv.unauthenticatedContext().firestore();
      const unauthDocRef = doc(unauthedDb, 'samples', docRef.id);
      await expectPermissionDenied(getDoc(unauthDocRef));
    });

    it('allow read if authenticated user is the sample owner', async () => {
      const userId = `user-${Date.now()}`;
      let authedDb = testEnv.authenticatedContext(userId, {admin: true}).firestore();
      const samplesRef = collection(authedDb, 'samples');
      const newDocRef = await addDoc(samplesRef, {owner: userId});

      const docRef = doc(authedDb, 'samples', newDocRef.id);
      await assertSucceeds(getDoc(docRef));
    });
  });
});
