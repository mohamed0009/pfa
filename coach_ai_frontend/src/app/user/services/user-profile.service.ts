import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { UserProfile, LearningPreferences } from '../models/user.interfaces';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'http://localhost:8081/api/user/profile';
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private logger: LoggerService
  ) {
    // Load user profile only if authenticated
    this.authService.isAuthenticated.subscribe(isAuth => {
      if (isAuth) {
        this.getUserProfile().subscribe({
          error: (err) => {
            // Silently fail if not authenticated yet
            this.logger.debug('User profile not loaded yet', err);
          }
        });
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  // Récupérer le profil utilisateur
  /**
   * Change le mot de passe de l'utilisateur
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/password`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError((error) => {
        this.logger.error('Error changing password', error);
        return throwError(() => error);
      })
    );
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((user: any) => {
        const profile: UserProfile = {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatarUrl: user.avatarUrl || `https://i.pravatar.cc/150?img=5`,
          formation: user.formation || '',
          niveau: user.niveau || 'Débutant',
          preferences: {
            learningPace: 'Modéré',
            preferredContentTypes: ['Vidéo', 'Exercice Pratique', 'Quiz'],
            studyTimePreference: 'Soir',
            notificationsEnabled: true,
            weeklyGoalHours: 10
          },
          joinedAt: user.joinedAt ? new Date(user.joinedAt) : new Date(),
          lastActive: user.lastActive ? new Date(user.lastActive) : new Date()
        };
        this.currentUserSubject.next(profile);
        return profile;
      }),
      catchError((error) => {
        this.logger.error('Error fetching user profile', error);
        return throwError(() => error);
      })
    );
  }

  // Mettre à jour le profil
  updateProfile(updates: Partial<UserProfile>): Observable<UserProfile> {
    const updateData: any = {};
    if (updates.firstName) updateData.firstName = updates.firstName;
    if (updates.lastName) updateData.lastName = updates.lastName;
    if (updates.formation) updateData.formation = updates.formation;
    if (updates.niveau) updateData.niveau = updates.niveau;
    if (updates.avatarUrl) updateData.avatarUrl = updates.avatarUrl;

    return this.http.put<any>(this.apiUrl, updateData).pipe(
      map((user: any) => {
        const profile: UserProfile = {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatarUrl: user.avatarUrl || `https://i.pravatar.cc/150?img=5`,
          formation: user.formation || '',
          niveau: user.niveau || 'Débutant',
          preferences: {
            learningPace: 'Modéré',
            preferredContentTypes: ['Vidéo', 'Exercice Pratique', 'Quiz'],
            studyTimePreference: 'Soir',
            notificationsEnabled: true,
            weeklyGoalHours: 10
          },
          joinedAt: user.joinedAt ? new Date(user.joinedAt) : new Date(),
          lastActive: user.lastActive ? new Date(user.lastActive) : new Date()
        };
        this.currentUserSubject.next(profile);
        return profile;
      }),
      catchError((error) => {
        this.logger.error('Error updating profile', error);
        return throwError(() => error);
      })
    );
  }

  // Mettre à jour les préférences
  updatePreferences(preferences: Partial<LearningPreferences>): Observable<UserProfile> {
    const current = this.currentUserSubject.value;
    if (!current) {
      return throwError(() => new Error('No user profile loaded'));
    }
    const updated = { ...current, preferences: { ...current.preferences, ...preferences } };
    this.currentUserSubject.next(updated);
    return this.updateProfile(updated);
  }

  // Changer l'avatar
  updateAvatar(avatarUrl: string): Observable<UserProfile> {
    return this.updateProfile({ avatarUrl });
  }

  // Récupérer l'utilisateur actuel (sync)
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }
}




