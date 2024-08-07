
import { Routes } from '@angular/router'; // CLI imports router
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { allWelcome, requireLogin } from './login/auth-guard.guard';
import { SamplesComponent } from './samples/samples.component';

export const routes: Routes = [
  { path: 'auth', component: LoginComponent },
  { path: 'samples', component: SamplesComponent, canActivate: [requireLogin]},
  { path: '', component: HomeComponent, canActivate: [allWelcome] },
];
