import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerCourse, TrainerLesson } from '../../../models/trainer.interfaces';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss']
})
export class CourseDetailsComponent implements OnInit {
  course: TrainerCourse | null = null;
  lessons: TrainerLesson[] = [];
  isLoading = true;
  
  // Modal de création de leçon
  showCreateLessonModal = false;
  isCreatingLesson = false;
  newLesson = {
    title: '',
    description: '',
    type: 'video' as 'video' | 'text' | 'schema',
    videoUrl: '',
    contentUrl: '',
    transcript: '',
    duration: 0,
    order: 0
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private trainerService: TrainerService
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
      this.loadLessons(courseId);
    }
  }

  private loadCourse(id: string): void {
    this.trainerService.getCourseById(id).subscribe({
      next: (course: any) => {
        this.course = {
          id: course.id,
          moduleId: course.module?.id || course.moduleId || '',
          title: course.title,
          description: course.description || '',
          content: course.longDescription || course.description || '',
          order: course.order || 0,
          status: (course.status?.toLowerCase() || 'draft') as any,
          duration: course.estimatedHours ? course.estimatedHours * 60 : 0,
          lessons: course.lessons || [],
          resources: course.resources || [],
          exercises: course.exercises || [],
          quizzes: course.quizzes || [],
          enrolledStudents: course.enrolledStudents || 0,
          enrolledCount: course.enrolledCount || course.enrolledStudents || 0,
          completionRate: course.completionRate || 0,
          createdBy: course.createdBy?.id || '',
          createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
          updatedAt: course.updatedAt ? new Date(course.updatedAt) : new Date()
        };
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.router.navigate(['/trainer/content/modules']);
      }
    });
  }

  private loadLessons(courseId: string): void {
    this.isLoading = true;
    this.trainerService.getLessons(courseId).subscribe({
      next: (lessons: any[]) => {
        this.lessons = lessons.map(lesson => ({
          id: lesson.id,
          courseId: lesson.course?.id || courseId,
          title: lesson.title,
          content: lesson.description || lesson.transcript || '',
          order: lesson.order || lesson.lessonNumber || 0,
          duration: lesson.duration || 0,
          type: this.mapLessonType(lesson.type),
          videoUrl: lesson.videoUrl || undefined,
          resources: lesson.resources || [],
          createdBy: lesson.createdBy?.id || '',
          createdAt: lesson.createdAt ? new Date(lesson.createdAt) : new Date(),
          updatedAt: lesson.updatedAt ? new Date(lesson.updatedAt) : new Date()
        }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading lessons:', error);
        this.lessons = [];
        this.isLoading = false;
      }
    });
  }

  private mapLessonType(type: string): 'video' | 'text' | 'interactive' | 'quiz' {
    const typeMap: Record<string, 'video' | 'text' | 'interactive' | 'quiz'> = {
      'VIDEO': 'video',
      'LECTURE': 'text',
      'EXERCISE': 'interactive',
      'QUIZ': 'quiz',
      'AI_CHAT': 'interactive'
    };
    return typeMap[type?.toUpperCase()] || 'text';
  }

  openCreateLessonModal(): void {
    this.showCreateLessonModal = true;
    this.newLesson = {
      title: '',
      description: '',
      type: 'video',
      videoUrl: '',
      contentUrl: '',
      transcript: '',
      duration: 0,
      order: this.lessons.length + 1
    };
  }

  closeCreateLessonModal(): void {
    this.showCreateLessonModal = false;
  }

  createLesson(): void {
    if (!this.newLesson.title.trim() || !this.course) {
      alert('Le titre est requis');
      return;
    }

    this.isCreatingLesson = true;
    const lessonData: any = {
      courseId: this.course.id,
      title: this.newLesson.title,
      description: this.newLesson.description,
      type: this.mapTypeToBackend(this.newLesson.type),
      order: this.newLesson.order,
      duration: this.newLesson.duration
    };

    if (this.newLesson.type === 'video' && this.newLesson.videoUrl) {
      lessonData.videoUrl = this.newLesson.videoUrl;
      if (this.newLesson.transcript) {
        lessonData.transcript = this.newLesson.transcript;
      }
    } else if (this.newLesson.type === 'text' || this.newLesson.type === 'schema') {
      if (this.newLesson.contentUrl) {
        lessonData.contentUrl = this.newLesson.contentUrl;
      }
    }

    this.trainerService.createLesson(lessonData).subscribe({
      next: (lesson: TrainerLesson) => {
        this.lessons.push(lesson);
        this.lessons.sort((a, b) => a.order - b.order);
        this.closeCreateLessonModal();
        this.isCreatingLesson = false;
      },
      error: (error: any) => {
        console.error('Error creating lesson:', error);
        alert('Erreur lors de la création de la leçon');
        this.isCreatingLesson = false;
      }
    });
  }

  private mapTypeToBackend(type: string): string {
    const typeMap: Record<string, string> = {
      'video': 'VIDEO',
      'text': 'LECTURE',
      'schema': 'LECTURE' // Les schémas sont des LECTURE avec contentUrl
    };
    return typeMap[type] || 'VIDEO';
  }

  deleteLesson(lessonId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) {
      this.trainerService.deleteLesson(lessonId).subscribe({
        next: () => {
          this.lessons = this.lessons.filter(l => l.id !== lessonId);
        },
        error: (error: any) => {
          console.error('Error deleting lesson:', error);
          alert('Erreur lors de la suppression de la leçon');
        }
      });
    }
  }

  getLessonTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'video': 'play_circle',
      'text': 'article',
      'schema': 'image',
      'interactive': 'interactive_space',
      'quiz': 'quiz'
    };
    return icons[type] || 'article';
  }

  getLessonTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'video': 'Vidéo',
      'text': 'Texte',
      'schema': 'Schéma',
      'interactive': 'Interactif',
      'quiz': 'Quiz'
    };
    return labels[type] || 'Leçon';
  }

  onTypeChange(): void {
    // Réinitialiser les champs spécifiques au type
    if (this.newLesson.type !== 'video') {
      this.newLesson.videoUrl = '';
      this.newLesson.transcript = '';
    }
    if (this.newLesson.type !== 'text' && this.newLesson.type !== 'schema') {
      this.newLesson.contentUrl = '';
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

