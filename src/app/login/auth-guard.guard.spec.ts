import { TestBed } from '@angular/core/testing';
import { CanActivateFn, GuardResult, Router } from '@angular/router';

import { requireLogin, allWelcome } from './auth-guard.guard';
import { AuthService } from './auth.service';
import { Observable, ReplaySubject } from 'rxjs';

describe('AuthGuard', () => {
  describe('allWelcome', () => {
    const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => allWelcome(...guardParameters));

    beforeEach(() => {
      TestBed.configureTestingModule({});
    });

    it('is always true', () => {
      expect(executeGuard({} as any, {} as any)).toBeTrue();
    });
  });

  describe('requireLogin', () => {
    const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => requireLogin(...guardParameters));
    let isSignedIn$: ReplaySubject<boolean>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
      isSignedIn$ = new ReplaySubject<boolean>(1);
      authService = jasmine.createSpyObj('AuthService', [], {
        isSignedIn$: isSignedIn$,
      });
      TestBed.configureTestingModule({
        providers: [
          Router,
          {
            provide: AuthService,
            useValue: authService,
          },
        ],
      });
    });

    it('redirects to /auth when not signed in', (done) => {
      let router = TestBed.inject(Router);
      let navigateSpy = spyOn(router, 'navigate');
      isSignedIn$.next(false);
      let result = executeGuard(
        {} as any,
        {} as any
      ) as Observable<GuardResult>;
      result.subscribe((res) => {
        expect(res).toBeFalse();
        expect(navigateSpy).toHaveBeenCalledWith(['/auth']);
        done();
      });
    });

    it('does not redirect when signed in', (done) => {
      let router = TestBed.inject(Router);
      let navigateSpy = spyOn(router, 'navigate');
      isSignedIn$.next(true);
      let result = executeGuard(
        {} as any,
        {} as any
      ) as Observable<GuardResult>;
      result.subscribe((res) => {
        expect(res).toBeTrue();
        expect(navigateSpy).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
