import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { of, switchMap } from 'rxjs';

export const allWelcome: CanActivateFn = () => {
  return true;
}

export const requireLogin: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isSignedIn$.pipe(switchMap(isSignedIn => {
    if (!isSignedIn) {
      router.navigate(["/auth"]);
    }
    return of(isSignedIn);
  }));
};
