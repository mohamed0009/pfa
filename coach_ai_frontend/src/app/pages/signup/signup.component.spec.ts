import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { SignupComponent } from './signup.component';
import { AuthService } from '../../services/auth.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signup']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    fixture.detectChanges();
    expect(component.signupForm).toBeDefined();
    expect(component.signupForm.get('role')?.value).toBe('USER');
    expect(component.signupForm.get('acceptTerms')?.value).toBeFalse();
  });

  it('should validate fullName field', () => {
    fixture.detectChanges();
    const fullNameControl = component.signupForm.get('fullName');
    
    fullNameControl?.setValue('');
    expect(fullNameControl?.hasError('required')).toBeTrue();
    
    fullNameControl?.setValue('ab');
    expect(fullNameControl?.hasError('minlength')).toBeTrue();
    
    fullNameControl?.setValue('John Doe');
    expect(fullNameControl?.valid).toBeTrue();
  });

  it('should validate email format based on role', () => {
    fixture.detectChanges();
    const emailControl = component.signupForm.get('email');
    
    component.selectedRole = 'USER';
    emailControl?.setValue('user@etud.com');
    expect(emailControl?.valid).toBeTrue();
    
    emailControl?.setValue('user@wrong.com');
    expect(emailControl?.hasError('emailFormat')).toBeTrue();
    
    component.selectedRole = 'TRAINER';
    emailControl?.setValue('trainer@form.com');
    expect(emailControl?.valid).toBeTrue();
    
    component.selectedRole = 'ADMIN';
    emailControl?.setValue('admin@adm.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('should validate password strength', () => {
    fixture.detectChanges();
    const passwordControl = component.signupForm.get('password');
    
    passwordControl?.setValue('weak');
    expect(passwordControl?.hasError('passwordStrength')).toBeTrue();
    
    passwordControl?.setValue('Strong123');
    expect(passwordControl?.valid).toBeTrue();
  });

  it('should validate password match', () => {
    fixture.detectChanges();
    component.signupForm.patchValue({
      password: 'Password123',
      confirmPassword: 'Different123'
    });
    
    expect(component.signupForm.hasError('passwordMismatch')).toBeTrue();
    
    component.signupForm.patchValue({
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    
    expect(component.signupForm.hasError('passwordMismatch')).toBeFalsy();
  });

  it('should toggle password visibility', () => {
    fixture.detectChanges();
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
  });

  it('should toggle confirm password visibility', () => {
    fixture.detectChanges();
    expect(component.showConfirmPassword).toBeFalse();
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeTrue();
  });

  it('should update password strength', () => {
    fixture.detectChanges();
    
    component.signupForm.patchValue({ password: 'weak' });
    component.updatePasswordStrength();
    expect(component.passwordStrength).toBe('weak');
    
    component.signupForm.patchValue({ password: 'Medium123' });
    component.updatePasswordStrength();
    expect(component.passwordStrength).toBe('medium');
    
    component.signupForm.patchValue({ password: 'Strong123!' });
    component.updatePasswordStrength();
    expect(component.passwordStrength).toBe('strong');
  });

  it('should get password strength text', () => {
    component.passwordStrength = 'weak';
    expect(component.getPasswordStrengthText()).toBe('Faible');
    
    component.passwordStrength = 'medium';
    expect(component.getPasswordStrengthText()).toBe('Moyen');
    
    component.passwordStrength = 'strong';
    expect(component.getPasswordStrengthText()).toBe('Fort');
  });

  it('should get password strength width', () => {
    component.passwordStrength = 'weak';
    expect(component.getPasswordStrengthWidth()).toBe('33%');
    
    component.passwordStrength = 'medium';
    expect(component.getPasswordStrengthWidth()).toBe('66%');
    
    component.passwordStrength = 'strong';
    expect(component.getPasswordStrengthWidth()).toBe('100%');
  });

  it('should not submit if form is invalid', () => {
    fixture.detectChanges();
    component.onSubmit();
    expect(authService.signup).not.toHaveBeenCalled();
  });

  it('should submit form and navigate on successful signup', (done) => {
    fixture.detectChanges();
    const mockResponse = {
      token: 'test-token',
      type: 'Bearer',
      id: '1',
      email: 'user@etud.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER'
    };

    authService.signup.and.returnValue(of(mockResponse));
    
    component.signupForm.patchValue({
      fullName: 'John Doe',
      email: 'user@etud.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      role: 'USER',
      acceptTerms: true
    });

    component.onSubmit();

    expect(authService.signup).toHaveBeenCalled();
    
    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/user/dashboard']);
      done();
    }, 4100);
  });

  it('should navigate to admin dashboard when role is ADMIN', (done) => {
    fixture.detectChanges();
    const mockResponse = {
      token: 'test-token',
      type: 'Bearer',
      id: '1',
      email: 'admin@adm.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    };

    authService.signup.and.returnValue(of(mockResponse));
    
    component.signupForm.patchValue({
      fullName: 'Admin User',
      email: 'admin@adm.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      role: 'ADMIN',
      acceptTerms: true
    });

    component.onSubmit();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
      done();
    }, 4100);
  });

  it('should display error message on signup failure', () => {
    fixture.detectChanges();
    const error = { error: { message: 'Email already exists' } };
    authService.signup.and.returnValue(throwError(() => error));
    
    component.signupForm.patchValue({
      fullName: 'John Doe',
      email: 'user@etud.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      role: 'USER',
      acceptTerms: true
    });

    component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(component.loading).toBeFalse();
  });
});

