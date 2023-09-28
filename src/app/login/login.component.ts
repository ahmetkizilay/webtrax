import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ReplaySubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
<form *ngIf="!(isSignedIn$ | async)s" [formGroup]="loginForm" (submit)="login()">
  <div>
    <label for="email">Email</label>
    <input id="email" type="email" formControlName="email">
  </div>
  <div>
    <label for="password">Password</label>
    <input id="password" type="password" formControlName="password">
  </div>  
  <button type="submit" class="primary">Login</button>
</form>
<button *ngIf="isSignedIn$ | async" (click)="logout()">Logout</button>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  isSignedIn$ = new ReplaySubject<boolean>(1);
  signinStateSubscripton: Subscription;

  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });

  constructor() {
    this.signinStateSubscripton = this.authService.isSignedIn$.subscribe(isSignedIn => {
      this.isSignedIn$.next(isSignedIn);
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
      this.router.navigate(["/"]);
    }
  }

  logout() {
    this.authService.logout();
  }
}
