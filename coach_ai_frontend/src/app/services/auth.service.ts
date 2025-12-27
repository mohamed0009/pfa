import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  joinDate: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  fullName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthResponse {
  token: string;
  type: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser: Observable<AuthUser | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated: Observable<boolean>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
    
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!(user && storedToken));
    this.isAuthenticated = this.isAuthenticatedSubject.asObservable();
  }

  public get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticatedValue(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      map((response: AuthResponse) => {
        // Map backend response to AuthUser
        const authenticatedUser: AuthUser = {
          id: response.id,
          fullName: `${response.firstName} ${response.lastName}`,
          email: response.email,
          avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          joinDate: new Date().toISOString(),
          role: response.role
        };

        // Store token and user
        if (credentials.rememberMe) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
        } else {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
        }

        this.currentUserSubject.next(authenticatedUser);
        this.isAuthenticatedSubject.next(true);

        return authenticatedUser;
      }),
      catchError((error) => {
        let errorMessage = 'Invalid email or password';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          try {
            const errorObj = JSON.parse(error.error);
            errorMessage = errorObj.message || errorMessage;
          } catch (e) {
            errorMessage = error.error;
          }
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  signup(signupData: SignUpData | any): Observable<AuthResponse> {
    // Validate password match if confirmPassword is provided
    if (signupData.confirmPassword && signupData.password !== signupData.confirmPassword) {
      return throwError(() => new Error('Passwords do not match'));
    }

    // Prepare request data
    const requestData: any = {
      email: signupData.email.trim().toLowerCase(),
      password: signupData.password,
      role: signupData.role || 'USER'
    };

    // Use firstName/lastName if provided, otherwise extract from fullName
    if (signupData.firstName && signupData.lastName) {
      requestData.firstName = signupData.firstName;
      requestData.lastName = signupData.lastName;
    } else if (signupData.fullName) {
      const nameParts = signupData.fullName.trim().split(' ', 2);
      requestData.firstName = nameParts[0] || '';
      requestData.lastName = nameParts.length > 1 ? nameParts[1] : '';
    } else {
      return throwError(() => new Error('First name and last name are required'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, requestData).pipe(
      map((response: AuthResponse) => {
        // Map backend response to AuthUser
        const newUser: AuthUser = {
          id: response.id,
          fullName: `${response.firstName} ${response.lastName}`,
          email: response.email,
          avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          joinDate: new Date().toISOString(),
          role: response.role
        };

        // Store token and user
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        this.currentUserSubject.next(newUser);
        this.isAuthenticatedSubject.next(true);

        return response; // Return AuthResponse instead of AuthUser
      }),
      catchError((error) => {
        let errorMessage = 'Registration failed';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          try {
            const errorObj = JSON.parse(error.error);
            errorMessage = errorObj.message || errorMessage;
          } catch (e) {
            errorMessage = error.error;
          }
        }
        return throwError(() => ({ error, message: errorMessage }));
      })
    );
  }

  logout(): void {
    // Remove user and token from storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<boolean> {
    // TODO: Implement forgot password endpoint when available
    return throwError(() => new Error('Forgot password not yet implemented'));
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedValue;
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
}





