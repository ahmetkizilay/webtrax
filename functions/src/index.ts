import * as logger from 'firebase-functions/logger';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onObjectFinalized, StorageEvent } from 'firebase-functions/v2/storage';

const BUCKET_NAME = 'webtrax-1fc7d.appspot.com';
initializeApp();
const db = getFirestore();

export const registerObject = onObjectFinalized(
  BUCKET_NAME,
  async (event: StorageEvent) => {
    logger.info(`registerObject, name: ${event.data.name}`, {
      structuredData: true,
    });

    const ownerId = event.data.name.split('/')[1];
    logger.info(`ownerId: ${ownerId}`, { structuredData: true });

    await db.collection('samples').doc('test.wav').set({
      owner: ownerId,
      path: event.data.name,
      createdAt: FieldValue.serverTimestamp(),
    });
    return;
  }
);
