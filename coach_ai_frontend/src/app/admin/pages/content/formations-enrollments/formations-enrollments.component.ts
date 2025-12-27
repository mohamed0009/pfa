import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentManagementService } from '../../../services/content-management.service';

interface Formation {
  id: string;
  title: string;
  enrolledCount: number;
}

interface Enrollment {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  enrolledAt: Date;
  status: string;
  overallProgress: number;
  completedModules: number;
  totalModules: number;
  averageQuizScore: number;
}

@Component({
  selector: 'app-formations-enrollments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './formations-enrollments.component.html',
  styleUrls: ['./formations-enrollments.component.scss']
})
export class FormationsEnrollmentsComponent implements OnInit {
  formations: Formation[] = [];
  selectedFormation: Formation | null = null;
  enrollments: Enrollment[] = [];
  isLoading = false;
  isLoadingEnrollments = false;

  constructor(private contentService: ContentManagementService) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  private loadFormations(): void {
    this.isLoading = true;
    this.contentService.getAllFormations().subscribe({
      next: (formations) => {
        this.formations = formations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.formations = [];
        this.isLoading = false;
      }
    });
  }

  selectFormation(formation: Formation): void {
    this.selectedFormation = formation;
    this.loadEnrollments(formation.id);
  }

  private loadEnrollments(formationId: string): void {
    this.isLoadingEnrollments = true;
    this.contentService.getFormationEnrollments(formationId).subscribe({
      next: (enrollments) => {
        this.enrollments = enrollments;
        this.isLoadingEnrollments = false;
      },
      error: (error) => {
        console.error('Error loading enrollments:', error);
        this.enrollments = [];
        this.isLoadingEnrollments = false;
      }
    });
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

  getTotalEnrollments(): number {
    return this.enrollments.length;
  }

  getAverageProgress(): number {
    if (this.enrollments.length === 0) return 0;
    const total = this.enrollments.reduce((sum, e) => sum + e.overallProgress, 0);
    return Math.round(total / this.enrollments.length);
  }

  getCompletedCount(): number {
    return this.enrollments.filter(e => e.overallProgress === 100).length;
  }
}

