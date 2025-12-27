import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { HeaderComponent } from './header.component';
import { AuthService, AuthUser } from '../../services/auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: AuthUser = {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    joinDate: '2024-01-01',
    role: 'USER'
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      isAuthenticated: new BehaviorSubject<boolean>(true),
      currentUser: new BehaviorSubject<AuthUser | null>(mockUser)
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with authentication state', () => {
    fixture.detectChanges();
    expect(component.isAuthenticated$).toBeTruthy();
    expect(component.currentUser$).toBeTruthy();
  });

  it('should toggle menu', () => {
    expect(component.isMenuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should close menu', () => {
    component.isMenuOpen = true;
    component.closeMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should logout and close menu', () => {
    component.isMenuOpen = true;
    component.onLogout();
    expect(authService.logout).toHaveBeenCalled();
    expect(component.isMenuOpen).toBeFalse();
  });
});
