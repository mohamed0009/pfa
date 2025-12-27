import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, AuthUser, LoginCredentials, SignUpData } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with no user when no stored data', () => {
      expect(service.currentUserValue).toBeNull();
      expect(service.isAuthenticatedValue).toBeFalse();
    });

    it('should initialize with stored user from localStorage', () => {
      const storedUser: AuthUser = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        joinDate: new Date().toISOString(),
        role: 'USER'
      };
      localStorage.setItem('currentUser', JSON.stringify(storedUser));
      localStorage.setItem('token', 'test-token');

      const httpClient = TestBed.inject(HttpClient);
      const newService = new AuthService(router, httpClient);
      expect(newService.currentUserValue).toEqual(storedUser);
      expect(newService.isAuthenticatedValue).toBeTrue();
    });
  });

  describe('login', () => {
    it('should login successfully and store token in localStorage when rememberMe is true', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      };

      const mockResponse = {
        token: 'test-token',
        type: 'Bearer',
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      };

      service.login(credentials).subscribe({
        next: (user) => {
          expect(user).toBeTruthy();
          expect(user.email).toBe('test@example.com');
          expect(user.fullName).toBe('Test User');
          expect(localStorage.getItem('token')).toBe('test-token');
          expect(localStorage.getItem('currentUser')).toBeTruthy();
          expect(service.isAuthenticatedValue).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should login successfully and store token in sessionStorage when rememberMe is false', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      };

      const mockResponse = {
        token: 'test-token',
        type: 'Bearer',
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      };

      service.login(credentials).subscribe({
        next: (user) => {
          expect(sessionStorage.getItem('token')).toBe('test-token');
          expect(sessionStorage.getItem('currentUser')).toBeTruthy();
          expect(localStorage.getItem('token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
      req.flush(mockResponse);
    });

    it('should handle login error', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      service.login(credentials).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.isAuthenticatedValue).toBeFalse();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('signup', () => {
    it('should signup successfully', (done) => {
      const signupData: SignUpData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'USER'
      };

      const mockResponse = {
        token: 'test-token',
        type: 'Bearer',
        id: '2',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'USER'
      };

      service.signup(signupData).subscribe({
        next: (response) => {
          expect(response).toBeTruthy();
          expect(response.email).toBe('newuser@example.com');
          expect(localStorage.getItem('token')).toBe('test-token');
          expect(service.isAuthenticatedValue).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/signup');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should reject signup when passwords do not match', (done) => {
      const signupData: SignUpData = {
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        firstName: 'New',
        lastName: 'User',
        role: 'USER'
      };

      service.signup(signupData).subscribe({
        error: (error) => {
          expect(error.message).toBe('Passwords do not match');
          done();
        }
      });
    });

    it('should extract firstName and lastName from fullName if not provided', (done) => {
      const signupData: any = {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
        role: 'USER'
      };

      const mockResponse = {
        token: 'test-token',
        type: 'Bearer',
        id: '2',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'USER'
      };

      service.signup(signupData).subscribe({
        next: () => {
          const req = httpMock.expectOne('http://localhost:8081/api/auth/signup');
          expect(req.request.body.firstName).toBe('New');
          expect(req.request.body.lastName).toBe('User');
          req.flush(mockResponse);
          done();
        }
      });
    });
  });

  describe('logout', () => {
    it('should logout and clear storage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify({ id: '1', email: 'test@example.com' }));
      sessionStorage.setItem('token', 'test-token');

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(service.currentUserValue).toBeNull();
      expect(service.isAuthenticatedValue).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when not authenticated', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should return true when authenticated', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify({ id: '1', email: 'test@example.com' }));
      
      const httpClient = TestBed.inject(HttpClient);
      const newService = new AuthService(router, httpClient);
      expect(newService.isLoggedIn()).toBeTrue();
    });
  });

  describe('getToken', () => {
    it('should return null when no token stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'local-token');
      expect(service.getToken()).toBe('local-token');
    });

    it('should return token from sessionStorage when localStorage is empty', () => {
      sessionStorage.setItem('token', 'session-token');
      expect(service.getToken()).toBe('session-token');
    });
  });

  describe('forgotPassword', () => {
    it('should throw error as not implemented', (done) => {
      service.forgotPassword('test@example.com').subscribe({
        error: (error) => {
          expect(error.message).toBe('Forgot password not yet implemented');
          done();
        }
      });
    });
  });
});

