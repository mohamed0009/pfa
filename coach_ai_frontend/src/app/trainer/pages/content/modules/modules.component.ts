import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerModule } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1><span class="material-icons">library_books</span> Mes Modules</h1>
        <button class="btn btn-primary">
          <span class="material-icons">add</span>
          Nouveau Module
        </button>
      </header>

      <div class="modules-grid">
        <div *ngFor="let module of modules" class="module-card">
          <div class="module-header">
            <h3>{{ module.title }}</h3>
            <span class="status-badge" [class]="module.status">{{ getStatusLabel(module.status) }}</span>
          </div>
          <p>{{ module.description }}</p>
          <div class="module-stats">
            <span><span class="material-icons">book</span> {{ (module.coursesCount ?? (module.courses?.length ?? 0)) }} cours</span>
            <span><span class="material-icons">schedule</span> {{ module.estimatedDuration || module.duration }}h</span>
            <span><span class="material-icons">people</span> {{ module.enrolledStudents || 0 }} inscrits</span>
          </div>
          <div class="module-actions">
            <button class="btn btn-secondary"><span class="material-icons">edit</span> Modifier</button>
            <button class="btn btn-primary"><span class="material-icons">visibility</span> Voir</button>
          </div>
        </div>
      </div>

      <div *ngIf="modules.length === 0" class="empty-state">
        <span class="material-icons">library_books</span>
        <h3>Aucun module</h3>
        <p>Créez votre premier module pédagogique</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { display: flex; align-items: center; gap: 0.75rem; font-size: 2rem; font-weight: 700; color: #1e293b; }
    .material-icons { color: #3b82f6; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
    .btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .module-card { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .module-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .module-header h3 { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.published { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .status-badge.draft { background: rgba(156, 163, 175, 0.1); color: #6b7280; }
    .module-card > p { color: #64748b; font-size: 0.875rem; margin-bottom: 1rem; }
    .module-stats { display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.875rem; color: #64748b; }
    .module-stats span { display: flex; align-items: center; gap: 0.25rem; }
    .module-stats .material-icons { font-size: 16px; }
    .module-actions { display: flex; gap: 0.75rem; }
    .module-actions .btn { flex: 1; justify-content: center; padding: 0.75rem; font-size: 0.875rem; }
    .empty-state { text-align: center; padding: 4rem; background: white; border-radius: 16px; }
    .empty-state .material-icons { font-size: 64px; color: #cbd5e1; margin-bottom: 1rem; }
    .empty-state h3 { font-size: 1.5rem; font-weight: 600; color: #1e293b; }
    .empty-state p { color: #64748b; }
  `]
})
export class ModulesComponent implements OnInit {
  modules: TrainerModule[] = [];

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.trainerService.getTrainerModules().subscribe(modules => {
      this.modules = modules;
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



