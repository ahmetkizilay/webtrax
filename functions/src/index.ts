import * as logger from 'firebase-functions/logger';
import { initializeApp } from 'firebase-admin/app';
import { onObjectFinalized, StorageEvent } from 'firebase-functions/v2/storage';

const BUCKET_NAME = 'webtrax-1fc7d.appspot.com';
initializeApp();

export const registerObject = onObjectFinalized(
  BUCKET_NAME,
  async (event: StorageEvent) => {
    logger.info(`registerObject, id: ${event.id}`, { structuredData: true });
  }
);
