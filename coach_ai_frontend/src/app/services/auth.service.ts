import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  joinDate: string;
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser: Observable<AuthUser | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated: Observable<boolean>;

  // Mock user database
  private mockUsers: AuthUser[] = [
    {
      id: '1',
      fullName: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=10',
      joinDate: new Date().toISOString()
    },
    {
      id: '2',
      fullName: 'John Doe',
      email: 'john@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      joinDate: new Date().toISOString()
    }
  ];

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
    
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!user);
    this.isAuthenticated = this.isAuthenticatedSubject.asObservable();
  }

  public get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticatedValue(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(credentials: LoginCredentials): Observable<AuthUser> {
    // Mock authentication - simulate API call
    return of(null).pipe(
      delay(1000), // Simulate network delay
      map(() => {
        // Check if user exists with matching email
        const user = this.mockUsers.find(u => u.email === credentials.email);
        
        // Mock password validation (in real app, this would be done server-side)
        // For demo, accept any password for existing emails, or "password" for new emails
        if (user || credentials.password === 'password') {
          const authenticatedUser = user || {
            id: Date.now().toString(),
            fullName: credentials.email.split('@')[0],
            email: credentials.email,
            avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            joinDate: new Date().toISOString()
          };

          // Store user in localStorage if "remember me" is checked
          if (credentials.rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
          } else {
            sessionStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
          }

          this.currentUserSubject.next(authenticatedUser);
          this.isAuthenticatedSubject.next(true);

          return authenticatedUser;
        } else {
          throw new Error('Invalid email or password');
        }
      })
    );
  }

  signup(signupData: SignUpData): Observable<AuthUser> {
    // Mock signup - simulate API call
    return of(null).pipe(
      delay(1000),
      map(() => {
        // Check if user already exists
        const existingUser = this.mockUsers.find(u => u.email === signupData.email);
        if (existingUser) {
          throw new Error('Email already registered');
        }

        // Validate password match
        if (signupData.password !== signupData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Create new user
        const newUser: AuthUser = {
          id: Date.now().toString(),
          fullName: signupData.fullName,
          email: signupData.email,
          avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          joinDate: new Date().toISOString()
        };

        // Add to mock database
        this.mockUsers.push(newUser);

        // Store user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        this.currentUserSubject.next(newUser);
        this.isAuthenticatedSubject.next(true);

        return newUser;
      })
    );
  }

  logout(): void {
    // Remove user from storage
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<boolean> {
    // Mock forgot password - simulate API call
    return of(true).pipe(
      delay(1000),
      map(() => {
        // In real app, this would send a password reset email
        console.log(`Password reset email sent to: ${email}`);
        return true;
      })
    );
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedValue;
  }

  getToken(): string | null {
    // Mock token - in real app, this would be a JWT token
    const user = this.currentUserValue;
    return user ? `mock-token-${user.id}` : null;
  }
}





