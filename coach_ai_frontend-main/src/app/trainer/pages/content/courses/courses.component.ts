import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerCourse } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1><span class="material-icons">menu_book</span> Mes Cours</h1>
        <button class="btn btn-primary"><span class="material-icons">add</span> Nouveau Cours</button>
      </header>
      <div class="courses-grid">
        <div *ngFor="let course of courses" class="course-card">
          <div class="course-header">
            <h3>{{ course.title }}</h3>
            <span class="status-badge" [class]="course.status">{{ getStatusLabel(course.status) }}</span>
          </div>
          <p>{{ course.description }}</p>
          <div class="course-stats">
            <span><span class="material-icons">schedule</span> {{ course.duration }}h</span>
            <span><span class="material-icons">people</span> {{ course.enrolledStudents }} inscrits</span>
          </div>
          <div class="course-actions">
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
    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .course-card { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .course-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .course-header h3 { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.published { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .status-badge.draft { background: rgba(156, 163, 175, 0.1); color: #6b7280; }
    .course-card > p { color: #64748b; font-size: 0.875rem; margin-bottom: 1rem; }
    .course-stats { display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.875rem; color: #64748b; }
    .course-stats span { display: flex; align-items: center; gap: 0.25rem; }
    .course-stats .material-icons { font-size: 16px; }
    .course-actions { display: flex; gap: 0.75rem; }
    .course-actions .btn { flex: 1; justify-content: center; padding: 0.75rem; font-size: 0.875rem; }`]
})
export class CoursesComponent implements OnInit {
  courses: TrainerCourse[] = [];

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.trainerService.getTrainerCourses().subscribe(courses => {
      this.courses = courses;
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



