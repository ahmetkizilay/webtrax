import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideClientHydration(),
        provideFirebaseApp(() => initializeApp(environment.firebase.config)),
        provideAuth(() => {
            const auth = getAuth();
            if (environment.firebase.emulators.auth) {
                connectAuthEmulator(auth, 'https://9000-monospace-webtrax-ng-1694359528583.cluster-lknrrkkitbcdsvoir6wqg4mwt6.cloudworkstations.dev:9099', { disableWarnings: true });
            }
            return auth;
        }),
        provideFirestore(() => {
            const firestore = getFirestore();
            if (environment.firebase.emulators.firestore) {
                connectFirestoreEmulator(firestore, 'https://9000-monospace-webtrax-ng-1694359528583.cluster-lknrrkkitbcdsvoir6wqg4mwt6.cloudworkstations.dev', 8080);
            }
            return firestore
        }),
        provideStorage(() => getStorage()),
        { provide: AudioContext, useValue: new AudioContext() },
    ]
};
