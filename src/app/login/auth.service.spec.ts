import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { connectAuthEmulator } from '@firebase/auth';

describe('AuthService', () => {
  const projectId = 'webtrax-1fc7d';
  let service: AuthService;
  let appName: string;

  beforeEach(() => {
    appName = `authService-${Date.now()}`;
    TestBed.configureTestingModule({
      providers: [
        provideFirebaseApp(() =>
          initializeApp(
            {
              projectId,
              apiKey: 'AIzaSyD',
            },
            appName
          )
        ),
        provideAuth(() => {
          let auth = getAuth(getApp(appName));
          connectAuthEmulator(auth, 'http://localhost:9099', {
            disableWarnings: true,
          });
          return auth;
        }),
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
