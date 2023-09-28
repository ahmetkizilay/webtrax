import { Injectable, OnDestroy, inject} from '@angular/core';
import { Auth, User, authState, signInWithEmailAndPassword, signInWithEmailLink, signOut } from '@angular/fire/auth';
import { ReplaySubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private auth: Auth = inject(Auth);
  private authState$ = authState(this.auth);
  private authStateSubscription: Subscription;
  private isSignedIn = false;

  isSignedIn$ = new ReplaySubject<boolean>(1);

  constructor() { 
    this.authStateSubscription = this.authState$.subscribe((user: User|null) => {
      this.isSignedIn = user !== null;
      this.isSignedIn$.next(this.isSignedIn);
      console.log(`auth state changed: ${this.isSignedIn}`);
    });
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  isAuthenticated() {
    return this.isSignedIn;
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password);
    return true;
  }

  async logout() {
    await signOut(this.auth);
  }
}
