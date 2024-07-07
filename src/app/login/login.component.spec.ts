import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let mockIsSignedIn$: Subject<boolean>;
  let mockLoginFn: jasmine.Spy;
  let mockSignupFn: jasmine.Spy;
  let mockLogoutFn: jasmine.Spy;

  beforeEach(() => {
    mockIsSignedIn$ = new Subject<boolean>();
    mockLoginFn = jasmine.createSpy();
    mockSignupFn = jasmine.createSpy();
    mockLogoutFn = jasmine.createSpy();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isSignedIn$: mockIsSignedIn$,
            login: mockLoginFn,
            signup: mockSignupFn,
            logout: mockLogoutFn,
          },
        },
      ],
      imports: [LoginComponent],
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('displays login form when not signed in', () => {
    mockIsSignedIn$.next(false);
    fixture.detectChanges();

    expect(component.mode).toEqual('login');
    expect(fixture.debugElement.query(By.css('form.signin'))).toBeTruthy();

  });

  it('displays logout button when signed in', () => {
    mockIsSignedIn$.next(true);
    fixture.detectChanges();

    expect(component.mode).toEqual('logout');
    const logoutButton = fixture.debugElement.query(By.css('.signout button'));
    expect(logoutButton.nativeElement.textContent).toEqual('Logout');
  });

  it('displays register form when in register mode', () => {
    mockIsSignedIn$.next(false);
    fixture.detectChanges();

    const registerButton = fixture.debugElement.query(By.css('button.switch-register'));
    registerButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.mode).toEqual('register');
    expect(fixture.debugElement.query(By.css('form.signup'))).toBeTruthy();
  });

  it('switches to login form', () => {
    mockIsSignedIn$.next(false);
    component.mode = 'register';
    fixture.detectChanges();

    const loginButton = fixture.debugElement.query(By.css('button.switch-login'));
    loginButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.mode).toEqual('login');
    expect(fixture.debugElement.query(By.css('form.signin'))).toBeTruthy();
  });

  it('calls login', () => {
    mockIsSignedIn$.next(false);
    fixture.detectChanges();

    const formSignin = fixture.debugElement.query(By.css('form.signin'));
    formSignin.triggerEventHandler('submit');

    expect(mockLoginFn).toHaveBeenCalled();
  });

  it('calls signup', () => {
    mockIsSignedIn$.next(false);
    component.mode = 'register';
    fixture.detectChanges();

    const formSignup = fixture.debugElement.query(By.css('form.signup'));
    formSignup.triggerEventHandler('submit');

    expect(mockSignupFn).toHaveBeenCalled();
  });

  it('calls logout', () => {
    mockIsSignedIn$.next(true);
    fixture.detectChanges();

    const logoutButton = fixture.debugElement.query(By.css('.signout button'));
    logoutButton.triggerEventHandler('click', null);

    expect(mockLogoutFn).toHaveBeenCalled();
  });
});
