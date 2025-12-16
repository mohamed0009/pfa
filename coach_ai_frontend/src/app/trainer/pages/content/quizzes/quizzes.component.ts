import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerQuiz } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-quizzes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1><span class="material-icons">quiz</span> Mes Quiz</h1>
        <button class="btn btn-primary"><span class="material-icons">add</span> Nouveau Quiz</button>
      </header>
      <div class="quizzes-grid">
        <div *ngFor="let quiz of quizzes" class="quiz-card">
          <div class="quiz-header">
            <h3>{{ quiz.title }}</h3>
            <span class="status-badge" [class]="quiz.status">{{ getStatusLabel(quiz.status) }}</span>
          </div>
          <p>{{ quiz.description }}</p>
          <div class="quiz-stats">
            <span><span class="material-icons">help</span> {{ quiz.questions?.length || 0 }} questions</span>
            <span><span class="material-icons">schedule</span> {{ quiz.duration }} min</span>
            <span><span class="material-icons">people</span> {{ quiz.attempts?.length || 0 }} tentatives</span>
          </div>
          <div class="quiz-actions">
            <button class="btn btn-secondary"><span class="material-icons">edit</span> Modifier</button>
            <button class="btn btn-primary"><span class="material-icons">visibility</span> Voir</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`.page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { display: flex; align-items: center; gap: 0.75rem; font-size: 2rem; font-weight: 700; color: #1e293b; }
    .material-icons { color: #3b82f6; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .quizzes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .quiz-card { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .quiz-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .quiz-header h3 { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.published { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .status-badge.draft { background: rgba(156, 163, 175, 0.1); color: #6b7280; }
    .quiz-card > p { color: #64748b; font-size: 0.875rem; margin-bottom: 1rem; }
    .quiz-stats { display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.875rem; color: #64748b; }
    .quiz-stats span { display: flex; align-items: center; gap: 0.25rem; }
    .quiz-stats .material-icons { font-size: 16px; }
    .quiz-actions { display: flex; gap: 0.75rem; }
    .quiz-actions .btn { flex: 1; justify-content: center; padding: 0.75rem; font-size: 0.875rem; }`]
})
export class QuizzesComponent implements OnInit {
  quizzes: TrainerQuiz[] = [];

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.trainerService.getTrainerQuizzes().subscribe(quizzes => {
      this.quizzes = quizzes;
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'draft': 'Brouillon',
      'pending': 'En attente',
      'approved': 'Approuvé',
      'published': 'Publié',
      'rejected': 'Rejeté',
      'archived': 'Archivé'
    };
    return labels[status] || status;
  }
}



