import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { TrainerFormation, ExerciseReview, QuizReview } from '../../models/trainer.interfaces';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent implements OnInit {
  activeTab: 'exercises' | 'quizzes' | 'pending' = 'exercises';
  
  formations: TrainerFormation[] = [];
  exerciseReviews: ExerciseReview[] = [];
  quizReviews: QuizReview[] = [];
  
  filteredExercises: ExerciseReview[] = [];
  filteredQuizzes: QuizReview[] = [];
  pendingItems: any[] = [];
  pendingReviews = 0;
  
  selectedFormation = 'all';
  selectedStatus = 'all';
  minScore = 0;
  searchTerm = '';
  isLoading = false;

  constructor(
    private trainerService: TrainerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    this.trainerService.getFormations().subscribe((formations: TrainerFormation[]) => {
      this.formations = formations;
    });

    this.trainerService.getExerciseReviews().subscribe((reviews: ExerciseReview[]) => {
      this.exerciseReviews = reviews;
      this.filteredExercises = reviews;
      this.updatePendingCount();
    });

    this.trainerService.getQuizReviews().subscribe((reviews: QuizReview[]) => {
      this.quizReviews = reviews;
      this.filteredQuizzes = reviews;
      this.updatePendingCount();
    });

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  filterResults(): void {
    // Filter exercises
    this.filteredExercises = this.exerciseReviews.filter(review => {
      const matchesFormation = this.selectedFormation === 'all' || review.formationId === this.selectedFormation;
      const matchesStatus = this.selectedStatus === 'all' || review.status === this.selectedStatus;
      const matchesSearch = review.studentName.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesFormation && matchesStatus && matchesSearch;
    });

    // Filter quizzes
    this.filteredQuizzes = this.quizReviews.filter(review => {
      const matchesFormation = this.selectedFormation === 'all' || review.formationId === this.selectedFormation;
      const matchesScore = review.score >= this.minScore;
      const matchesSearch = review.studentName.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesFormation && matchesScore && matchesSearch;
    });

    this.updatePendingItems();
  }

  updatePendingCount(): void {
    const pendingExercises = this.exerciseReviews.filter(r => r.status === 'pending').length;
    const pendingQuizzes = this.quizReviews.filter(r => !r.hasFeedback).length;
    this.pendingReviews = pendingExercises + pendingQuizzes;
  }

  updatePendingItems(): void {
    const exercises = this.exerciseReviews
      .filter(r => r.status === 'pending')
      .map(r => ({
        id: r.id,
        type: 'exercise',
        title: r.exerciseTitle || r.exerciseName,
        studentName: r.studentName,
        submittedAt: r.submittedAt,
        isUrgent: this.isUrgent(r.submittedAt)
      }));

    const quizzes = this.quizReviews
      .filter(r => r.hasFeedback === false || !r.feedback)
      .map(r => ({
        id: r.id,
        type: 'quiz',
        title: r.quizTitle || r.quizName,
        studentName: r.studentName,
        submittedAt: r.completedAt,
        isUrgent: this.isUrgent(r.completedAt)
      }));

    this.pendingItems = [...exercises, ...quizzes].sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  isUrgent(date: Date): boolean {
    const daysSince = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 3;
  }

  // Modal state
  showReviewModal = false;
  reviewModalType: 'exercise' | 'quiz' | null = null;
  selectedReview: ExerciseReview | QuizReview | null = null;
  reviewFeedback = '';
  reviewScore = 0;
  isSubmittingReview = false;

  viewDetail(id: string, type: 'exercise' | 'quiz'): void {
    if (type === 'exercise') {
      const review = this.exerciseReviews.find(r => r.id === id);
      if (review) {
        this.selectedReview = review;
        this.reviewModalType = 'exercise';
        this.reviewFeedback = review.feedback || '';
        this.reviewScore = review.score || 0;
        this.showReviewModal = true;
      }
    } else {
      const review = this.quizReviews.find(r => r.id === id);
      if (review) {
        this.selectedReview = review;
        this.reviewModalType = 'quiz';
        this.reviewFeedback = review.feedback || '';
        this.reviewScore = review.score || 0;
        this.showReviewModal = true;
      }
    }
  }

  startReview(id: string, type: 'exercise' | 'quiz'): void {
    this.viewDetail(id, type);
  }

  addFeedback(id: string): void {
    this.viewDetail(id, 'quiz');
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedReview = null;
    this.reviewModalType = null;
    this.reviewFeedback = '';
    this.reviewScore = 0;
  }

  submitReview(): void {
    if (!this.selectedReview || !this.reviewModalType) return;

    this.isSubmittingReview = true;

    if (this.reviewModalType === 'exercise') {
      const exerciseReview = this.selectedReview as ExerciseReview;
      this.trainerService.reviewExercise(exerciseReview.id, this.reviewFeedback, this.reviewScore).subscribe({
        next: () => {
          this.loadData();
          this.closeReviewModal();
          this.isSubmittingReview = false;
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          this.isSubmittingReview = false;
          alert('Erreur lors de la soumission de la correction');
        }
      });
    } else {
      const quizReview = this.selectedReview as QuizReview;
      this.trainerService.reviewQuiz(quizReview.id, this.reviewFeedback).subscribe({
        next: () => {
          this.loadData();
          this.closeReviewModal();
          this.isSubmittingReview = false;
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          this.isSubmittingReview = false;
          alert('Erreur lors de la soumission du feedback');
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'En attente',
      'reviewed': 'Corrigé',
      'graded': 'Noté',
      'validated': 'Validé'
    };
    return labels[status] || status;
  }

  getContentPreview(content: string): string {
    if (!content) return '';
    const maxLength = 100;
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  // Getters pour le template
  getSelectedExerciseReview(): ExerciseReview | null {
    return this.reviewModalType === 'exercise' ? (this.selectedReview as ExerciseReview) : null;
  }

  getSelectedQuizReview(): QuizReview | null {
    return this.reviewModalType === 'quiz' ? (this.selectedReview as QuizReview) : null;
  }

  getStudentName(): string {
    if (!this.selectedReview) return '';
    if (this.reviewModalType === 'exercise') {
      return (this.selectedReview as ExerciseReview).studentName;
    } else {
      return (this.selectedReview as QuizReview).studentName;
    }
  }

  getReviewTitle(): string {
    if (!this.selectedReview) return '';
    if (this.reviewModalType === 'exercise') {
      const review = this.selectedReview as ExerciseReview;
      return review.exerciseTitle || review.exerciseName || '';
    } else {
      const review = this.selectedReview as QuizReview;
      return review.quizTitle || review.quizName || '';
    }
  }
}



