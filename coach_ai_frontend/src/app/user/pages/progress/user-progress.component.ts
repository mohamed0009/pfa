import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProgressService } from '../../services/user-progress.service';
import { UserProgress, LearningStats } from '../../models/user.interfaces';

@Component({
  selector: 'app-user-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-page">
      <h1>Ma Progression</h1>
      
      <div class="stats-grid">
        <div class="stat-card">
          <span class="material-icons">school</span>
          <div><h3>{{ progress?.modulesCompleted }}/{{ progress?.totalModules }}</h3><p>Modules complétés</p></div>
        </div>
        <div class="stat-card">
          <span class="material-icons">quiz</span>
          <div><h3>{{ progress?.averageQuizScore }}%</h3><p>Score moyen quiz</p></div>
        </div>
        <div class="stat-card">
          <span class="material-icons">schedule</span>
          <div><h3>{{ progress?.totalStudyTime }}h</h3><p>Temps d'étude total</p></div>
        </div>
        <div class="stat-card">
          <span class="material-icons">local_fire_department</span>
          <div><h3>{{ progress?.currentStreak }}</h3><p>Jours consécutifs</p></div>
        </div>
      </div>

      <div class="achievements-section">
        <h2>🏆 Succès Débloqués</h2>
        <div class="achievements-grid">
          <div class="achievement-card" *ngFor="let achievement of progress?.achievements">
            <span class="material-icons">{{ achievement.icon }}</span>
            <h3>{{ achievement.title }}</h3>
            <p>{{ achievement.description }}</p>
            <span class="achievement-date">{{ achievement.earnedAt | date:'short' }}</span>
          </div>
        </div>
      </div>

      <div class="activity-section">
        <h2>📊 Activité Récente</h2>
        <div class="activity-list">
          <div class="activity-item" *ngFor="let activity of progress?.recentActivity">
            <span class="material-icons activity-icon">
              {{ activity.type === 'lesson_completed' ? 'check_circle' :
                 activity.type === 'quiz_passed' ? 'psychology' :
                 activity.type === 'exercise_submitted' ? 'assignment_turned_in' : 'school' }}
            </span>
            <div class="activity-content">
              <strong>{{ activity.title }}</strong>
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-page { max-width: 1200px; margin: 0 auto; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card { background: white; padding: 24px; border-radius: 16px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .stat-card .material-icons { font-size: 48px; color: #10b981; }
    .stat-card h3 { font-size: 2rem; font-weight: 700; }
    .stat-card p { font-size: 0.9rem; color: #6b7280; }
    .achievements-section, .activity-section { background: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .achievements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .achievement-card { text-align: center; padding: 24px; background: #f3f4f6; border-radius: 12px; }
    .achievement-card .material-icons { font-size: 48px; color: #10b981; margin-bottom: 12px; }
    .achievement-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
    .achievement-card p { font-size: 0.85rem; color: #6b7280; margin-bottom: 8px; }
    .achievement-date { font-size: 0.75rem; color: #9ca3af; }
    .activity-list { display: flex; flex-direction: column; gap: 16px; }
    .activity-item { display: flex; gap: 16px; padding: 16px; background: #f3f4f6; border-radius: 12px; }
    .activity-icon { font-size: 32px; color: #10b981; }
    .activity-content strong { display: block; font-size: 0.95rem; margin-bottom: 4px; }
    .activity-content p { font-size: 0.85rem; color: #6b7280; margin-bottom: 6px; }
    .activity-time { font-size: 0.75rem; color: #9ca3af; }
    h1, h2 { margin-bottom: 24px; }
  `]
})
export class UserProgressComponent implements OnInit {
  progress: UserProgress | null = null;
  stats: LearningStats | null = null;

  constructor(private progressService: UserProgressService) {}

  ngOnInit(): void {
    this.progressService.getUserProgress().subscribe(p => this.progress = p);
    this.progressService.getLearningStats().subscribe(s => this.stats = s);
  }
}




