import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerFormation, TrainerModule, TrainerCourse, TrainerLesson, TrainerQuiz, QuizQuestion } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-formation-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './formation-details.component.html',
  styleUrls: ['./formation-details.component.scss']
})
export class FormationDetailsComponent implements OnInit {
  formation: TrainerFormation | null = null;
  modules: TrainerModule[] = [];
  isLoading = true;
  expandedModules: Set<string> = new Set();
  expandedCourses: Set<string> = new Set();
  
  // Modal de création de module
  showCreateModuleModal = false;
  isCreatingModule = false;
  newModule = {
    title: '',
    description: '',
    order: 0,
    duration: 0
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private trainerService: TrainerService
  ) {}

  ngOnInit(): void {
    const formationId = this.route.snapshot.paramMap.get('id');
    if (formationId) {
      this.loadFormation(formationId);
      this.loadModulesWithDetails(formationId);
    }
  }

  private loadFormation(id: string): void {
    this.trainerService.getFormationById(id).subscribe({
      next: (formation) => {
        this.formation = formation;
      },
      error: (error) => {
        console.error('Error loading formation:', error);
        this.router.navigate(['/trainer/content/formations']);
      }
    });
  }

  private loadModulesWithDetails(formationId: string): void {
    this.isLoading = true;
    this.trainerService.getModules(formationId).subscribe({
      next: (modules) => {
        this.modules = modules;
        // Charger les détails de chaque module (cours, leçons, quiz)
        this.loadModulesDetails();
      },
      error: (error) => {
        console.error('Error loading modules:', error);
        this.modules = [];
        this.isLoading = false;
      }
    });
  }

  private loadModulesDetails(): void {
    let loadedCount = 0;
    const totalModules = this.modules.length;

    if (totalModules === 0) {
      this.isLoading = false;
      return;
    }

    this.modules.forEach((module, index) => {
      // Charger les cours du module
      this.trainerService.getCourses(module.id).subscribe({
        next: (courses) => {
          module.courses = courses || [];
          module.coursesCount = courses?.length || 0;
          
          // Charger les détails de chaque cours (leçons, quiz)
          if (module.courses.length > 0) {
            this.loadCoursesDetails(module.courses, () => {
              loadedCount++;
              if (loadedCount === totalModules) {
                this.isLoading = false;
              }
            });
          } else {
            loadedCount++;
            if (loadedCount === totalModules) {
              this.isLoading = false;
            }
          }
        },
        error: (error) => {
          console.error(`Error loading courses for module ${module.id}:`, error);
          module.courses = [];
          module.coursesCount = 0;
          loadedCount++;
          if (loadedCount === totalModules) {
            this.isLoading = false;
          }
        }
      });
    });
  }

  private loadCoursesDetails(courses: TrainerCourse[], callback: () => void): void {
    let loadedCount = 0;
    const totalCourses = courses.length;

    if (totalCourses === 0) {
      callback();
      return;
    }

    courses.forEach((course) => {
      // Charger les leçons du cours
      this.trainerService.getCourseById(course.id).subscribe({
        next: (fullCourse) => {
          course.lessons = fullCourse.lessons || [];
          course.quizzes = fullCourse.quizzes || [];
          course.resources = fullCourse.resources || [];
          course.exercises = fullCourse.exercises || [];
          
          loadedCount++;
          if (loadedCount === totalCourses) {
            callback();
          }
        },
        error: (error) => {
          console.error(`Error loading course details ${course.id}:`, error);
          course.lessons = [];
          course.quizzes = [];
          course.resources = [];
          course.exercises = [];
          loadedCount++;
          if (loadedCount === totalCourses) {
            callback();
          }
        }
      });
    });
  }

  toggleModule(moduleId: string): void {
    if (this.expandedModules.has(moduleId)) {
      this.expandedModules.delete(moduleId);
      // Fermer aussi les cours de ce module
      const module = this.modules.find(m => m.id === moduleId);
      if (module?.courses) {
        module.courses.forEach(course => {
          this.expandedCourses.delete(course.id);
        });
      }
    } else {
      this.expandedModules.add(moduleId);
    }
  }

  toggleCourse(courseId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.expandedCourses.has(courseId)) {
      this.expandedCourses.delete(courseId);
    } else {
      this.expandedCourses.add(courseId);
    }
  }

  isModuleExpanded(moduleId: string): boolean {
    return this.expandedModules.has(moduleId);
  }

  isCourseExpanded(courseId: string): boolean {
    return this.expandedCourses.has(courseId);
  }

  getLessonTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'video': 'play_circle',
      'text': 'article',
      'interactive': 'code',
      'quiz': 'quiz'
    };
    return icons[type] || 'description';
  }

  getLessonTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'video': 'Vidéo',
      'text': 'Texte',
      'interactive': 'Lab',
      'quiz': 'Quiz'
    };
    return labels[type] || type;
  }

  getLessonTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'video': 'rgba(239, 68, 68, 0.1)',
      'text': 'rgba(59, 130, 246, 0.1)',
      'interactive': 'rgba(16, 185, 129, 0.1)',
      'quiz': 'rgba(245, 158, 11, 0.1)'
    };
    return colors[type] || 'rgba(107, 114, 128, 0.1)';
  }

  getModuleQuiz(module: TrainerModule): TrainerQuiz | null {
    // Le quiz est associé au module, chercher dans tous les cours du module
    for (const course of (module.courses || [])) {
      if (course.quizzes && course.quizzes.length > 0) {
        // Retourner le premier quiz trouvé (normalement il n'y en a qu'un par module)
        return course.quizzes[0];
      }
    }
    return null;
  }

  getQuizQuestionsCount(quiz: TrainerQuiz): number {
    return quiz?.questions?.length || 0;
  }

  isQCMQuestion(question: QuizQuestion): boolean {
    return question.type === 'mcq' || question.type === 'true_false';
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  }

  openCreateModuleModal(): void {
    this.showCreateModuleModal = true;
    this.newModule = {
      title: '',
      description: '',
      order: this.modules.length + 1,
      duration: 0
    };
  }

  closeCreateModuleModal(): void {
    this.showCreateModuleModal = false;
    this.newModule = {
      title: '',
      description: '',
      order: 0,
      duration: 0
    };
  }

  createModule(): void {
    if (!this.newModule.title.trim() || !this.formation) {
      alert('Le titre est requis');
      return;
    }

    const totalModulesDuration = this.modules.reduce((sum, m) => sum + (m.duration || 0), 0);
    const newTotalDuration = totalModulesDuration + this.newModule.duration;
    
    if (newTotalDuration > this.formation.duration) {
      alert(`La somme des heures des modules (${newTotalDuration.toFixed(1)}h) dépasse la durée de la formation (${this.formation.duration}h). Veuillez ajuster la durée.`);
      return;
    }

    this.isCreatingModule = true;
    const moduleData: any = {
      formationId: this.formation.id,
      title: this.newModule.title,
      description: this.newModule.description,
      order: this.newModule.order,
      duration: this.newModule.duration
    };

    this.trainerService.createModule(moduleData).subscribe({
      next: (module) => {
        this.modules.push(module);
        this.loadModulesWithDetails(this.formation!.id);
        this.closeCreateModuleModal();
        this.isCreatingModule = false;
      },
      error: (error) => {
        console.error('Error creating module:', error);
        const errorMessage = error?.error?.error || error?.error?.message || 'Erreur lors de la création du module';
        alert(errorMessage);
        this.isCreatingModule = false;
      }
    });
  }

  getTotalModulesDuration(): number {
    return this.modules.reduce((sum, m) => sum + (m.duration || 0), 0);
  }

  getDurationProgress(): number {
    if (!this.formation || this.formation.duration === 0) return 0;
    return (this.getTotalModulesDuration() / this.formation.duration) * 100;
  }

  isDurationValid(): boolean {
    return this.getTotalModulesDuration() <= (this.formation?.duration || 0);
  }

  deleteModule(moduleId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      this.trainerService.deleteModule(moduleId).subscribe({
        next: () => {
          this.modules = this.modules.filter(m => m.id !== moduleId);
          this.expandedModules.delete(moduleId);
        },
        error: (error) => {
          console.error('Error deleting module:', error);
          alert('Erreur lors de la suppression du module');
        }
      });
    }
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
