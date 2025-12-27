import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CoursesService } from '../../services/courses.service';
import { CoursePlayerService } from '../../services/course-player.service';
import { Course, CourseModule, Lesson, AICoachSession, CourseQuiz, QuizQuestion, QuizOption } from '../../models/course.interfaces';

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
  
  // Quiz properties
  currentQuiz: CourseQuiz | null = null;
  currentQuestionIndex: number = 0;
  userAnswers: Map<string, string> = new Map();
  timeRemaining: number = 0; // seconds
  isQuizSubmitted: boolean = false;
  quizScore: number = 0;
  quizPassed: boolean = false;
  quizTimerSubscription?: Subscription;
  currentQuizAttemptId: string | null = null;
  
  private destroy$ = new Subject<void>();
  private apiUrl = 'http://localhost:8081/api/user/quizzes';

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private playerService: CoursePlayerService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
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
        // Charger le quiz si c'est une leçon de type quiz
        if (lesson && lesson.type === 'quiz' && lesson.quizId) {
          this.loadQuiz(lesson.quizId);
        } else {
          this.currentQuiz = null;
          this.stopQuizTimer();
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
    this.stopQuizTimer();
  }

  loadCourseForPlayer(courseId: string): void {
    this.coursesService.getCourseById(courseId).subscribe(course => {
      if (!course) {
        return;
      }

      // Charger le syllabus dynamique (modules + leçons) depuis le backend
      this.coursesService.getCourseSyllabus(courseId).subscribe(modules => {
        course.syllabus = modules;
        this.course = course;
        this.playerService.loadCourse(course);
      });
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

  // ========== QUIZ METHODS ==========
  loadQuiz(quizId: string): void {
    this.http.get<any>(`${this.apiUrl}/${quizId}`).subscribe({
      next: (quiz) => {
        // Mapper le quiz backend vers CourseQuiz
        this.currentQuiz = {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || '',
          duration: quiz.duration || 30,
          passingScore: quiz.passingScore || 60,
          maxAttempts: quiz.maxAttempts || 3,
          isGraded: quiz.isGraded !== undefined ? quiz.isGraded : true,
          questions: (quiz.questions || []).map((q: any) => ({
            id: q.id,
            quizId: q.quizId || quiz.id,
            questionNumber: q.questionNumber || q.order || 1,
            type: this.mapQuestionType(q.type),
            question: q.question,
            explanation: q.explanation,
            points: q.points || 1,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            codeTemplate: q.codeTemplate,
            aiHintEnabled: q.aiHintEnabled || false
          }))
        };
        this.timeRemaining = this.currentQuiz.duration * 60;
        this.currentQuestionIndex = 0;
        this.userAnswers.clear();
        this.isQuizSubmitted = false;
        // Démarrer une tentative
        this.startQuizAttempt(quizId);
        this.startQuizTimer();
        console.log('Quiz loaded:', this.currentQuiz);
      },
      error: (error) => {
        console.error('Error loading quiz:', error);
        this.currentQuiz = null;
      }
    });
  }

  startQuizAttempt(quizId: string): void {
    this.http.post<any>(`${this.apiUrl}/${quizId}/attempts`, {}).subscribe({
      next: (attempt) => {
        this.currentQuizAttemptId = attempt.id;
        console.log('Quiz attempt started:', attempt);
      },
      error: (error) => {
        console.error('Error starting quiz attempt:', error);
      }
    });
  }

  mapQuestionType(backendType: string): 'multiple-choice' | 'true-false' | 'short-answer' | 'code' {
    const typeMap: { [key: string]: 'multiple-choice' | 'true-false' | 'short-answer' | 'code' } = {
      'MULTIPLE_CHOICE': 'multiple-choice',
      'TRUE_FALSE': 'true-false',
      'SHORT_ANSWER': 'short-answer',
      'CODE': 'code'
    };
    return typeMap[backendType] || 'multiple-choice';
  }

  startQuizTimer(): void {
    this.stopQuizTimer();
    this.quizTimerSubscription = interval(1000).subscribe(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.submitQuiz();
      }
    });
  }

  stopQuizTimer(): void {
    if (this.quizTimerSubscription) {
      this.quizTimerSubscription.unsubscribe();
    }
  }

  getCurrentQuestion(): QuizQuestion | null {
    if (!this.currentQuiz || !this.currentQuiz.questions) return null;
    return this.currentQuiz.questions[this.currentQuestionIndex] || null;
  }

  selectQuizAnswer(answer: string): void {
    const question = this.getCurrentQuestion();
    if (!question) return;
    this.userAnswers.set(question.id, answer);
  }

  getUserQuizAnswer(questionId: string): string | undefined {
    return this.userAnswers.get(questionId);
  }

  goToQuizQuestion(index: number): void {
    if (index >= 0 && this.currentQuiz && index < this.currentQuiz.questions.length) {
      this.currentQuestionIndex = index;
    }
  }

  nextQuizQuestion(): void {
    if (this.currentQuiz && this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuizQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  isQuizQuestionAnswered(questionId: string): boolean {
    return this.userAnswers.has(questionId);
  }

  canSubmitQuiz(): boolean {
    if (!this.currentQuiz) return false;
    return this.currentQuiz.questions.every(q => this.userAnswers.has(q.id));
  }

  submitQuiz(): void {
    if (!this.currentQuiz || !this.currentQuizAttemptId) return;

    this.stopQuizTimer();

    const answers = Array.from(this.userAnswers.entries()).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer: userAnswer || ''
    }));

    this.http.post<any>(`${this.apiUrl}/attempts/${this.currentQuizAttemptId}/submit`, answers).subscribe({
      next: (result) => {
        this.quizScore = result.score || 0;
        this.quizPassed = result.passed || false;
        this.isQuizSubmitted = true;
        console.log('Quiz submitted:', result);
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        alert('Erreur lors de la soumission du quiz');
      }
    });
  }

  getQuizTimeFormatted(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getQuizProgressPercentage(): number {
    if (!this.currentQuiz) return 0;
    return Math.round((this.userAnswers.size / this.currentQuiz.questions.length) * 100);
  }

  String = String; // Expose String pour le template
}




