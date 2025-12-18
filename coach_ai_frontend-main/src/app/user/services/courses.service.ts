import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import {
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  CourseProgress,
  LearningDeadline,
  CourseQuiz,
  QuizAttempt
} from '../models/course.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
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

  constructor() {}

  // ========== CATALOGUE DE COURS ==========

  getCourses(): Observable<Course[]> {
    return of(this.mockCourses).pipe(delay(500));
  }

  getCourseById(courseId: string): Observable<Course | undefined> {
    const course = this.mockCourses.find(c => c.id === courseId);
    return of(course).pipe(delay(300));
  }

  getCoursesByCategory(category: string): Observable<Course[]> {
    const filtered = this.mockCourses.filter(c => c.category === category);
    return of(filtered).pipe(delay(400));
  }

  getPopularCourses(): Observable<Course[]> {
    const popular = this.mockCourses.filter(c => c.isPopular);
    return of(popular).pipe(delay(400));
  }

  searchCourses(query: string): Observable<Course[]> {
    const results = this.mockCourses.filter(c =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
    );
    return of(results).pipe(delay(500));
  }

  // ========== INSCRIPTIONS ==========

  enrollInCourse(courseId: string): Observable<Enrollment> {
    const course = this.mockCourses.find(c => c.id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const enrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      userId: 'user1',
      courseId: courseId,
      status: 'active',
      enrolledAt: new Date(),
      targetCompletionDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // +60 jours
      certificateEarned: false,
      progress: {
        enrollmentId: '',
        overallProgress: 0,
        completedLessons: 0,
        totalLessons: 20,
        completedModules: 0,
        totalModules: 6,
        completedQuizzes: 0,
        totalQuizzes: 6,
        averageQuizScore: 0,
        totalTimeSpent: 0,
        currentStreak: 0,
        lastActivityDate: new Date(),
        moduleProgress: []
      }
    };

    this.mockEnrollments.push(enrollment);
    this.enrollmentsSubject.next(this.mockEnrollments);
    return of(enrollment).pipe(delay(500));
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return of(this.mockEnrollments).pipe(delay(400));
  }

  getEnrollmentByCourseId(courseId: string): Observable<Enrollment | undefined> {
    const enrollment = this.mockEnrollments.find(e => e.courseId === courseId);
    return of(enrollment).pipe(delay(300));
  }

  isEnrolled(courseId: string): Observable<boolean> {
    const enrolled = this.mockEnrollments.some(e => e.courseId === courseId);
    return of(enrolled).pipe(delay(200));
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




