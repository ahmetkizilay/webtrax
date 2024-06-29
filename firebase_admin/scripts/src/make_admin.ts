import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Retrieve the email from the command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email as a command line argument.');
  process.exit(1);
}

(async () => {
  initializeApp();
  const auth = getAuth();
  const userRecord = await auth.getUserByEmail(email);
  console.log(`Retrieved user: ${userRecord.email}`);
  await auth.setCustomUserClaims(userRecord.uid, { admin: true });
  console.log('User is updated.');

  console.log('Validating admin claim');
  const updatedRecord = await auth.getUserByEmail(email);
  console.log(`admin: ${updatedRecord.customClaims?.admin}`);
})();
