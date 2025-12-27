import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, AuthUser } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'forgotPassword']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      snapshot: {
        queryParams: {}
      },
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    fixture.detectChanges();
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBeFalse();
  });

  it('should validate email field', () => {
    fixture.detectChanges();
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTrue();
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTrue();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('should validate password field', () => {
    fixture.detectChanges();
    const passwordControl = component.loginForm.get('password');
    
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBeTrue();
    
    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBeTrue();
    
    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTrue();
  });

  it('should toggle password visibility', () => {
    fixture.detectChanges();
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should not submit if form is invalid', () => {
    fixture.detectChanges();
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should submit form and navigate to user dashboard on successful login', () => {
    fixture.detectChanges();
    const mockUser: AuthUser = {
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      joinDate: new Date().toISOString(),
      role: 'USER'
    };

    authService.login.and.returnValue(of(mockUser));
    
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/user/dashboard']);
  });

  it('should navigate to admin dashboard when role is ADMIN', () => {
    fixture.detectChanges();
    const mockUser: AuthUser = {
      id: '1',
      fullName: 'Admin User',
      email: 'admin@example.com',
      joinDate: new Date().toISOString(),
      role: 'ADMIN'
    };

    authService.login.and.returnValue(of(mockUser));
    
    component.loginForm.patchValue({
      email: 'admin@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should navigate to trainer dashboard when role is TRAINER', () => {
    fixture.detectChanges();
    const mockUser: AuthUser = {
      id: '1',
      fullName: 'Trainer User',
      email: 'trainer@example.com',
      joinDate: new Date().toISOString(),
      role: 'TRAINER'
    };

    authService.login.and.returnValue(of(mockUser));
    
    component.loginForm.patchValue({
      email: 'trainer@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/trainer/dashboard']);
  });

  it('should display error message on login failure', () => {
    fixture.detectChanges();
    const error = { error: { message: 'Invalid credentials' } };
    authService.login.and.returnValue(throwError(() => error));
    
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(component.loading).toBeFalse();
  });

  it('should handle forgot password with valid email', () => {
    fixture.detectChanges();
    authService.forgotPassword.and.returnValue(of(true));
    spyOn(window, 'alert');
    
    component.loginForm.patchValue({
      email: 'test@example.com'
    });

    component.onForgotPassword();

    expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
  });

  it('should not call forgotPassword with invalid email', () => {
    fixture.detectChanges();
    spyOn(window, 'alert');
    
    component.loginForm.patchValue({
      email: ''
    });

    component.onForgotPassword();

    expect(authService.forgotPassword).not.toHaveBeenCalled();
  });

  it('should set returnUrl from query params', () => {
    activatedRoute.snapshot.queryParams = { returnUrl: '/protected' };
    fixture.detectChanges();
    expect(component.returnUrl).toBe('/protected');
  });
});

