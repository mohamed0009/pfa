import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { CoursesService } from '../../services/courses.service';
import { CoursePlayerService } from '../../services/course-player.service';
import { Course, CourseModule, Lesson, AICoachSession } from '../../models/course.interfaces';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './course-player.component.html',
  styleUrl: './course-player.component.scss'
})
export class CoursePlayerComponent implements OnInit, OnDestroy {
  course: Course | null = null;
  currentModule: CourseModule | null = null;
  currentLesson: Lesson | null = null;
  sidebarOpen: boolean = true;
  aiChatOpen: boolean = false;
  aiSession: AICoachSession | null = null;
  aiMessage: string = '';
  safeVideoUrl: SafeResourceUrl | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private playerService: CoursePlayerService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourseForPlayer(courseId);
    }

    // S'abonner aux changements d'état
    this.playerService.currentLesson$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lesson => {
        this.currentLesson = lesson;
        if (lesson && lesson.videoUrl) {
          this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(lesson.videoUrl);
        }
      });

    this.playerService.sidebarOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(open => this.sidebarOpen = open);

    this.playerService.aiChatOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(open => this.aiChatOpen = open);

    this.playerService.aiSession$
      .pipe(takeUntil(this.destroy$))
      .subscribe(session => this.aiSession = session);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCourseForPlayer(courseId: string): void {
    this.coursesService.getCourseById(courseId).subscribe(course => {
      if (course) {
        this.course = course;
        this.playerService.loadCourse(course);
      }
    });

    // S'abonner au module actuel
    this.playerService.currentModule$
      .pipe(takeUntil(this.destroy$))
      .subscribe(module => {
        this.currentModule = module;
      });
  }

  selectLesson(lesson: Lesson): void {
    this.playerService.loadLesson(lesson);
  }

  goToNextLesson(): void {
    this.playerService.goToNextLesson();
  }

  goToPreviousLesson(): void {
    this.playerService.goToPreviousLesson();
  }

  toggleSidebar(): void {
    this.playerService.toggleSidebar();
  }

  toggleAIChat(): void {
    if (!this.aiChatOpen) {
      this.playerService.openAIChat();
    } else {
      this.playerService.closeAIChat();
    }
  }

  sendAIMessage(): void {
    if (this.aiMessage.trim()) {
      this.playerService.sendAIMessage(this.aiMessage);
      this.aiMessage = '';
    }
  }

  markLessonComplete(): void {
    this.playerService.markLessonCompleted();
    // Mettre à jour dans le backend
    // this.coursesService.completeLesson(enrollmentId, lessonId).subscribe();
  }

  getLessonIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'video': 'play_circle',
      'lecture': 'description',
      'quiz': 'quiz',
      'exercise': 'edit_note',
      'ai-chat': 'psychology'
    };
    return icons[type] || 'article';
  }

  isLessonActive(lesson: Lesson): boolean {
    return this.currentLesson?.id === lesson.id;
  }

  getModuleProgress(module: CourseModule): number {
    if (!module.lessons || module.lessons.length === 0) return 0;
    const completed = module.lessons.filter(l => l.isCompleted).length;
    return Math.round((completed / module.lessons.length) * 100);
  }

  hasPreviousLesson(): boolean {
    return this.playerService.getPreviousLesson() !== null;
  }

  hasNextLesson(): boolean {
    return this.playerService.getNextLesson() !== null;
  }
}




