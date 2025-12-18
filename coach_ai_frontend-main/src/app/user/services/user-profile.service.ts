import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserProfile, LearningPreferences } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private mockUser: UserProfile = {
    id: 'user1',
    email: 'marie.dupont@example.com',
    firstName: 'Marie',
    lastName: 'Dupont',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    formation: 'Développement Web Full Stack',
    niveau: 'Intermédiaire',
    preferences: {
      learningPace: 'Modéré',
      preferredContentTypes: ['Vidéo', 'Exercice Pratique', 'Quiz'],
      studyTimePreference: 'Soir',
      notificationsEnabled: true,
      weeklyGoalHours: 10
    },
    joinedAt: new Date('2024-09-15'),
    lastActive: new Date()
  };

  constructor() {
    // Simuler un utilisateur connecté
    this.currentUserSubject.next(this.mockUser);
  }

  // Récupérer le profil utilisateur
  getUserProfile(): Observable<UserProfile> {
    return of(this.mockUser).pipe(delay(300));
  }

  // Mettre à jour le profil
  updateProfile(updates: Partial<UserProfile>): Observable<UserProfile> {
    this.mockUser = { ...this.mockUser, ...updates };
    this.currentUserSubject.next(this.mockUser);
    return of(this.mockUser).pipe(delay(400));
  }

  // Mettre à jour les préférences
  updatePreferences(preferences: Partial<LearningPreferences>): Observable<UserProfile> {
    this.mockUser.preferences = { ...this.mockUser.preferences, ...preferences };
    this.currentUserSubject.next(this.mockUser);
    return of(this.mockUser).pipe(delay(300));
  }

  // Changer l'avatar
  updateAvatar(avatarUrl: string): Observable<UserProfile> {
    this.mockUser.avatarUrl = avatarUrl;
    this.currentUserSubject.next(this.mockUser);
    return of(this.mockUser).pipe(delay(400));
  }

  // Récupérer l'utilisateur actuel (sync)
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }
}




