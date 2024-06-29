import { App, deleteApp, initializeApp} from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';

import { createUser, CreateUserParams } from './create_user';

process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

const PROJECT_ID = 'webtrax-1fc7d';

describe('create_user', () => {
  let app: App
  let auth: Auth;
  let users: string[] = [];

  beforeAll(() => {
    app = initializeApp({
      projectId: PROJECT_ID,
    });

    auth = getAuth();
  });

  afterAll(async () => {
    await deleteApp(app);
  });

  beforeEach(async () => {
    if (users.length > 0) {
      await auth.deleteUsers(users);
      users = [];
    }
  })

  it('creates a non-admin user', async () => {
    const userParams: CreateUserParams = {
      email: `user-${Date.now()}@test.com`,
      password: 'password',
      admin: false,
    };
    const uid = await createUser(auth, userParams);
    users.push(uid);

    const userRecord = await auth.getUser(uid);
    expect(userRecord.customClaims).toBeUndefined();
  });

  it('creates an admin user', async () => {
    const userParams: CreateUserParams = {
      email: `user-${Date.now()}@test.com`,
      password: 'password',
      admin: true,
    };
    const uid = await createUser(auth, userParams);
    users.push(uid);

    const userRecord = await auth.getUser(uid);
    expect(userRecord.customClaims).toEqual({'admin': true});
  });
});
