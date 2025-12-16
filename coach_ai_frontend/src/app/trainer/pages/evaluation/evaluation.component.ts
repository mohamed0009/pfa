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

  viewDetail(id: string, type: 'exercise' | 'quiz'): void {
    if (type === 'exercise') {
      this.router.navigate(['/trainer/evaluation/exercise-reviews', id]);
    } else {
      this.router.navigate(['/trainer/evaluation/quiz-reviews', id]);
    }
  }

  startReview(id: string, type: 'exercise' | 'quiz'): void {
    console.log('Starting review:', id, type);
    this.viewDetail(id, type);
  }

  addFeedback(id: string): void {
    console.log('Adding feedback for quiz:', id);
    this.router.navigate(['/trainer/evaluation/quiz-reviews', id]);
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
}



