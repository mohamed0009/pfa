import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerExercise } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1><span class="material-icons">assignment</span> Mes Exercices</h1>
        <button class="btn btn-primary"><span class="material-icons">add</span> Nouvel Exercice</button>
      </header>
      <div class="exercises-grid">
        <div *ngFor="let exercise of exercises" class="exercise-card">
          <div class="exercise-header">
            <h3>{{ exercise.title }}</h3>
            <span class="difficulty-badge" [class]="exercise.difficulty.toLowerCase()">{{ exercise.difficulty }}</span>
          </div>
          <p>{{ exercise.description }}</p>
          <div class="exercise-stats">
            <span><span class="material-icons">schedule</span> {{ exercise.estimatedTime }} min</span>
            <span><span class="material-icons">check_circle</span> {{ exercise.submissions?.length || 0 }} soumissions</span>
          </div>
          <div class="exercise-actions">
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
    .exercises-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .exercise-card { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .exercise-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .exercise-header h3 { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0; }
    .difficulty-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .difficulty-badge.facile { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .difficulty-badge.moyen { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .difficulty-badge.difficile { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .exercise-card > p { color: #64748b; font-size: 0.875rem; margin-bottom: 1rem; }
    .exercise-stats { display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.875rem; color: #64748b; }
    .exercise-stats span { display: flex; align-items: center; gap: 0.25rem; }
    .exercise-stats .material-icons { font-size: 16px; }
    .exercise-actions { display: flex; gap: 0.75rem; }
    .exercise-actions .btn { flex: 1; justify-content: center; padding: 0.75rem; font-size: 0.875rem; }`]
})
export class ExercisesComponent implements OnInit {
  exercises: TrainerExercise[] = [];

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.trainerService.getTrainerExercises().subscribe(exercises => {
      this.exercises = exercises;
    });
  }
}



