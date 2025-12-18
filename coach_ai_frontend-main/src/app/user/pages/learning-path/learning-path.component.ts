import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LearningPathService } from '../../services/learning-path.service';
import { LearningPath } from '../../models/user.interfaces';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="learning-path-page">
      <h1>Mon Parcours d'Apprentissage</h1>
      <div class="progress-header" *ngIf="learningPath">
        <h2>{{ learningPath.formation }}</h2>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="learningPath.progressPercentage"></div>
        </div>
        <p>{{ learningPath.progressPercentage }}% complété - {{ getCompletedModules() }} modules sur {{ learningPath.modules.length }}</p>
      </div>

      <div class="modules-grid">
        <div class="module-card" *ngFor="let module of learningPath?.modules" [class]="'status-' + module.status">
          <div class="module-header">
            <span class="material-icons">{{ getModuleIcon(module.status) }}</span>
            <div>
              <h3>{{ module.title }}</h3>
              <p>{{ module.description }}</p>
            </div>
          </div>
          <div class="module-progress">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="module.progressPercentage"></div>
            </div>
            <span>{{ module.progressPercentage }}%</span>
          </div>
          <div class="module-footer">
            <span><span class="material-icons">schedule</span> {{ module.estimatedDuration }}h</span>
            <span><span class="material-icons">school</span> {{ module.lessons.length }} leçons</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .learning-path-page { max-width: 1200px; margin: 0 auto; }
    .progress-header { background: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .progress-bar { width: 100%; height: 12px; background: #f3f4f6; border-radius: 6px; overflow: hidden; margin: 16px 0; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.6s ease; }
    .modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
    .module-card { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .module-card.status-locked { opacity: 0.6; }
    .module-card.status-completed { border-left: 4px solid #10b981; }
    .module-card.status-in_progress { border-left: 4px solid #f59e0b; }
    .module-header { display: flex; gap: 16px; margin-bottom: 20px; }
    .module-header .material-icons { font-size: 40px; color: #10b981; }
    .module-header h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
    .module-header p { font-size: 0.9rem; color: #6b7280; }
    .module-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .module-progress .progress-bar { flex: 1; height: 8px; }
    .module-footer { display: flex; gap: 20px; font-size: 0.85rem; color: #6b7280; }
    .module-footer span { display: flex; align-items: center; gap: 6px; }
    .module-footer .material-icons { font-size: 18px; }
    h1 { margin-bottom: 24px; }
  `]
})
export class LearningPathComponent implements OnInit {
  learningPath: LearningPath | null = null;

  constructor(private learningPathService: LearningPathService) {}

  ngOnInit(): void {
    this.learningPathService.getLearningPath().subscribe(path => this.learningPath = path);
  }

  getModuleIcon(status: string): string {
    switch(status) {
      case 'completed': return 'check_circle';
      case 'in_progress': return 'play_circle';
      case 'available': return 'radio_button_unchecked';
      case 'locked': return 'lock';
      default: return 'circle';
    }
  }

  getCompletedModules(): number {
    return this.learningPath?.modules.filter(m => m.status === 'completed').length || 0;
  }
}




