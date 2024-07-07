import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ReplaySubject, Subscription, filter, first, lastValueFrom  } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
<div *ngIf="mode == 'login'" class="form-wrapper">
  <form class="signin" [formGroup]="loginForm" (submit)="login()">
    <div class="input-row">
      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email">
    </div>
    <div class="input-row">
      <label for="password">Password</label>
      <input id="password" type="password" formControlName="password">
    </div>
    <button type="submit" class="primary">Login</button>
    <hr/>
    <div class="input-row">
      <label>New User?</label>
      <button class="switch-register" (click)="switchToRegister()">Create an account</button>
    </div>
  </form>
</div>

<div *ngIf="mode == 'register'" class="form-wrapper">
  <form class="signup" [formGroup]="registerForm" (submit)="register()">
    <div class="input-row">
      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email">
    </div>
    <div class="input-row">
      <label for="password">Password</label>
      <input id="password" type="password" formControlName="password">
    </div>
    <button type="submit" class="primary">Sign up</button>
    <hr/>
    <div class="input-row">
      <label>Returning User?</label>
      <button class="switch-login" (click)="switchToLogin()">Login</button>
    </div>
  </form>
</div>

<div *ngIf="mode == 'logout'" class="form-wrapper signout">
  <label style="margin-bottom: 4px">Already logged in!</label>
  <button *ngIf="isSignedIn$ | async" (click)="logout()">Logout</button>
</div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  isSignedIn$ = new ReplaySubject<boolean>(1);
  signinStateSubscripton: Subscription;

  mode: 'register' | 'login' | 'logout' = 'login';

  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });

  registerForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });

  constructor() {
    this.signinStateSubscripton = this.authService.isSignedIn$.subscribe(isSignedIn => {
      this.isSignedIn$.next(isSignedIn);
      this.mode = isSignedIn ? 'logout' : 'login';
    });
  }

  ngOnDestroy(): void {
    this.signinStateSubscripton.unsubscribe();
  }

  async login() {
    const success = await this.authService.login(
      this.loginForm.value.email ?? '',
      this.loginForm.value.password ?? ''
    );
    if (success) {
      // filter is a trick to make sure the authstate is updated before navigating to home.
      await lastValueFrom(this.authService.isSignedIn$.pipe(filter(val => val), first()));
      return this.router.navigate(['/']);
    }
    return;
  }

  async register() {
    const success = await this.authService.signup(
      this.loginForm.value.email ?? '',
      this.loginForm.value.password ?? ''
    );
    if (success) {
      // filter is a trick to make sure the authstate is updated before navigating to home.
      await lastValueFrom(this.authService.isSignedIn$.pipe(filter(val => val), first()));
      return this.router.navigate(['/']);
    }
    return;
  }

  async logout() {
    await this.authService.logout();
    this.mode = 'login';
  }

  switchToRegister() {
    this.mode = 'register';
  }

  switchToLogin() {
    this.mode = 'login';
  }
}
