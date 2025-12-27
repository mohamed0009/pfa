import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../../services/trainer.service';
import { CourseRecommendation, DifficultyLevel } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-recommendation-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './recommendation-details.component.html',
  styleUrls: ['./recommendation-details.component.scss']
})
export class RecommendationDetailsComponent implements OnInit {
  recommendation: CourseRecommendation | null = null;
  isLoading = true;
  isProcessing = false;
  reviewNotes = '';
  public router: Router;

  constructor(
    private route: ActivatedRoute,
    router: Router,
    private trainerService: TrainerService
  ) {
    this.router = router;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRecommendation(id);
    }
  }

  private loadRecommendation(id: string): void {
    this.isLoading = true;
    this.trainerService.getRecommendationById(id).subscribe({
      next: (rec: any) => {
        this.recommendation = {
          id: rec.id,
          studentId: rec.student?.id || rec.studentId,
          studentName: rec.student ? `${rec.student.firstName || ''} ${rec.student.lastName || ''}`.trim() : '',
          studentEmail: rec.student?.email || '',
          courseId: rec.course?.id || rec.courseId,
          course: rec.course ? {
            id: rec.course.id,
            moduleId: rec.course.module?.id || '',
            title: rec.course.title,
            description: rec.course.description || '',
            content: rec.course.content || '',
            order: rec.course.order || 0,
            status: (rec.course.status || 'DRAFT').toLowerCase() as any,
            duration: rec.course.estimatedHours ? rec.course.estimatedHours * 60 : 0,
            difficulty: rec.course.level ? (rec.course.level.toLowerCase() === 'debutant' ? 'Facile' : rec.course.level.toLowerCase() === 'intermediaire' ? 'Moyen' : 'Difficile') as DifficultyLevel : 'Moyen' as DifficultyLevel,
            lessons: [],
            resources: [],
            exercises: [],
            quizzes: [],
            enrolledStudents: rec.course.enrolledStudents || 0,
            completionRate: rec.course.completionRate || 0,
            createdBy: rec.course.createdBy?.id || '',
            createdAt: rec.course.createdAt ? new Date(rec.course.createdAt) : new Date(),
            updatedAt: rec.course.updatedAt ? new Date(rec.course.updatedAt) : new Date(),
            category: rec.course.category || '',
            thumbnailUrl: rec.course.thumbnailUrl || ''
          } : undefined,
          reason: rec.reason || '',
          conversationExcerpt: rec.conversationExcerpt || '',
          confidenceScore: rec.confidenceScore || 0,
          status: rec.status || 'PENDING',
          reviewedBy: rec.reviewedBy?.id || rec.reviewedBy,
          reviewedAt: rec.reviewedAt ? new Date(rec.reviewedAt) : undefined,
          reviewNotes: rec.reviewNotes || '',
          createdAt: rec.createdAt ? new Date(rec.createdAt) : new Date(),
          updatedAt: rec.updatedAt ? new Date(rec.updatedAt) : new Date()
        };
        this.reviewNotes = this.recommendation?.reviewNotes || '';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recommendation:', error);
        this.isLoading = false;
      }
    });
  }

  acceptRecommendation(): void {
    if (!this.recommendation) return;
    
    this.isProcessing = true;
    this.trainerService.acceptRecommendation(this.recommendation.id, this.reviewNotes).subscribe({
      next: () => {
        this.router.navigate(['/trainer/recommendations']);
      },
      error: (error) => {
        console.error('Error accepting recommendation:', error);
        this.isProcessing = false;
        alert('Erreur lors de l\'acceptation de la recommandation');
      }
    });
  }

  rejectRecommendation(): void {
    if (!this.recommendation) return;
    
    this.isProcessing = true;
    this.trainerService.rejectRecommendation(this.recommendation.id, this.reviewNotes).subscribe({
      next: () => {
        this.router.navigate(['/trainer/recommendations']);
      },
      error: (error) => {
        console.error('Error rejecting recommendation:', error);
        this.isProcessing = false;
        alert('Erreur lors du rejet de la recommandation');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'ACCEPTED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      default: return '#64748b';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'ACCEPTED': return 'Acceptée';
      case 'REJECTED': return 'Rejetée';
      default: return status;
    }
  }

  getConfidenceColor(score: number): string {
    if (score >= 70) return '#10b981';
    if (score >= 50) return '#3b82f6';
    if (score >= 30) return '#f59e0b';
    return '#ef4444';
  }
}

