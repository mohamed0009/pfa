import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerQuiz, TrainerCourse, DifficultyLevel } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-quizzes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.scss']
})
export class QuizzesComponent implements OnInit {
  quizzes: TrainerQuiz[] = [];
  courses: TrainerCourse[] = [];
  filteredQuizzes: TrainerQuiz[] = [];
  isLoading = true;
  searchTerm = '';
  selectedCourse = 'all';
  
  // Modal de création
  showCreateModal = false;
  isCreating = false;
  newQuiz = {
    title: '',
    description: '',
    difficulty: 'Moyen' as DifficultyLevel,
    duration: 30,
    passingScore: 60,
    maxAttempts: 3,
    courseId: ''
  };

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadQuizzes();
    this.loadCourses();
  }

  private loadQuizzes(): void {
    this.isLoading = true;
    this.trainerService.getTrainerQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.filteredQuizzes = quizzes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
        this.quizzes = [];
        this.filteredQuizzes = [];
        this.isLoading = false;
      }
    });
  }

  private loadCourses(): void {
    this.trainerService.getTrainerCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.courses = [];
      }
    });
  }

  filterQuizzes(): void {
    this.filteredQuizzes = this.quizzes.filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (quiz.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCourse = this.selectedCourse === 'all' || quiz.courseId === this.selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newQuiz = {
      title: '',
      description: '',
      difficulty: 'Moyen',
      duration: 30,
      passingScore: 60,
      maxAttempts: 3,
      courseId: this.courses.length > 0 ? this.courses[0].id : ''
    };
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createQuiz(): void {
    if (!this.newQuiz.title.trim() || !this.newQuiz.courseId) {
      alert('Le titre et le cours sont requis');
      return;
    }

    this.isCreating = true;
    const quizData: any = {
      title: this.newQuiz.title,
      description: this.newQuiz.description,
      difficulty: this.newQuiz.difficulty.toUpperCase(),
      duration: this.newQuiz.duration,
      passingScore: this.newQuiz.passingScore,
      maxAttempts: this.newQuiz.maxAttempts,
      courseId: this.newQuiz.courseId
    };

    this.trainerService.createQuiz(quizData).subscribe({
      next: (quiz) => {
        this.quizzes.unshift(quiz);
        this.filteredQuizzes = [...this.quizzes];
        this.closeCreateModal();
        this.isCreating = false;
      },
      error: (error) => {
        console.error('Error creating quiz:', error);
        alert('Erreur lors de la création du quiz');
        this.isCreating = false;
      }
    });
  }

  deleteQuiz(quizId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      this.trainerService.deleteQuiz(quizId).subscribe({
        next: () => {
          this.quizzes = this.quizzes.filter(q => q.id !== quizId);
          this.filteredQuizzes = this.filteredQuizzes.filter(q => q.id !== quizId);
        },
        error: (error) => {
          console.error('Error deleting quiz:', error);
          alert('Erreur lors de la suppression du quiz');
        }
      });
    }
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

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'draft': '#6b7280',
      'pending': '#f59e0b',
      'approved': '#10b981',
      'published': '#3b82f6',
      'rejected': '#ef4444',
      'archived': '#9ca3af'
    };
    return colors[status] || '#6b7280';
  }
}
