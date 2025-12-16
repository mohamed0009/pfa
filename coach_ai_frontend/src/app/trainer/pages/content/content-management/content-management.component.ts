import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerFormation, TrainerModule, TrainerCourse, TrainerExercise, TrainerQuiz } from '../../../models/trainer.interfaces';

interface ContentSummary {
  formations: number;
  modules: number;
  courses: number;
  exercises: number;
  quizzes: number;
  pendingValidation: number;
}

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.scss']
})
export class ContentManagementComponent implements OnInit {
  summary: ContentSummary = {
    formations: 0,
    modules: 0,
    courses: 0,
    exercises: 0,
    quizzes: 0,
    pendingValidation: 0
  };

  recentFormations: TrainerFormation[] = [];
  isLoading = true;

  contentTypes = [
    {
      name: 'Formations',
      icon: 'auto_stories',
      route: '/trainer/content/formations',
      color: '#3b82f6',
      description: 'Gérer vos formations complètes'
    },
    {
      name: 'Modules',
      icon: 'view_module',
      route: '/trainer/content/modules',
      color: '#10b981',
      description: 'Organiser les modules de formation'
    },
    {
      name: 'Cours',
      icon: 'menu_book',
      route: '/trainer/content/courses',
      color: '#8b5cf6',
      description: 'Créer et modifier les cours'
    },
    {
      name: 'Exercices',
      icon: 'assignment',
      route: '/trainer/content/exercises',
      color: '#f59e0b',
      description: 'Créer des exercices pratiques'
    },
    {
      name: 'Quiz',
      icon: 'quiz',
      route: '/trainer/content/quizzes',
      color: '#ef4444',
      description: 'Créer des évaluations'
    }
  ];

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadContentSummary();
  }

  private loadContentSummary(): void {
    this.trainerService.getTrainerStats().subscribe(stats => {
      this.summary = {
        formations: stats.totalFormations,
        modules: stats.totalModules,
        courses: stats.totalCourses,
        exercises: stats.totalExercises,
        quizzes: stats.totalQuizzes,
        pendingValidation: stats.contentPendingValidation
      };
      this.isLoading = false;
    });

    this.trainerService.getFormations().subscribe(formations => {
      this.recentFormations = formations.slice(0, 5);
    });
  }

  getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      'draft': 'Brouillon',
      'pending': 'En attente',
      'approved': 'Approuvé',
      'rejected': 'Refusé',
      'archived': 'Archivé'
    };
    return badges[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'draft': '#64748b',
      'pending': '#f59e0b',
      'approved': '#10b981',
      'rejected': '#ef4444',
      'archived': '#9ca3af'
    };
    return colors[status] || '#6b7280';
  }
}



