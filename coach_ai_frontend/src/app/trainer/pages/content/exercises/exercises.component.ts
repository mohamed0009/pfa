import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerExercise, TrainerCourse, DifficultyLevel } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss']
})
export class ExercisesComponent implements OnInit {
  exercises: TrainerExercise[] = [];
  courses: TrainerCourse[] = [];
  filteredExercises: TrainerExercise[] = [];
  isLoading = true;
  searchTerm = '';
  selectedCourse = 'all';
  selectedDifficulty = 'all';
  
  // Modal de création
  showCreateModal = false;
  isCreating = false;
  newExercise = {
    title: '',
    description: '',
    instructions: '',
    difficulty: 'Moyen' as DifficultyLevel,
    estimatedTime: 30,
    courseId: '',
    type: 'PRATIQUE' as 'PRATIQUE' | 'SIMULATION' | 'PROJET' | 'CODE'
  };

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadExercises();
    this.loadCourses();
  }

  private loadExercises(): void {
    this.isLoading = true;
    this.trainerService.getTrainerExercises().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.filteredExercises = exercises;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exercises:', error);
        this.exercises = [];
        this.filteredExercises = [];
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

  filterExercises(): void {
    this.filteredExercises = this.exercises.filter(exercise => {
      const matchesSearch = exercise.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (exercise.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCourse = this.selectedCourse === 'all' || exercise.courseId === this.selectedCourse;
      const matchesDifficulty = this.selectedDifficulty === 'all' || exercise.difficulty === this.selectedDifficulty;
      return matchesSearch && matchesCourse && matchesDifficulty;
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newExercise = {
      title: '',
      description: '',
      instructions: '',
      difficulty: 'Moyen',
      estimatedTime: 30,
      courseId: this.courses.length > 0 ? this.courses[0].id : '',
      type: 'PRATIQUE'
    };
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createExercise(): void {
    if (!this.newExercise.title.trim() || !this.newExercise.courseId) {
      alert('Le titre et le cours sont requis');
      return;
    }

    this.isCreating = true;
    const exerciseData: any = {
      title: this.newExercise.title,
      description: this.newExercise.description,
      instructions: this.newExercise.instructions,
      difficulty: this.newExercise.difficulty.toUpperCase(),
      estimatedTime: this.newExercise.estimatedTime,
      courseId: this.newExercise.courseId,
      type: this.newExercise.type
    };

    this.trainerService.createExercise(exerciseData).subscribe({
      next: (exercise) => {
        this.exercises.unshift(exercise);
        this.filteredExercises = [...this.exercises];
        this.closeCreateModal();
        this.isCreating = false;
      },
      error: (error) => {
        console.error('Error creating exercise:', error);
        alert('Erreur lors de la création de l\'exercice');
        this.isCreating = false;
      }
    });
  }

  deleteExercise(exerciseId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
      this.trainerService.deleteExercise(exerciseId).subscribe({
        next: () => {
          this.exercises = this.exercises.filter(e => e.id !== exerciseId);
          this.filteredExercises = this.filteredExercises.filter(e => e.id !== exerciseId);
        },
        error: (error) => {
          console.error('Error deleting exercise:', error);
          alert('Erreur lors de la suppression de l\'exercice');
        }
      });
    }
  }

  getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
      'Facile': '#10b981',
      'Moyen': '#f59e0b',
      'Difficile': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  }
}
