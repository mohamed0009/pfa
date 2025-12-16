import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { 
  TrainerProfile, 
  TrainerStats, 
  AtRiskStudent, 
  FormationStatistics,
  TrainerFormation,
  StudentDashboard,
  TrainerModule,
  TrainerCourse,
  TrainerExercise,
  TrainerQuiz,
  ExerciseReview,
  QuizReview,
  TrainerMessage,
  StudentQuestion,
  Reminder,
  Alert,
  PersonalizedLearningPath,
  AIContentGenerationRequest,
  AIGeneratedContent
} from '../models/trainer.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private apiUrl = '/api/trainer';

  constructor(private http: HttpClient) {}

  // ==================== PROFIL FORMATEUR ====================
  
  getTrainerProfile(): Observable<TrainerProfile> {
    // Mock data for now
    return of({
      id: 'trainer-1',
      email: 'formateur@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      avatarUrl: '',
      phone: '+33123456789',
      bio: 'Formateur expérimenté en développement web',
      specializations: ['JavaScript', 'Angular', 'React', 'Node.js'],
      formationsAssigned: ['form-1', 'form-2'],
      status: 'active',
      validatedAt: new Date('2024-01-15'),
      joinedAt: new Date('2024-01-10'),
      lastActive: new Date(),
      preferences: {
        language: 'fr',
        notificationsEnabled: true,
        emailUpdates: true,
        defaultDifficultyLevel: 'Moyen',
        aiAssistanceEnabled: true
      }
    });
  }

  updateTrainerProfile(profile: Partial<TrainerProfile>): Observable<TrainerProfile> {
    return this.http.put<TrainerProfile>(`${this.apiUrl}/profile`, profile);
  }

  getTrainerStats(): Observable<TrainerStats> {
    // Mock data
    return of({
      trainerId: 'trainer-1',
      totalStudents: 156,
      activeStudents: 98,
      totalFormations: 5,
      totalModules: 23,
      totalCourses: 67,
      totalExercises: 45,
      totalQuizzes: 38,
      contentPendingValidation: 3,
      contentApproved: 120,
      averageStudentProgress: 68.5,
      averageStudentSatisfaction: 4.3,
      responseTime: 2.5
    });
  }

  // ==================== GESTION DES FORMATIONS ====================
  
  getFormationsStatistics(): Observable<FormationStatistics[]> {
    // Mock data
    return of([
      {
        formationId: 'form-1',
        formationName: 'Formation JavaScript Avancé',
        totalStudents: 45,
        activeStudents: 32,
        averageProgress: 72.5,
        averageCompletionTime: 45,
        averageScore: 78.3,
        completionRate: 68.9,
        dropoutRate: 8.9,
        modulesStatistics: [],
        coursesStatistics: [],
        performanceTrend: []
      },
      {
        formationId: 'form-2',
        formationName: 'Angular Fundamentals',
        totalStudents: 38,
        activeStudents: 29,
        averageProgress: 65.2,
        averageCompletionTime: 38,
        averageScore: 75.6,
        completionRate: 71.1,
        dropoutRate: 10.5,
        modulesStatistics: [],
        coursesStatistics: [],
        performanceTrend: []
      }
    ]);
  }

  getFormations(): Observable<TrainerFormation[]> {
    return this.http.get<TrainerFormation[]>(`${this.apiUrl}/formations`);
  }

  getFormationById(id: string): Observable<TrainerFormation> {
    return this.http.get<TrainerFormation>(`${this.apiUrl}/formations/${id}`);
  }

  createFormation(formation: Partial<TrainerFormation>): Observable<TrainerFormation> {
    return this.http.post<TrainerFormation>(`${this.apiUrl}/formations`, formation);
  }

  updateFormation(id: string, formation: Partial<TrainerFormation>): Observable<TrainerFormation> {
    return this.http.put<TrainerFormation>(`${this.apiUrl}/formations/${id}`, formation);
  }

  deleteFormation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/formations/${id}`);
  }

  submitForValidation(id: string, type: 'formation' | 'module' | 'course'): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/validation/submit`, { id, type });
  }

  // ==================== MODULES ====================
  
  getModules(formationId?: string): Observable<TrainerModule[]> {
    const url = formationId 
      ? `${this.apiUrl}/modules?formationId=${formationId}`
      : `${this.apiUrl}/modules`;
    return this.http.get<TrainerModule[]>(url);
  }

  getTrainerModules(): Observable<TrainerModule[]> {
    return this.getModules();
  }

  createModule(module: Partial<TrainerModule>): Observable<TrainerModule> {
    return this.http.post<TrainerModule>(`${this.apiUrl}/modules`, module);
  }

  updateModule(id: string, module: Partial<TrainerModule>): Observable<TrainerModule> {
    return this.http.put<TrainerModule>(`${this.apiUrl}/modules/${id}`, module);
  }

  deleteModule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/modules/${id}`);
  }

  // ==================== COURS ====================
  
  getCourses(moduleId?: string): Observable<TrainerCourse[]> {
    const url = moduleId 
      ? `${this.apiUrl}/courses?moduleId=${moduleId}`
      : `${this.apiUrl}/courses`;
    return this.http.get<TrainerCourse[]>(url);
  }

  getTrainerCourses(): Observable<TrainerCourse[]> {
    return this.getCourses();
  }

  getCourseById(id: string): Observable<TrainerCourse> {
    return this.http.get<TrainerCourse>(`${this.apiUrl}/courses/${id}`);
  }

  createCourse(course: Partial<TrainerCourse>): Observable<TrainerCourse> {
    return this.http.post<TrainerCourse>(`${this.apiUrl}/courses`, course);
  }

  updateCourse(id: string, course: Partial<TrainerCourse>): Observable<TrainerCourse> {
    return this.http.put<TrainerCourse>(`${this.apiUrl}/courses/${id}`, course);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/courses/${id}`);
  }

  // ==================== EXERCICES ====================
  
  getExercises(courseId?: string): Observable<TrainerExercise[]> {
    const url = courseId 
      ? `${this.apiUrl}/exercises?courseId=${courseId}`
      : `${this.apiUrl}/exercises`;
    return this.http.get<TrainerExercise[]>(url);
  }

  getTrainerExercises(): Observable<TrainerExercise[]> {
    return this.getExercises();
  }

  createExercise(exercise: Partial<TrainerExercise>): Observable<TrainerExercise> {
    return this.http.post<TrainerExercise>(`${this.apiUrl}/exercises`, exercise);
  }

  updateExercise(id: string, exercise: Partial<TrainerExercise>): Observable<TrainerExercise> {
    return this.http.put<TrainerExercise>(`${this.apiUrl}/exercises/${id}`, exercise);
  }

  deleteExercise(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/exercises/${id}`);
  }

  // ==================== QUIZ ====================
  
  getQuizzes(courseId?: string): Observable<TrainerQuiz[]> {
    const url = courseId 
      ? `${this.apiUrl}/quizzes?courseId=${courseId}`
      : `${this.apiUrl}/quizzes`;
    return this.http.get<TrainerQuiz[]>(url);
  }

  getTrainerQuizzes(): Observable<TrainerQuiz[]> {
    return this.getQuizzes();
  }

  createQuiz(quiz: Partial<TrainerQuiz>): Observable<TrainerQuiz> {
    return this.http.post<TrainerQuiz>(`${this.apiUrl}/quizzes`, quiz);
  }

  updateQuiz(id: string, quiz: Partial<TrainerQuiz>): Observable<TrainerQuiz> {
    return this.http.put<TrainerQuiz>(`${this.apiUrl}/quizzes/${id}`, quiz);
  }

  deleteQuiz(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/quizzes/${id}`);
  }

  // ==================== SUIVI DES APPRENANTS ====================
  
  getStudents(formationId?: string): Observable<StudentDashboard[]> {
    const url = formationId 
      ? `${this.apiUrl}/students?formationId=${formationId}`
      : `${this.apiUrl}/students`;
    return this.http.get<StudentDashboard[]>(url);
  }

  getStudentById(id: string): Observable<StudentDashboard> {
    return this.http.get<StudentDashboard>(`${this.apiUrl}/students/${id}`);
  }

  getAtRiskStudents(): Observable<AtRiskStudent[]> {
    // Mock data
    return of([
      {
        studentId: 'student-1',
        studentName: 'Marie Dubois',
        studentAvatar: '',
        formationId: 'form-1',
        formationName: 'Formation JavaScript Avancé',
        riskLevel: 'high',
        reasons: ['Inactif depuis 7 jours', 'Progression faible (35%)', 'Échec aux derniers quiz'],
        lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        daysInactive: 7,
        progress: 35,
        performance: 'poor',
        suggestedActions: [
          'Envoyer un message de motivation',
          'Proposer un accompagnement personnalisé',
          'Ajuster le parcours d\'apprentissage'
        ]
      },
      {
        studentId: 'student-2',
        studentName: 'Pierre Martin',
        studentAvatar: '',
        formationId: 'form-2',
        formationName: 'Angular Fundamentals',
        riskLevel: 'medium',
        reasons: ['Inactif depuis 4 jours', 'Baisse de performance récente'],
        lastActivity: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        daysInactive: 4,
        progress: 58,
        performance: 'average',
        suggestedActions: [
          'Rappel par message',
          'Vérifier les difficultés rencontrées'
        ]
      }
    ]);
  }

  // ==================== ÉVALUATION ====================
  
  getExerciseReviews(): Observable<ExerciseReview[]> {
    // Mock data
    return of([
      {
        id: 'review-1',
        exerciseId: 'ex-1',
        exerciseName: 'Fonctions JavaScript',
        exerciseTitle: 'Fonctions JavaScript',
        submissionId: 'sub-1',
        studentId: 'student-1',
        studentName: 'Marie Dupont',
        submittedAt: new Date('2024-12-10T14:30:00'),
        content: 'J\'ai créé une fonction qui calcule la somme de deux nombres...',
        answerPreview: 'J\'ai créé une fonction qui calcule la somme de deux nombres...',
        attachments: [],
        timeSpent: 25,
        formationId: 'form-1',
        maxScore: 100,
        status: 'pending'
      },
      {
        id: 'review-2',
        exerciseId: 'ex-2',
        exerciseName: 'Manipulation du DOM',
        exerciseTitle: 'Manipulation du DOM',
        submissionId: 'sub-2',
        studentId: 'student-2',
        studentName: 'Pierre Martin',
        submittedAt: new Date('2024-12-09T10:15:00'),
        content: 'J\'ai utilisé querySelector pour sélectionner les éléments...',
        answerPreview: 'J\'ai utilisé querySelector pour sélectionner les éléments...',
        attachments: [],
        timeSpent: 35,
        formationId: 'form-1',
        score: 85,
        maxScore: 100,
        status: 'reviewed',
        reviewedBy: 'trainer-1',
        reviewedAt: new Date('2024-12-09T11:00:00')
      }
    ]);
  }

  getQuizReviews(): Observable<QuizReview[]> {
    // Mock data
    return of([
      {
        id: 'quiz-review-1',
        quizId: 'quiz-1',
        quizName: 'Quiz JavaScript Basics',
        quizTitle: 'Quiz JavaScript Basics',
        attemptId: 'attempt-1',
        studentId: 'student-1',
        studentName: 'Marie Dupont',
        completedAt: new Date('2024-12-10T15:00:00'),
        score: 75,
        percentage: 75,
        passed: true,
        correctAnswers: 15,
        totalQuestions: 20,
        timeSpent: 30,
        formationId: 'form-1',
        answers: [],
        hasFeedback: false,
        reviewed: false
      },
      {
        id: 'quiz-review-2',
        quizId: 'quiz-2',
        quizName: 'Quiz React Hooks',
        quizTitle: 'Quiz React Hooks',
        attemptId: 'attempt-2',
        studentId: 'student-2',
        studentName: 'Pierre Martin',
        completedAt: new Date('2024-12-09T16:30:00'),
        score: 90,
        percentage: 90,
        passed: true,
        correctAnswers: 18,
        totalQuestions: 20,
        timeSpent: 25,
        formationId: 'form-1',
        answers: [],
        hasFeedback: true,
        feedback: 'Excellent travail ! Très bonne compréhension des hooks React.',
        reviewed: true,
        reviewedBy: 'trainer-1',
        reviewedAt: new Date('2024-12-09T17:00:00')
      }
    ]);
  }

  getPendingExerciseReviews(): Observable<ExerciseReview[]> {
    return this.http.get<ExerciseReview[]>(`${this.apiUrl}/reviews/exercises/pending`);
  }

  reviewExercise(reviewId: string, feedback: string, score: number): Observable<ExerciseReview> {
    return this.http.post<ExerciseReview>(`${this.apiUrl}/reviews/exercises/${reviewId}`, { feedback, score });
  }

  getPendingQuizReviews(): Observable<QuizReview[]> {
    return this.http.get<QuizReview[]>(`${this.apiUrl}/reviews/quizzes/pending`);
  }

  reviewQuiz(reviewId: string, feedback: string): Observable<QuizReview> {
    return this.http.post<QuizReview>(`${this.apiUrl}/reviews/quizzes/${reviewId}`, { feedback });
  }

  // ==================== COMMUNICATION ====================
  
  getMessages(): Observable<TrainerMessage[]> {
    return this.http.get<TrainerMessage[]>(`${this.apiUrl}/messages`);
  }

  getTrainerMessages(): Observable<TrainerMessage[]> {
    // Mock data
    return of([
      {
        id: 'msg-1',
        senderId: 'student-1',
        senderName: 'Marie Dupont',
        senderRole: 'student',
        recipientId: 'trainer-1',
        recipientName: 'Jean Formateur',
        recipientRole: 'trainer',
        subject: 'Question sur le module JavaScript',
        content: 'Bonjour, j\'ai une question concernant les fonctions fléchées dans le module JavaScript. Pourriez-vous m\'aider ?',
        type: 'message',
        priority: 'medium',
        read: false,
        sentAt: new Date('2024-12-10T10:30:00')
      },
      {
        id: 'msg-2',
        senderId: 'student-2',
        senderName: 'Pierre Martin',
        senderRole: 'student',
        recipientId: 'trainer-1',
        recipientName: 'Jean Formateur',
        recipientRole: 'trainer',
        subject: 'Problème avec l\'exercice 3',
        content: 'Je rencontre des difficultés avec l\'exercice 3 du module React. Le composant ne se rend pas correctement.',
        type: 'message',
        priority: 'high',
        read: true,
        readAt: new Date('2024-12-10T11:00:00'),
        sentAt: new Date('2024-12-10T09:15:00')
      }
    ]);
  }

  getStudentQuestions(): Observable<StudentQuestion[]> {
    // Mock data
    return of([
      {
        id: 'q-1',
        studentId: 'student-1',
        studentName: 'Marie Dupont',
        question: 'Comment utiliser les hooks React dans un composant fonctionnel ?',
        category: 'technical',
        priority: 'high',
        status: 'open',
        createdAt: new Date('2024-12-10T14:30:00')
      },
      {
        id: 'q-2',
        studentId: 'student-2',
        studentName: 'Pierre Martin',
        question: 'Quelle est la différence entre useState et useEffect ?',
        category: 'content',
        priority: 'medium',
        status: 'answered',
        answer: 'useState gère l\'état local, tandis que useEffect gère les effets de bord...',
        answeredBy: 'trainer-1',
        answeredAt: new Date('2024-12-10T15:00:00'),
        createdAt: new Date('2024-12-10T13:00:00')
      }
    ]);
  }

  getReminders(): Observable<Reminder[]> {
    // Mock data
    return of([
      {
        id: 'rem-1',
        trainerId: 'trainer-1',
        targetAudience: 'formation_students',
        recipients: ['student-1', 'student-2', 'student-3'],
        formationId: 'form-1',
        type: 'deadline',
        title: 'Échéance du projet final',
        message: 'Rappel : Le projet final doit être soumis avant le 20 décembre 2024.',
        scheduledFor: new Date('2024-12-15T09:00:00'),
        sent: false,
        createdBy: 'trainer-1',
        createdAt: new Date('2024-12-10T10:00:00')
      },
      {
        id: 'rem-2',
        trainerId: 'trainer-1',
        targetAudience: 'all_students',
        recipients: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'],
        type: 'session',
        title: 'Session de révision',
        message: 'Session de révision prévue demain à 14h00. N\'oubliez pas de préparer vos questions.',
        scheduledFor: new Date('2024-12-11T14:00:00'),
        sent: true,
        sentAt: new Date('2024-12-10T16:00:00'),
        createdBy: 'trainer-1',
        createdAt: new Date('2024-12-09T10:00:00')
      }
    ]);
  }

  sendMessage(message: Partial<TrainerMessage>): Observable<TrainerMessage> {
    return this.http.post<TrainerMessage>(`${this.apiUrl}/messages`, message);
  }

  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}/alerts`);
  }

  markAlertAsRead(alertId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/alerts/${alertId}/read`, {});
  }

  // ==================== PARCOURS PERSONNALISÉS ====================
  
  getLearningPaths(): Observable<PersonalizedLearningPath[]> {
    return this.http.get<PersonalizedLearningPath[]>(`${this.apiUrl}/learning-paths`);
  }

  getPersonalizedPaths(): Observable<PersonalizedLearningPath[]> {
    return this.getLearningPaths();
  }

  getAIPathSuggestions(): Observable<any[]> {
    // Mock data
    return of([
      {
        id: 'sug-1',
        studentName: 'Marie Dupont',
        suggestion: 'Ajouter un module de révision sur les bases de JavaScript',
        priority: 'high'
      },
      {
        id: 'sug-2',
        studentName: 'Pierre Martin',
        suggestion: 'Réduire la difficulté des exercices du module React',
        priority: 'medium'
      }
    ]);
  }

  createLearningPath(path: Partial<PersonalizedLearningPath>): Observable<PersonalizedLearningPath> {
    return this.http.post<PersonalizedLearningPath>(`${this.apiUrl}/learning-paths`, path);
  }

  updateLearningPath(id: string, path: Partial<PersonalizedLearningPath>): Observable<PersonalizedLearningPath> {
    return this.http.put<PersonalizedLearningPath>(`${this.apiUrl}/learning-paths/${id}`, path);
  }

  // ==================== ASSISTANT IA ====================
  
  generateContent(request: Partial<AIContentGenerationRequest>): Observable<AIGeneratedContent> {
    return this.http.post<AIGeneratedContent>(`${this.apiUrl}/ai/generate`, request);
  }

  approveAIContent(contentId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/ai/approve/${contentId}`, {});
  }

  getAIGenerationHistory(): Observable<AIGeneratedContent[]> {
    return this.http.get<AIGeneratedContent[]>(`${this.apiUrl}/ai/history`);
  }
}



