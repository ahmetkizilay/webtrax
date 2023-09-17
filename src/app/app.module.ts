import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { TrackComponent } from './track/track.component';
import { TransportComponent } from './transport/transport.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    TrackComponent,
    TransportComponent,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage(getApp())),
    // provideAuth(() => getAuth()),
    // provideFunctions(() => getFunctions()),
    // providePerformance(() => getPerformance()),
    // rovideRemoteConfig(() => getRemoteConfig()),
    // provideAnalytics(() => getAnalytics()),
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
