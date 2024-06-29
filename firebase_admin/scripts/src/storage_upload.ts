import * as path from 'path';

import { Storage } from 'firebase-admin/storage';

export interface UploadParams {
  src: string;
  dest: string;
}

export async function uploadFile(
  storage: Storage,
  params: UploadParams,
  baseDir: string
) {
  const { src, dest } = params;
  await storage
    .bucket()
    .upload(path.join(baseDir, src), { destination: dest });
  console.log(`Uploaded file to ${dest}`);
}
