import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrainerService } from '../../../services/trainer.service';

interface FormationStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  enrollmentId: string;
  enrolledAt: Date;
  status: string;
  overallProgress: number;
  completedModules: number;
  totalModules: number;
  completedLessons: number;
  totalLessons: number;
  averageQuizScore: number;
  lastActivityDate?: Date;
  modulesProgress: any[];
}

@Component({
  selector: 'app-formation-students',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './formation-students.component.html',
  styleUrls: ['./formation-students.component.scss']
})
export class FormationStudentsComponent implements OnInit {
  formationId: string = '';
  formationTitle: string = '';
  students: FormationStudent[] = [];
  isLoading = true;
  expandedStudentId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private trainerService: TrainerService
  ) {}

  ngOnInit(): void {
    this.formationId = this.route.snapshot.paramMap.get('id') || '';
    if (this.formationId) {
      this.loadFormationInfo();
      this.loadStudents();
    }
  }

  private loadFormationInfo(): void {
    this.trainerService.getFormationById(this.formationId).subscribe({
      next: (formation) => {
        this.formationTitle = formation.title;
      },
      error: (error) => {
        console.error('Error loading formation:', error);
      }
    });
  }

  private loadStudents(): void {
    this.isLoading = true;
    this.trainerService.getFormationStudents(this.formationId).subscribe({
      next: (students) => {
        this.students = students;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.students = [];
        this.isLoading = false;
      }
    });
  }

  toggleStudent(studentId: string): void {
    this.expandedStudentId = this.expandedStudentId === studentId ? null : studentId;
  }

  isStudentExpanded(studentId: string): boolean {
    return this.expandedStudentId === studentId;
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 30) return '#f59e0b';
    return '#ef4444';
  }

  getStatusBadge(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Actif',
      'COMPLETED': 'Terminé',
      'DROPPED': 'Abandonné',
      'EN_COURS': 'En cours'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'ACTIVE': '#3b82f6',
      'COMPLETED': '#10b981',
      'DROPPED': '#ef4444',
      'EN_COURS': '#3b82f6'
    };
    return colorMap[status] || '#6b7280';
  }

  viewStudentDetails(studentId: string): void {
    this.router.navigate(['/trainer/students', studentId]);
  }

  getAverageProgress(): number {
    if (this.students.length === 0) return 0;
    const total = this.students.reduce((sum, s) => sum + s.overallProgress, 0);
    return Math.round(total / this.students.length);
  }

  getCompletedCount(): number {
    return this.students.filter(s => s.overallProgress === 100).length;
  }
}

