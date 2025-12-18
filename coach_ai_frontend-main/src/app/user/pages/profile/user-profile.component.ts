import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfileService } from '../../services/user-profile.service';
import { UserProfile } from '../../models/user.interfaces';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <h1>Mon Profil</h1>
      <div class="profile-card" *ngIf="profile">
        <div class="profile-header">
          <img [src]="profile.avatarUrl" [alt]="profile.firstName" class="profile-avatar">
          <div>
            <h2>{{ profile.firstName }} {{ profile.lastName }}</h2>
            <p>{{ profile.email }}</p>
          </div>
        </div>
        <div class="profile-info">
          <div class="info-item">
            <label>Formation</label>
            <p>{{ profile.formation }}</p>
          </div>
          <div class="info-item">
            <label>Niveau</label>
            <p>{{ profile.niveau }}</p>
          </div>
          <div class="info-item">
            <label>Rythme d'apprentissage</label>
            <p>{{ profile.preferences.learningPace }}</p>
          </div>
          <div class="info-item">
            <label>Objectif hebdomadaire</label>
            <p>{{ profile.preferences.weeklyGoalHours }} heures</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { max-width: 800px; margin: 0 auto; }
    .profile-card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .profile-header { display: flex; gap: 20px; align-items: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #f3f4f6; }
    .profile-avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; }
    .profile-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .info-item label { font-weight: 600; color: #374151; display: block; margin-bottom: 8px; }
    .info-item p { color: #6b7280; }
    h1 { margin-bottom: 24px; }
    h2 { font-size: 1.5rem; font-weight: 700; }
  `]
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile | null = null;

  constructor(private profileService: UserProfileService) {}

  ngOnInit(): void {
    this.profileService.getUserProfile().subscribe(p => this.profile = p);
  }
}




