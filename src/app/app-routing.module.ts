import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { allWelcome, requireLogin } from './auth-guard.guard';
import { SamplesComponent } from './samples/samples.component';

const routes: Routes = [
  { path: 'auth', component: LoginComponent },
  { path: 'samples', component: SamplesComponent, canActivate: [requireLogin]},
  { path: '', component: HomeComponent, canActivate: [allWelcome] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
