import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  estimatedTime: number; // minutes
  type: 'PRATIQUE' | 'SIMULATION' | 'PROJET' | 'CODE';
}

interface ExerciseSubmission {
  id: string;
  content: string;
  attachments: string[];
  status: 'SUBMITTED' | 'REVIEWED' | 'GRADED' | 'VALIDATED';
  feedback?: string;
  score?: number;
  maxScore?: number;
  submittedAt: Date;
}

@Component({
  selector: 'app-lab-player',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lab-player.component.html',
  styleUrl: './lab-player.component.scss'
})
export class LabPlayerComponent implements OnInit {
  exercise: Exercise | null = null;
  userContent: string = '';
  attachments: File[] = [];
  isSubmitting: boolean = false;
  isSubmitted: boolean = false;
  submission: ExerciseSubmission | null = null;
  showChatHelp: boolean = false;
  
  private apiUrl = 'http://localhost:8081/api/user/exercises';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const exerciseId = this.route.snapshot.paramMap.get('id');
    if (exerciseId) {
      this.loadExercise(exerciseId);
      this.loadSubmission(exerciseId);
    }
  }

  loadExercise(exerciseId: string): void {
    this.http.get<Exercise>(`${this.apiUrl}/${exerciseId}`).subscribe({
      next: (exercise) => {
        this.exercise = exercise;
        console.log('Exercise loaded:', exercise);
      },
      error: (error) => {
        console.error('Error loading exercise:', error);
      }
    });
  }

  loadSubmission(exerciseId: string): void {
    this.http.get<ExerciseSubmission>(`${this.apiUrl}/${exerciseId}/submission`).subscribe({
      next: (submission) => {
        if (submission) {
          this.submission = submission;
          this.userContent = submission.content;
          this.isSubmitted = true;
        }
      },
      error: (error) => {
        // Pas de soumission existante, c'est normal
        console.log('No existing submission');
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.attachments = Array.from(files);
    }
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }

  submitExercise(): void {
    if (!this.exercise || !this.userContent.trim()) {
      alert('Veuillez saisir votre réponse');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('content', this.userContent);
    formData.append('exerciseId', this.exercise.id);
    
    // Ajouter les fichiers
    this.attachments.forEach((file, index) => {
      formData.append(`attachments`, file);
    });

    this.http.post<ExerciseSubmission>(`${this.apiUrl}/${this.exercise.id}/submit`, formData).subscribe({
      next: (submission) => {
        this.submission = submission;
        this.isSubmitted = true;
        this.isSubmitting = false;
        console.log('Exercise submitted:', submission);
        alert('Exercice soumis avec succès! Votre formateur le corrigera prochainement.');
      },
      error: (error) => {
        console.error('Error submitting exercise:', error);
        this.isSubmitting = false;
        alert('Erreur lors de la soumission');
      }
    });
  }

  toggleChatHelp(): void {
    this.showChatHelp = !this.showChatHelp;
  }

  getDifficultyLabel(difficulty: string): string {
    const labels: { [key: string]: string } = {
      'FACILE': 'Facile',
      'MOYEN': 'Moyen',
      'DIFFICILE': 'Difficile'
    };
    return labels[difficulty] || difficulty;
  }

  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      'FACILE': '#28a745',
      'MOYEN': '#ffc107',
      'DIFFICILE': '#dc3545'
    };
    return colors[difficulty] || '#6c757d';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'PRATIQUE': 'Exercice Pratique',
      'SIMULATION': 'Simulation',
      'PROJET': 'Projet',
      'CODE': 'Exercice de Code'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'SUBMITTED': 'Soumis',
      'REVIEWED': 'En révision',
      'GRADED': 'Corrigé',
      'VALIDATED': 'Validé'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'SUBMITTED': '#ffc107',
      'REVIEWED': '#17a2b8',
      'GRADED': '#28a745',
      'VALIDATED': '#28a745'
    };
    return colors[status] || '#6c757d';
  }

  goBack(): void {
    this.router.navigate(['/user/dashboard']);
  }
}

