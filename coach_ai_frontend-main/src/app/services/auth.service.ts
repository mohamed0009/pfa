import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
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
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser: Observable<AuthUser | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    const user = storedUser ? JSON.parse(storedUser) : null;

    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();

    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!user && !!localStorage.getItem('token'));
    this.isAuthenticated = this.isAuthenticatedSubject.asObservable();
  }

  public get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticatedValue(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      map(response => {
        // Create user object from flat response
        const user: AuthUser = {
          id: response.id,
          fullName: `${response.firstName} ${response.lastName}`,
          email: response.email,
          role: response.role,
          joinDate: new Date().toISOString()
        };

        // Store token and user data
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(user));

          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        }

        return user;
      })
    );
  }

  signup(signupData: SignUpData): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/signup`, {
      fullName: signupData.fullName,
      email: signupData.email,
      password: signupData.password
    }).pipe(
      map(response => {
        // Create user object from flat response
        const user: AuthUser = {
          id: response.id,
          fullName: `${response.firstName} ${response.lastName}`,
          email: response.email,
          role: response.role,
          joinDate: new Date().toISOString()
        };

        // Store token and user data
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(user));

          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        }

        return user;
      })
    );
  }

  logout(): void {
    // Remove user from storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/auth/forgot-password`, { email })
      .pipe(map(response => response.success));
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedValue;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
