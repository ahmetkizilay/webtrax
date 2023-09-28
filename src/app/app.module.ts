import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage(getApp())),
    provideAuth(() => getAuth()),
    AppRoutingModule,
    // provideFunctions(() => getFunctions()),
    // providePerformance(() => getPerformance()),
    // rovideRemoteConfig(() => getRemoteConfig()),
    // provideAnalytics(() => getAnalytics()),
  ],
  providers: [
    { provide: AudioContext, useValue: new AudioContext() },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
