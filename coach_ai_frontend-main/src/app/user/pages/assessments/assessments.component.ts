import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service';
import { Quiz, Exercise } from '../../models/user.interfaces';

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="assessments-page">
      <h1>Quiz & Exercices</h1>
      
      <div class="section">
        <h2><span class="material-icons">quiz</span> Quiz Disponibles</h2>
        <div class="items-grid">
          <div class="item-card" *ngFor="let quiz of quizzes">
            <div class="item-header">
              <span class="badge" [class]="'badge-' + quiz.difficulty.toLowerCase()">{{ quiz.difficulty }}</span>
              <span class="badge-ai" *ngIf="quiz.isAIGenerated"><span class="material-icons">psychology</span> IA</span>
            </div>
            <h3>{{ quiz.title }}</h3>
            <p>{{ quiz.description }}</p>
            <div class="item-meta">
              <span><span class="material-icons">schedule</span> {{ quiz.duration }} min</span>
              <span><span class="material-icons">help</span> {{ quiz.questionsCount }} questions</span>
            </div>
            <button class="btn btn-primary">Commencer</button>
          </div>
        </div>
      </div>

      <div class="section">
        <h2><span class="material-icons">assignment</span> Exercices Pratiques</h2>
        <div class="items-grid">
          <div class="item-card" *ngFor="let exercise of exercises">
            <div class="item-header">
              <span class="badge" [class]="'badge-' + exercise.difficulty.toLowerCase()">{{ exercise.difficulty }}</span>
              <span class="status-badge" [class]="'status-' + exercise.status">{{ getStatusLabel(exercise.status) }}</span>
            </div>
            <h3>{{ exercise.title }}</h3>
            <p>{{ exercise.description }}</p>
            <div class="item-meta">
              <span><span class="material-icons">schedule</span> {{ exercise.estimatedTime }} min</span>
              <span><span class="material-icons">code</span> {{ exercise.type }}</span>
            </div>
            <button class="btn" [class.btn-primary]="exercise.status === 'not_started'" [class.btn-secondary]="exercise.status !== 'not_started'">
              {{ exercise.status === 'not_started' ? 'Commencer' : 'Continuer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assessments-page { max-width: 1200px; margin: 0 auto; }
    .section { margin-bottom: 48px; }
    .section h2 { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; font-size: 1.5rem; }
    .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .item-card { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .item-header { display: flex; gap: 8px; margin-bottom: 16px; }
    .badge { padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge-facile { background: #d1fae5; color: #065f46; }
    .badge-moyen { background: #fef3c7; color: #92400e; }
    .badge-difficile { background: #fee2e2; color: #991b1b; }
    .badge-ai { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
    .badge-ai .material-icons { font-size: 14px; }
    .status-badge { padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
    .status-not_started { background: #e5e7eb; color: #374151; }
    .status-in_progress { background: #fef3c7; color: #92400e; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .status-reviewed { background: #d1fae5; color: #065f46; }
    .item-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 12px; }
    .item-card p { color: #6b7280; margin-bottom: 16px; line-height: 1.6; }
    .item-meta { display: flex; gap: 16px; margin-bottom: 20px; font-size: 0.85rem; color: #6b7280; }
    .item-meta span { display: flex; align-items: center; gap: 6px; }
    .item-meta .material-icons { font-size: 18px; }
    .btn { width: 100%; padding: 12px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
    .btn-primary { background: #10b981; color: white; }
    .btn-primary:hover { background: #059669; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }
    h1 { margin-bottom: 32px; }
  `]
})
export class AssessmentsComponent implements OnInit {
  quizzes: Quiz[] = [];
  exercises: Exercise[] = [];

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.getQuizzes().subscribe(q => this.quizzes = q);
    this.quizService.getExercises().subscribe(e => this.exercises = e);
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'not_started': 'Non démarré',
      'in_progress': 'En cours',
      'submitted': 'Soumis',
      'reviewed': 'Évalué'
    };
    return labels[status] || status;
  }
}




