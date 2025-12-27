import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, delay, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  CourseProgress,
  LearningDeadline,
  CourseQuiz,
  QuizAttempt,
  CourseLevel
} from '../models/course.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private apiUrl = 'http://localhost:8081/api';
  private enrollmentsUrl = 'http://localhost:8081/api/user/enrollments';
  
  constructor(private http: HttpClient) {}

  // Catalogue de cours disponibles
  private mockCourses: Course[] = [
    {
      id: 'course-1',
      title: 'Introduction à Python pour la Data Science',
      subtitle: 'Apprenez Python et ses bibliothèques pour l\'analyse de données',
      description: 'Un cours complet pour débuter en Python avec un focus sur la Data Science',
      longDescription: 'Ce cours vous permettra de maîtriser les bases de Python et d\'apprendre à utiliser les bibliothèques essentielles comme NumPy, Pandas et Matplotlib pour l\'analyse de données. Vous travaillerez sur des projets réels guidés par un coach IA.',
      instructorName: 'Dr. Sophie Martin',
      instructorTitle: 'Data Scientist & Professeur',
      instructorAvatar: 'https://i.pravatar.cc/150?img=45',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
      category: 'Data Science',
      level: 'Débutant',
      language: 'Français',
      duration: '6 semaines',
      estimatedHours: 24,
      rating: 4.7,
      reviewsCount: 1523,
      enrolledCount: 12450,
      price: 0,
      skills: ['Python', 'NumPy', 'Pandas', 'Matplotlib', 'Analyse de données'],
      learningObjectives: [
        'Maîtriser la syntaxe de base de Python',
        'Manipuler des données avec Pandas',
        'Créer des visualisations avec Matplotlib',
        'Analyser des datasets réels',
        'Utiliser le coach IA pour progresser'
      ],
      prerequisites: ['Aucune expérience en programmation requise'],
      syllabus: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-20'),
      isPopular: true,
      isCertified: true
    },
    {
      id: 'course-2',
      title: 'Développement Web Full Stack avec JavaScript',
      subtitle: 'De zéro à Full Stack: React, Node.js, MongoDB',
      description: 'Créez des applications web complètes avec JavaScript moderne',
      longDescription: 'Apprenez à créer des applications web full stack en utilisant les technologies modernes : React pour le frontend, Node.js et Express pour le backend, et MongoDB pour la base de données. Le coach IA vous accompagne tout au long de votre apprentissage.',
      instructorName: 'Thomas Dubois',
      instructorTitle: 'Développeur Full Stack Senior',
      instructorAvatar: 'https://i.pravatar.cc/150?img=12',
      thumbnailUrl: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800',
      category: 'Développement',
      level: 'Intermédiaire',
      language: 'Français',
      duration: '10 semaines',
      estimatedHours: 45,
      rating: 4.8,
      reviewsCount: 2100,
      enrolledCount: 18200,
      price: 0,
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API', 'JWT'],
      learningObjectives: [
        'Créer des interfaces modernes avec React',
        'Développer des APIs REST avec Node.js',
        'Gérer des bases de données avec MongoDB',
        'Implémenter l\'authentification JWT',
        'Déployer des applications web'
      ],
      prerequisites: ['Connaissance de base en HTML, CSS et JavaScript'],
      syllabus: [],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-12-01'),
      isPopular: true,
      isCertified: true
    },
    {
      id: 'course-3',
      title: 'Machine Learning avec Python',
      subtitle: 'Algorithmes d\'apprentissage automatique appliqués',
      description: 'Découvrez le Machine Learning et créez vos premiers modèles prédictifs',
      longDescription: 'Ce cours vous introduit au Machine Learning en utilisant Python et Scikit-learn. Vous apprendrez les algorithmes fondamentaux et comment les appliquer à des problèmes réels.',
      instructorName: 'Dr. Claire Rousseau',
      instructorTitle: 'Chercheuse en IA',
      instructorAvatar: 'https://i.pravatar.cc/150?img=32',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
      category: 'Data Science',
      level: 'Avancé',
      language: 'Français',
      duration: '8 semaines',
      estimatedHours: 35,
      rating: 4.9,
      reviewsCount: 890,
      enrolledCount: 7200,
      price: 0,
      skills: ['Machine Learning', 'Scikit-learn', 'Régression', 'Classification', 'Deep Learning'],
      learningObjectives: [
        'Comprendre les concepts du Machine Learning',
        'Entraîner des modèles de classification et régression',
        'Évaluer et optimiser les performances',
        'Utiliser TensorFlow et Keras',
        'Déployer des modèles en production'
      ],
      prerequisites: ['Connaissance de Python et des mathématiques de base'],
      syllabus: [],
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-11-25'),
      isPopular: true,
      isCertified: true
    }
  ];

  // Inscriptions de l'utilisateur
  private mockEnrollments: Enrollment[] = [
    {
      id: 'enroll-1',
      userId: 'user1',
      courseId: 'course-1',
      status: 'active',
      enrolledAt: new Date('2024-11-01'),
      startedAt: new Date('2024-11-02'),
      targetCompletionDate: new Date('2025-01-15'),
      lastAccessedLessonId: 'lesson-1-3',
      certificateEarned: false,
      progress: {
        enrollmentId: 'enroll-1',
        overallProgress: 35,
        completedLessons: 7,
        totalLessons: 20,
        completedModules: 1,
        totalModules: 6,
        completedQuizzes: 2,
        totalQuizzes: 6,
        averageQuizScore: 87,
        totalTimeSpent: 8.5,
        currentStreak: 5,
        lastActivityDate: new Date(),
        moduleProgress: []
      }
    },
    {
      id: 'enroll-2',
      userId: 'user1',
      courseId: 'course-2',
      status: 'active',
      enrolledAt: new Date('2024-12-05'),
      startedAt: new Date('2024-12-05'),
      targetCompletionDate: new Date('2025-02-20'),
      lastAccessedLessonId: 'lesson-2-1',
      certificateEarned: false,
      progress: {
        enrollmentId: 'enroll-2',
        overallProgress: 10,
        completedLessons: 3,
        totalLessons: 30,
        completedModules: 0,
        totalModules: 10,
        completedQuizzes: 0,
        totalQuizzes: 10,
        averageQuizScore: 0,
        totalTimeSpent: 2.5,
        currentStreak: 2,
        lastActivityDate: new Date(),
        moduleProgress: []
      }
    }
  ];

  // Deadlines d'apprentissage
  private mockDeadlines: LearningDeadline[] = [
    {
      id: 'deadline-1',
      enrollmentId: 'enroll-1',
      type: 'module',
      itemId: 'module-2',
      itemTitle: 'Module 2 : Variables et Types de Données',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isCompleted: false,
      reminderSent: false
    },
    {
      id: 'deadline-2',
      enrollmentId: 'enroll-1',
      type: 'quiz',
      itemId: 'quiz-1',
      itemTitle: 'Quiz : Syntaxe de Base Python',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isCompleted: false,
      reminderSent: false
    }
  ];

  private coursesSubject = new BehaviorSubject<Course[]>(this.mockCourses);
  private enrollmentsSubject = new BehaviorSubject<Enrollment[]>(this.mockEnrollments);
  private deadlinesSubject = new BehaviorSubject<LearningDeadline[]>(this.mockDeadlines);

  public courses$ = this.coursesSubject.asObservable();
  public enrollments$ = this.enrollmentsSubject.asObservable();
  public deadlines$ = this.deadlinesSubject.asObservable();

  // ========== CATALOGUE DE COURS ==========

  getCourses(): Observable<Course[]> {
    const url = `${this.apiUrl}/courses`;
    console.log('Fetching courses from:', url);
    return this.http.get<any[]>(url).pipe(
      map((courses: any[]) => {
        console.log('Received courses from backend:', courses);
        const mappedCourses = courses.map(c => this.mapBackendCourseToFrontend(c));
        console.log('Mapped courses:', mappedCourses);
        this.coursesSubject.next(mappedCourses);
        return mappedCourses;
      }),
      catchError((error) => {
        console.error('Error fetching courses:', error);
        console.error('Error details:', error.error || error.message);
        // Return empty array instead of mock data to see the real issue
        return of([]);
      })
    );
  }

  getCourseById(courseId: string): Observable<Course | undefined> {
    return this.http.get<any>(`${this.apiUrl}/courses/${courseId}`).pipe(
      map((course: any) => this.mapBackendCourseToFrontend(course)),
      catchError((error) => {
        console.error('Error fetching course:', error);
        const course = this.mockCourses.find(c => c.id === courseId);
        return of(course);
      })
    );
  }

  /**
   * Récupère la structure de syllabus (modules + leçons) pour un cours donné.
   * Cette structure est construite par le backend à partir des leçons réelles
   * stockées en base de données, pour se rapprocher du modèle Coursera.
   */
  getCourseSyllabus(courseId: string): Observable<CourseModule[]> {
    return this.http.get<any[]>(`${this.apiUrl}/courses/${courseId}/syllabus`).pipe(
      map((modules: any[]) => {
        if (!Array.isArray(modules)) {
          return [];
        }
        return modules.map(m => this.mapBackendModuleToFrontend(m));
      }),
      catchError((error) => {
        console.error('Error fetching course syllabus:', error);
        return of([]);
      })
    );
  }

  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.http.get<any[]>(`${this.apiUrl}/courses?category=${category}`).pipe(
      map((courses: any[]) => courses.map(c => this.mapBackendCourseToFrontend(c))),
      catchError((error) => {
        console.error('Error fetching courses by category:', error);
        return of(this.mockCourses.filter(c => c.category === category));
      })
    );
  }

  getPopularCourses(): Observable<Course[]> {
    return this.http.get<any[]>(`${this.apiUrl}/courses?popular=true`).pipe(
      map((courses: any[]) => courses.map(c => this.mapBackendCourseToFrontend(c))),
      catchError((error) => {
        console.error('Error fetching popular courses:', error);
        return of(this.mockCourses.filter(c => c.isPopular));
      })
    );
  }

  searchCourses(query: string): Observable<Course[]> {
    // Backend doesn't have search endpoint yet, use frontend filter
    return this.getCourses().pipe(
      map(courses => courses.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  private mapBackendCourseToFrontend(course: any): Course {
    // Map backend level enum to frontend format
    let level: CourseLevel = 'Débutant';
    if (course.level) {
      const levelStr = course.level.toString().toUpperCase();
      if (levelStr === 'DEBUTANT') {
        level = 'Débutant';
      } else if (levelStr === 'INTERMEDIAIRE') {
        level = 'Intermédiaire';
      } else if (levelStr === 'AVANCE' || levelStr === 'AVANCÉ') {
        level = 'Avancé';
      }
    }

    return {
      id: course.id,
      title: course.title || '',
      subtitle: course.subtitle || course.description || '',
      description: course.description || '',
      longDescription: course.longDescription || course.description || '',
      instructorName: course.instructorName || (course.createdBy ? `${course.createdBy.firstName || ''} ${course.createdBy.lastName || ''}`.trim() : '') || '',
      instructorTitle: course.instructorTitle || '',
      instructorAvatar: course.instructorAvatar || course.createdBy?.avatarUrl || '',
      thumbnailUrl: course.thumbnailUrl || '',
      category: course.category || '',
      level: level,
      language: course.language || 'Français',
      duration: course.duration || '',
      estimatedHours: course.estimatedHours || 0,
      rating: course.rating || 0,
      reviewsCount: course.reviewsCount || 0,
      enrolledCount: course.enrolledCount || 0,
      price: course.price || 0,
      skills: course.skills || [],
      learningObjectives: course.learningObjectives || [],
      prerequisites: course.prerequisites || [],
      syllabus: course.syllabus || [],
      createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
      updatedAt: course.updatedAt ? new Date(course.updatedAt) : new Date(),
      isPopular: course.isPopular || false,
      isCertified: course.isCertified || false
    };
  }

  /**
   * Mappe un module backend (DTO Java) vers l'interface `CourseModule` utilisée
   * dans le frontend utilisateur.
   */
  private mapBackendModuleToFrontend(module: any): CourseModule {
    const lessons: Lesson[] = Array.isArray(module.lessons)
      ? module.lessons.map((l: any) => ({
          id: l.id,
          moduleId: l.moduleId,
          lessonNumber: l.lessonNumber,
          type: (l.type || 'lecture') as any,
          title: l.title || '',
          description: l.description || '',
          duration: l.duration || 0,
          videoUrl: l.videoUrl,
          contentUrl: l.contentUrl,
          quizId: l.quizId,
          exerciseId: l.exerciseId,
          transcript: l.transcript,
          resources: l.resources || [],
          isCompleted: false,
          isMandatory: l.isMandatory ?? true,
          order: l.order ?? l.lessonNumber ?? 0
        }))
      : [];

    return {
      id: module.id,
      courseId: module.courseId,
      moduleNumber: module.moduleNumber,
      title: module.title || `Module ${module.moduleNumber || ''}`.trim(),
      description: module.description || '',
      estimatedHours: module.estimatedHours || 0,
      lessons,
      unlockDate: module.unlockDate ? new Date(module.unlockDate) : undefined,
      isLocked: module.isLocked ?? false
    };
  }

  // ========== INSCRIPTIONS ==========

  enrollInCourse(courseId: string): Observable<Enrollment> {
    return this.http.post<any>(`${this.enrollmentsUrl}/${courseId}`, {}).pipe(
      map((enrollment: any) => {
        const mapped = this.mapBackendEnrollmentToFrontend(enrollment);
        this.mockEnrollments.push(mapped);
        this.enrollmentsSubject.next(this.mockEnrollments);
        return mapped;
      }),
      catchError((error) => {
        console.error('Error enrolling in course:', error);
        return throwError(() => error);
      })
    );
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<any[]>(this.enrollmentsUrl).pipe(
      map((enrollments: any[]) => {
        const mapped = enrollments.map(e => this.mapBackendEnrollmentToFrontend(e));
        this.mockEnrollments = mapped;
        this.enrollmentsSubject.next(mapped);
        return mapped;
      }),
      catchError((error) => {
        console.error('Error fetching enrollments:', error);
        return of(this.mockEnrollments);
      })
    );
  }

  getEnrollmentByCourseId(courseId: string): Observable<Enrollment | undefined> {
    return this.getMyEnrollments().pipe(
      map(enrollments => enrollments.find(e => e.courseId === courseId))
    );
  }

  isEnrolled(courseId: string): Observable<boolean> {
    return this.getMyEnrollments().pipe(
      map(enrollments => enrollments.some(e => e.courseId === courseId))
    );
  }

  private mapBackendEnrollmentToFrontend(enrollment: any): Enrollment {
    return {
      id: enrollment.id,
      userId: enrollment.user?.id || '',
      courseId: enrollment.course?.id || '',
      status: enrollment.status?.toLowerCase() || 'active',
      enrolledAt: enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : new Date(),
      targetCompletionDate: enrollment.targetCompletionDate ? new Date(enrollment.targetCompletionDate) : new Date(),
      certificateEarned: enrollment.certificateEarned || false,
      progress: enrollment.progress ? {
        enrollmentId: enrollment.progress.id || '',
        overallProgress: enrollment.progress.overallProgress || 0,
        completedLessons: enrollment.progress.completedLessons || 0,
        totalLessons: enrollment.progress.totalLessons || 0,
        completedModules: enrollment.progress.completedModules || 0,
        totalModules: enrollment.progress.totalModules || 0,
        completedQuizzes: enrollment.progress.completedQuizzes || 0,
        totalQuizzes: enrollment.progress.totalQuizzes || 0,
        averageQuizScore: enrollment.progress.averageQuizScore || 0,
        totalTimeSpent: enrollment.progress.totalTimeSpent || 0,
        currentStreak: enrollment.progress.currentStreak || 0,
        lastActivityDate: enrollment.progress.lastActivityDate ? new Date(enrollment.progress.lastActivityDate) : new Date(),
        moduleProgress: enrollment.progress.moduleProgress || []
      } : {
        enrollmentId: '',
        overallProgress: 0,
        completedLessons: 0,
        totalLessons: 0,
        completedModules: 0,
        totalModules: 0,
        completedQuizzes: 0,
        totalQuizzes: 0,
        averageQuizScore: 0,
        totalTimeSpent: 0,
        currentStreak: 0,
        lastActivityDate: new Date(),
        moduleProgress: []
      }
    };
  }

  // ========== PROGRESSION ==========

  updateProgress(enrollmentId: string, progress: Partial<CourseProgress>): Observable<CourseProgress> {
    const enrollment = this.mockEnrollments.find(e => e.id === enrollmentId);
    if (enrollment) {
      enrollment.progress = { ...enrollment.progress, ...progress };
      this.enrollmentsSubject.next(this.mockEnrollments);
    }
    return of(enrollment!.progress).pipe(delay(300));
  }

  completeLesson(enrollmentId: string, lessonId: string): Observable<CourseProgress> {
    const enrollment = this.mockEnrollments.find(e => e.id === enrollmentId);
    if (enrollment) {
      enrollment.progress.completedLessons++;
      enrollment.progress.overallProgress = Math.round(
        (enrollment.progress.completedLessons / enrollment.progress.totalLessons) * 100
      );
      enrollment.lastAccessedLessonId = lessonId;
      this.enrollmentsSubject.next(this.mockEnrollments);
    }
    return of(enrollment!.progress).pipe(delay(300));
  }

  // ========== DEADLINES ==========

  getDeadlines(): Observable<LearningDeadline[]> {
    return of(this.mockDeadlines).pipe(delay(400));
  }

  getUpcomingDeadlines(limit: number = 5): Observable<LearningDeadline[]> {
    const upcoming = this.mockDeadlines
      .filter(d => !d.isCompleted && d.dueDate > new Date())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, limit);
    return of(upcoming).pipe(delay(300));
  }

  markDeadlineCompleted(deadlineId: string): Observable<LearningDeadline> {
    const deadline = this.mockDeadlines.find(d => d.id === deadlineId);
    if (deadline) {
      deadline.isCompleted = true;
      deadline.completedAt = new Date();
      this.deadlinesSubject.next(this.mockDeadlines);
    }
    return of(deadline!).pipe(delay(300));
  }
}




