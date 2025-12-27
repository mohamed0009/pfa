import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerModule, TrainerCourse, TrainerQuiz } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-module-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './module-details.component.html',
  styleUrls: ['./module-details.component.scss']
})
export class ModuleDetailsComponent implements OnInit {
  module: TrainerModule | null = null;
  courses: TrainerCourse[] = [];
  moduleQuiz: TrainerQuiz | null = null;
  isLoading = true;
  
  // Modal de création de cours
  showCreateCourseModal = false;
  isCreatingCourse = false;
  newCourse = {
    title: '',
    description: '',
    order: 0,
    estimatedHours: 0
  };

  // Modal de création de quiz de module
  showCreateQuizModal = false;
  isCreatingQuiz = false;
  newQuiz = {
    title: '',
    description: '',
    duration: 30,
    passingScore: 60,
    maxAttempts: 3
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private trainerService: TrainerService
  ) {}

  ngOnInit(): void {
    const moduleId = this.route.snapshot.paramMap.get('id');
    if (moduleId) {
      this.loadModule(moduleId);
      this.loadCourses(moduleId);
      this.loadModuleQuiz(moduleId);
    }
  }

  private loadModule(id: string): void {
    this.trainerService.getModuleById(id).subscribe({
      next: (module: any) => {
        // Mapper le module pour s'assurer que formationId est présent
        this.module = {
          id: module.id,
          formationId: module.formation?.id || module.formationId || '',
          title: module.title,
          description: module.description || '',
          order: module.order || 0,
          status: (module.status?.toLowerCase() || 'draft') as any,
          courses: module.courses || [],
          coursesCount: module.courses?.length || 0,
          duration: module.duration || 0,
          estimatedDuration: module.duration || 0,
          enrolledStudents: module.enrolledStudents || 0,
          createdBy: module.createdBy?.id || '',
          createdAt: module.createdAt ? new Date(module.createdAt) : new Date(),
          updatedAt: module.updatedAt ? new Date(module.updatedAt) : new Date(),
          submittedForValidationAt: module.submittedForValidationAt ? new Date(module.submittedForValidationAt) : undefined,
          validatedBy: module.validatedBy?.id || undefined,
          validatedAt: module.validatedAt ? new Date(module.validatedAt) : undefined,
          rejectionReason: module.rejectionReason || undefined
        };
      },
      error: (error) => {
        console.error('Error loading module:', error);
        this.router.navigate(['/trainer/content/formations']);
      }
    });
  }

  private loadCourses(moduleId: string): void {
    this.isLoading = true;
    this.trainerService.getCourses(moduleId).subscribe({
      next: (courses) => {
        this.courses = courses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.courses = [];
        this.isLoading = false;
      }
    });
  }

  private loadModuleQuiz(moduleId: string): void {
    // Charger le quiz associé au module (si existe)
    this.trainerService.getModuleQuiz(moduleId).subscribe({
      next: (quiz) => {
        this.moduleQuiz = quiz;
      },
      error: (error) => {
        // Pas de quiz pour ce module, c'est normal
        this.moduleQuiz = null;
      }
    });
  }

  openCreateCourseModal(): void {
    this.showCreateCourseModal = true;
    this.newCourse = {
      title: '',
      description: '',
      order: this.courses.length + 1,
      estimatedHours: 0
    };
  }

  closeCreateCourseModal(): void {
    this.showCreateCourseModal = false;
  }

  createCourse(): void {
    if (!this.newCourse.title.trim() || !this.module) {
      alert('Le titre est requis');
      return;
    }

    this.isCreatingCourse = true;
    const courseData: any = {
      moduleId: this.module.id,
      title: this.newCourse.title,
      description: this.newCourse.description,
      order: this.newCourse.order,
      estimatedHours: this.newCourse.estimatedHours
    };

    this.trainerService.createCourse(courseData).subscribe({
      next: (course) => {
        this.courses.push(course);
        this.closeCreateCourseModal();
        this.isCreatingCourse = false;
      },
      error: (error) => {
        console.error('Error creating course:', error);
        alert('Erreur lors de la création du cours');
        this.isCreatingCourse = false;
      }
    });
  }

  deleteCourse(courseId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      this.trainerService.deleteCourse(courseId).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== courseId);
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          alert('Erreur lors de la suppression du cours');
        }
      });
    }
  }

  openCreateQuizModal(): void {
    this.showCreateQuizModal = true;
    this.newQuiz = {
      title: `Quiz Final - ${this.module?.title || 'Module'}`,
      description: 'Quiz d\'évaluation finale du module',
      duration: 30,
      passingScore: 60,
      maxAttempts: 3
    };
  }

  closeCreateQuizModal(): void {
    this.showCreateQuizModal = false;
  }

  createModuleQuiz(): void {
    if (!this.newQuiz.title.trim() || !this.module) {
      alert('Le titre est requis');
      return;
    }

    this.isCreatingQuiz = true;
    const quizData: any = {
      moduleId: this.module.id,
      title: this.newQuiz.title,
      description: this.newQuiz.description,
      duration: this.newQuiz.duration,
      passingScore: this.newQuiz.passingScore,
      maxAttempts: this.newQuiz.maxAttempts,
      isModuleQuiz: true
    };

    this.trainerService.createModuleQuiz(quizData).subscribe({
      next: (quiz) => {
        this.moduleQuiz = quiz;
        this.closeCreateQuizModal();
        this.isCreatingQuiz = false;
      },
      error: (error) => {
        console.error('Error creating module quiz:', error);
        alert('Erreur lors de la création du quiz');
        this.isCreatingQuiz = false;
      }
    });
  }

  getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      'draft': 'Brouillon',
      'pending': 'En attente',
      'approved': 'Approuvé',
      'published': 'Publié'
    };
    return badges[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'draft': '#6b7280',
      'pending': '#f59e0b',
      'approved': '#10b981',
      'published': '#3b82f6'
    };
    return colors[status] || '#6b7280';
  }
}

