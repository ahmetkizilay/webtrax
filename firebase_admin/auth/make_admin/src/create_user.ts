import { Auth } from 'firebase-admin/auth';

export interface CreateUserParams {
  email: string;
  password: string;
  admin: boolean;
}


export async function createUser(auth: Auth, params: CreateUserParams): Promise<string> {
  const { email, password, admin } = params;
  const userRecord = await auth.createUser({
    email,
    password,
    emailVerified: false,
    disabled: false,
  });
  console.log(`Created user: ${userRecord.email}`);
  if (admin) {
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('User is set as admin.');
  }
  return userRecord.uid
}
