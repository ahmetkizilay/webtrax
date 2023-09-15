import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TrackComponent } from './track/track.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    TrackComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
