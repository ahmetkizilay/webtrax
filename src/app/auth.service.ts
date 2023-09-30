import { Injectable, OnDestroy, inject } from '@angular/core';
import { Auth, User, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { ReplaySubject, Subscription } from 'rxjs';

interface AuthError {
  code: string;
};

export interface CurrentUser {
  uid: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private auth: Auth = inject(Auth);
  private authState$ = authState(this.auth);
  private authStateSubscription: Subscription;
  private isSignedIn = false;

  isSignedIn$ = new ReplaySubject<boolean>(1);

  private currentUser: CurrentUser | null = null;

  constructor() {
    this.authStateSubscription = this.authState$.subscribe((user: User | null) => {
      this.isSignedIn = user !== null;
      this.isSignedIn$.next(this.isSignedIn);
      this.currentUser = user ? {
        uid: user.uid,
      } : null;
      console.log(`auth state changed: ${this.isSignedIn}`);
      console.log(`userId: ${this.currentUser?.uid}`);
    });
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  isAuthenticated() {
    return this.isSignedIn;
  }

  async login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      return true;
    }
    catch (e) {
      console.error((e as AuthError).code);
      return false;
    }
  }

  async signup(email: string, password: string) {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
      return true;
    } 
    catch (e) {
      console.error((e as AuthError).code);
      return false;
    }
  }

  getCurrentUserId(): string | null {
    return this.currentUser ? this.currentUser.uid : null;
  }

  async logout() {
    await signOut(this.auth);
  }
}
