import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import {
  Course,
  CourseModule,
  Lesson,
  VideoProgress,
  AICoachSession,
  AICoachMessage,
  QuizAttempt,
  CourseQuiz
} from '../models/course.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CoursePlayerService {
  // État actuel du lecteur
  private currentCourseSubject = new BehaviorSubject<Course | null>(null);
  private currentModuleSubject = new BehaviorSubject<CourseModule | null>(null);
  private currentLessonSubject = new BehaviorSubject<Lesson | null>(null);
  private videoProgressSubject = new BehaviorSubject<VideoProgress | null>(null);
  private aiSessionSubject = new BehaviorSubject<AICoachSession | null>(null);
  private sidebarOpenSubject = new BehaviorSubject<boolean>(true);
  private aiChatOpenSubject = new BehaviorSubject<boolean>(false);

  public currentCourse$ = this.currentCourseSubject.asObservable();
  public currentModule$ = this.currentModuleSubject.asObservable();
  public currentLesson$ = this.currentLessonSubject.asObservable();
  public videoProgress$ = this.videoProgressSubject.asObservable();
  public aiSession$ = this.aiSessionSubject.asObservable();
  public sidebarOpen$ = this.sidebarOpenSubject.asObservable();
  public aiChatOpen$ = this.aiChatOpenSubject.asObservable();

  // Mock syllabus pour les cours
  private mockSyllabus: { [courseId: string]: CourseModule[] } = {
    'course-1': [
      {
        id: 'module-1',
        courseId: 'course-1',
        moduleNumber: 1,
        title: 'Introduction à Python',
        description: 'Découvrez les bases de Python et configurez votre environnement',
        estimatedHours: 3,
        isLocked: false,
        lessons: [
          {
            id: 'lesson-1-1',
            moduleId: 'module-1',
            lessonNumber: 1,
            type: 'video',
            title: 'Bienvenue dans le cours',
            description: 'Présentation du cours et de ses objectifs',
            duration: 5,
            videoUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
            isCompleted: true,
            isMandatory: true,
            order: 1
          },
          {
            id: 'lesson-1-2',
            moduleId: 'module-1',
            lessonNumber: 2,
            type: 'video',
            title: 'Installation de Python',
            description: 'Comment installer Python sur votre ordinateur',
            duration: 8,
            videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc',
            isCompleted: true,
            isMandatory: true,
            order: 2
          },
          {
            id: 'lesson-1-3',
            moduleId: 'module-1',
            lessonNumber: 3,
            type: 'video',
            title: 'Votre premier programme Python',
            description: 'Créez votre premier "Hello World" en Python',
            duration: 10,
            videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
            isCompleted: false,
            isMandatory: true,
            order: 3
          },
          {
            id: 'lesson-1-4',
            moduleId: 'module-1',
            lessonNumber: 4,
            type: 'quiz',
            title: 'Quiz : Bases de Python',
            description: 'Testez vos connaissances sur les bases de Python',
            duration: 15,
            quizId: 'quiz-1-1',
            isCompleted: false,
            isMandatory: true,
            order: 4
          }
        ]
      },
      {
        id: 'module-2',
        courseId: 'course-1',
        moduleNumber: 2,
        title: 'Variables et Types de Données',
        description: 'Apprenez à manipuler les variables et les types de données en Python',
        estimatedHours: 4,
        isLocked: false,
        lessons: [
          {
            id: 'lesson-2-1',
            moduleId: 'module-2',
            lessonNumber: 1,
            type: 'video',
            title: 'Variables en Python',
            description: 'Comment créer et utiliser des variables',
            duration: 12,
            videoUrl: 'https://www.youtube.com/embed/cQT33yu9pY8',
            isCompleted: false,
            isMandatory: true,
            order: 1
          },
          {
            id: 'lesson-2-2',
            moduleId: 'module-2',
            lessonNumber: 2,
            type: 'video',
            title: 'Les types de données',
            description: 'String, Integer, Float, Boolean et plus',
            duration: 15,
            videoUrl: 'https://www.youtube.com/embed/gCCVsvgR2KU',
            isCompleted: false,
            isMandatory: true,
            order: 2
          }
        ]
      }
    ]
  };

  constructor() {}

  // ========== NAVIGATION ==========

  loadCourse(course: Course): void {
    // Si le backend ne renvoie pas encore de syllabus, utiliser un mock de secours
    if ((!course.syllabus || course.syllabus.length === 0) && this.mockSyllabus[course.id]) {
      course.syllabus = this.mockSyllabus[course.id];
    }
    this.currentCourseSubject.next(course);

    // Charger le premier module et la première leçon par défaut
    if (course.syllabus && course.syllabus.length > 0) {
      this.loadModule(course.syllabus[0]);
    }
  }

  loadModule(module: CourseModule): void {
    this.currentModuleSubject.next(module);
    if (module.lessons && module.lessons.length > 0) {
      this.loadLesson(module.lessons[0]);
    }
  }

  loadLesson(lesson: Lesson): void {
    this.currentLessonSubject.next(lesson);
    
    // Si c'est une vidéo, initialiser le suivi de progression
    if (lesson.type === 'video') {
      const progress: VideoProgress = {
        lessonId: lesson.id,
        userId: 'user1',
        watchedSeconds: 0,
        totalSeconds: lesson.duration * 60,
        progress: 0,
        isCompleted: lesson.isCompleted,
        lastWatchedAt: new Date()
      };
      this.videoProgressSubject.next(progress);
    }
  }

  getNextLesson(): Lesson | null {
    const currentCourse = this.currentCourseSubject.value;
    const currentLesson = this.currentLessonSubject.value;
    
    if (!currentCourse || !currentLesson) return null;

    // Trouver la leçon actuelle dans le syllabus
    let found = false;
    for (const module of currentCourse.syllabus) {
      for (let i = 0; i < module.lessons.length; i++) {
        if (module.lessons[i].id === currentLesson.id) {
          found = true;
          // Retourner la leçon suivante dans le même module
          if (i < module.lessons.length - 1) {
            return module.lessons[i + 1];
          }
          // Sinon, retourner la première leçon du module suivant
          const nextModuleIndex = currentCourse.syllabus.indexOf(module) + 1;
          if (nextModuleIndex < currentCourse.syllabus.length) {
            const nextModule = currentCourse.syllabus[nextModuleIndex];
            return nextModule.lessons[0];
          }
          return null;
        }
      }
      if (found) break;
    }
    
    return null;
  }

  getPreviousLesson(): Lesson | null {
    const currentCourse = this.currentCourseSubject.value;
    const currentLesson = this.currentLessonSubject.value;
    
    if (!currentCourse || !currentLesson) return null;

    // Trouver la leçon actuelle dans le syllabus
    for (const module of currentCourse.syllabus) {
      for (let i = 0; i < module.lessons.length; i++) {
        if (module.lessons[i].id === currentLesson.id) {
          // Retourner la leçon précédente dans le même module
          if (i > 0) {
            return module.lessons[i - 1];
          }
          // Sinon, retourner la dernière leçon du module précédent
          const prevModuleIndex = currentCourse.syllabus.indexOf(module) - 1;
          if (prevModuleIndex >= 0) {
            const prevModule = currentCourse.syllabus[prevModuleIndex];
            return prevModule.lessons[prevModule.lessons.length - 1];
          }
          return null;
        }
      }
    }
    
    return null;
  }

  goToNextLesson(): void {
    const nextLesson = this.getNextLesson();
    if (nextLesson) {
      this.loadLesson(nextLesson);
    }
  }

  goToPreviousLesson(): void {
    const prevLesson = this.getPreviousLesson();
    if (prevLesson) {
      this.loadLesson(prevLesson);
    }
  }

  // ========== PROGRESSION VIDÉO ==========

  updateVideoProgress(watchedSeconds: number, totalSeconds: number): void {
    const current = this.videoProgressSubject.value;
    if (current) {
      current.watchedSeconds = watchedSeconds;
      current.totalSeconds = totalSeconds;
      current.progress = Math.round((watchedSeconds / totalSeconds) * 100);
      current.lastWatchedAt = new Date();
      
      // Marquer comme complété si > 90% regardé
      if (current.progress >= 90 && !current.isCompleted) {
        current.isCompleted = true;
        this.markLessonCompleted();
      }
      
      this.videoProgressSubject.next(current);
    }
  }

  markLessonCompleted(): void {
    const lesson = this.currentLessonSubject.value;
    if (lesson) {
      lesson.isCompleted = true;
    }
  }

  // ========== CHAT IA ==========

  toggleAIChat(): void {
    this.aiChatOpenSubject.next(!this.aiChatOpenSubject.value);
  }

  openAIChat(): void {
    this.aiChatOpenSubject.next(true);
    
    // Créer ou récupérer la session
    const currentCourse = this.currentCourseSubject.value;
    const currentLesson = this.currentLessonSubject.value;
    
    if (currentCourse && !this.aiSessionSubject.value) {
      const session: AICoachSession = {
        id: `session-${Date.now()}`,
        courseId: currentCourse.id,
        userId: 'user1',
        lessonId: currentLesson?.id,
        messages: [
          {
            id: `msg-${Date.now()}`,
            courseId: currentCourse.id,
            lessonId: currentLesson?.id,
            userId: 'user1',
            role: 'ai',
            content: `Bonjour ! Je suis votre coach IA pour le cours "${currentCourse.title}". Comment puis-je vous aider aujourd'hui ?`,
            timestamp: new Date()
          }
        ],
        startedAt: new Date(),
        lastMessageAt: new Date(),
        isActive: true
      };
      this.aiSessionSubject.next(session);
    }
  }

  closeAIChat(): void {
    this.aiChatOpenSubject.next(false);
  }

  sendAIMessage(content: string): Observable<AICoachMessage> {
    const session = this.aiSessionSubject.value;
    const currentLesson = this.currentLessonSubject.value;
    
    if (!session) {
      throw new Error('No active AI session');
    }

    // Message utilisateur
    const userMessage: AICoachMessage = {
      id: `msg-${Date.now()}`,
      courseId: session.courseId,
      lessonId: currentLesson?.id,
      userId: 'user1',
      role: 'user',
      content: content,
      timestamp: new Date(),
      context: {
        lessonTitle: currentLesson?.title
      }
    };

    session.messages.push(userMessage);

    // Simuler réponse de l'IA
    setTimeout(() => {
      const aiResponse: AICoachMessage = {
        id: `msg-${Date.now() + 1}`,
        courseId: session.courseId,
        lessonId: currentLesson?.id,
        userId: 'user1',
        role: 'ai',
        content: `Je comprends votre question sur "${content}". Voici une explication détaillée : ${this.generateAIResponse(content)}`,
        timestamp: new Date()
      };

      session.messages.push(aiResponse);
      session.lastMessageAt = new Date();
      this.aiSessionSubject.next(session);
    }, 1000);

    this.aiSessionSubject.next(session);
    return of(userMessage).pipe(delay(100));
  }

  private generateAIResponse(question: string): string {
    // Simulation de réponse IA
    const responses = [
      "En Python, les variables sont des conteneurs pour stocker des données. Vous n'avez pas besoin de déclarer leur type explicitement.",
      "Les boucles permettent de répéter des instructions. La boucle 'for' est idéale pour itérer sur des séquences.",
      "Les fonctions vous permettent de réutiliser du code. Définissez-les avec 'def' suivi du nom de la fonction.",
      "Les listes en Python sont des collections ordonnées et modifiables d'éléments. Elles sont très utiles !",
      "L'indentation en Python est cruciale - elle définit les blocs de code au lieu d'utiliser des accolades."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ========== UI STATE ==========

  toggleSidebar(): void {
    this.sidebarOpenSubject.next(!this.sidebarOpenSubject.value);
  }

  setSidebarOpen(open: boolean): void {
    this.sidebarOpenSubject.next(open);
  }
}




