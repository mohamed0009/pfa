import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  TrainerProfile, 
  TrainerStats, 
  AtRiskStudent, 
  FormationStatistics,
  TrainerFormation,
  StudentDashboard,
  TrainerModule,
  TrainerCourse,
  TrainerLesson,
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
  AIGeneratedContent,
  ContentStatus,
  DifficultyLevel
} from '../models/trainer.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private apiUrl = 'http://localhost:8081/api/trainer';

  constructor(private http: HttpClient) {}

  // ==================== PROFIL FORMATEUR ====================
  
  getTrainerProfile(): Observable<TrainerProfile> {
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        avatarUrl: user.avatarUrl || '',
        phone: user.phone || '',
        bio: user.bio || '',
        specializations: user.specializations || [],
        formationsAssigned: user.formationsAssigned || [],
        status: user.status || 'active',
        validatedAt: user.validatedAt ? new Date(user.validatedAt) : new Date(),
        joinedAt: user.joinedAt ? new Date(user.joinedAt) : new Date(),
        lastActive: user.lastActive ? new Date(user.lastActive) : new Date(),
        preferences: {
          language: 'fr',
          notificationsEnabled: true,
          emailUpdates: true,
          defaultDifficultyLevel: 'Moyen' as 'Facile' | 'Moyen' | 'Difficile',
          aiAssistanceEnabled: true
        }
      })),
      catchError((error) => {
        console.error('Error fetching trainer profile:', error);
        return throwError(() => error);
      })
    );
  }

  updateTrainerProfile(profile: Partial<TrainerProfile>): Observable<TrainerProfile> {
    return this.http.put<any>(`${this.apiUrl}/profile`, profile).pipe(
      map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        avatarUrl: user.avatarUrl || '',
        phone: user.phone || '',
        bio: user.bio || '',
        specializations: user.specializations || [],
        formationsAssigned: user.formationsAssigned || [],
        status: user.status || 'active',
        validatedAt: user.validatedAt ? new Date(user.validatedAt) : new Date(),
        joinedAt: user.joinedAt ? new Date(user.joinedAt) : new Date(),
        lastActive: user.lastActive ? new Date(user.lastActive) : new Date(),
        preferences: {
          language: 'fr',
          notificationsEnabled: true,
          emailUpdates: true,
          defaultDifficultyLevel: 'Moyen' as 'Facile' | 'Moyen' | 'Difficile',
          aiAssistanceEnabled: true
        }
      }))
    );
  }

  getTrainerStats(): Observable<TrainerStats> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map((stats: any) => ({
        trainerId: stats.trainerId || '',
        totalStudents: stats.totalStudents || 0,
        activeStudents: stats.activeStudents || 0,
        totalFormations: stats.totalFormations || 0,
        totalModules: stats.totalModules || 0,
        totalCourses: stats.totalCourses || 0,
        totalExercises: stats.totalExercises || 0,
        totalQuizzes: stats.totalQuizzes || 0,
        contentPendingValidation: stats.contentPendingValidation || 0,
        contentApproved: stats.contentApproved || 0,
        averageStudentProgress: stats.averageProgress || 0,
        averageStudentSatisfaction: stats.averageSatisfaction || 0,
        responseTime: stats.responseTime || 0
      })),
      catchError((error) => {
        console.error('Error fetching trainer stats:', error);
        return throwError(() => error);
      })
    );
  }

  // ==================== GESTION DES FORMATIONS ====================
  
  getFormationsStatistics(): Observable<FormationStatistics[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats/formations/statistics`).pipe(
      map((data: any[]) => {
        return data.map(item => ({
          formationId: item.formationId,
          formationName: item.formationName,
          totalStudents: item.totalStudents || 0,
          activeStudents: item.activeStudents || 0,
          averageProgress: item.averageProgress || 0,
          averageCompletionTime: item.averageCompletionTime || 0,
          averageScore: item.averageScore || 0,
          completionRate: item.completionRate || 0,
          dropoutRate: item.dropoutRate || 0,
          modulesStatistics: [],
          coursesStatistics: [],
          performanceTrend: []
        }));
      }),
      catchError((error) => {
        console.error('Error fetching formations statistics:', error);
        return of([]);
      })
    );
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

  submitForValidation(id: string, type: 'formation' | 'module' | 'course'): Observable<TrainerFormation> {
    if (type === 'formation') {
      return this.http.post<TrainerFormation>(`${this.apiUrl}/formations/${id}/submit`, {});
    }
    // Pour les autres types, utiliser l'endpoint générique si nécessaire
    return this.http.post<TrainerFormation>(`${this.apiUrl}/validation/submit`, { id, type });
  }
  
  /**
   * Repasse une formation en brouillon (pour modifications)
   */
  setFormationToDraft(id: string): Observable<TrainerFormation> {
    return this.http.put<TrainerFormation>(`${this.apiUrl}/formations/${id}`, { status: 'DRAFT' });
  }
  
  /**
   * Duplique une formation (pour créer une nouvelle version)
   */
  duplicateFormation(id: string): Observable<TrainerFormation> {
    return this.http.post<TrainerFormation>(`${this.apiUrl}/formations/${id}/duplicate`, {});
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

  getModuleById(id: string): Observable<TrainerModule> {
    return this.http.get<TrainerModule>(`${this.apiUrl}/modules/${id}`);
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
    // Utiliser le nouvel endpoint qui retourne les cours du formateur avec toutes les infos
    return this.http.get<any[]>(`${this.apiUrl}/stats/courses`).pipe(
      map((data: any[]) => {
        return data.map(item => ({
          id: item.id,
          moduleId: item.moduleId || '',
          title: item.title || '',
          description: item.description || '',
          content: '',
          order: 0,
          status: (item.status || 'draft') as ContentStatus,
          duration: item.duration || 0,
          difficulty: item.difficulty ? (item.difficulty as DifficultyLevel) : undefined,
          lessons: [],
          resources: [],
          exercises: [],
          quizzes: [],
          enrolledStudents: item.enrolledCount || 0,
          enrolledCount: item.enrolledCount || 0,
          completionRate: item.completionRate || 0,
          createdBy: '',
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
        } as TrainerCourse));
      }),
      catchError((error) => {
        console.error('Error fetching trainer courses:', error);
        // Fallback vers l'ancien endpoint
        return this.getCourses();
      })
    );
  }

  getCourseById(id: string): Observable<TrainerCourse> {
    return this.http.get<TrainerCourse>(`${this.apiUrl}/courses/${id}`);
  }

  createCourse(course: Partial<TrainerCourse>): Observable<TrainerCourse> {
    return this.http.post<TrainerCourse>(`${this.apiUrl}/courses`, course).pipe(
      map((course: any) => ({
        id: course.id,
        moduleId: course.module?.id || course.moduleId || '',
        title: course.title,
        description: course.description || '',
        content: course.longDescription || course.description || '',
        order: course.order || 0,
        status: (course.status?.toLowerCase() || 'draft') as ContentStatus,
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
      } as TrainerCourse))
    );
  }

  getModuleQuiz(moduleId: string): Observable<TrainerQuiz | null> {
    return this.http.get<TrainerQuiz>(`${this.apiUrl}/modules/${moduleId}/quiz`).pipe(
      catchError(() => of(null))
    );
  }

  createModuleQuiz(quizData: any): Observable<TrainerQuiz> {
    return this.http.post<TrainerQuiz>(`${this.apiUrl}/modules/${quizData.moduleId}/quiz`, quizData);
  }

  updateCourse(id: string, course: Partial<TrainerCourse>): Observable<TrainerCourse> {
    return this.http.put<TrainerCourse>(`${this.apiUrl}/courses/${id}`, course);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/courses/${id}`);
  }

  // ==================== LEÇONS ====================
  
  getLessons(courseId?: string): Observable<TrainerLesson[]> {
    const url = courseId 
      ? `${this.apiUrl}/lessons?courseId=${courseId}`
      : `${this.apiUrl}/lessons`;
    return this.http.get<TrainerLesson[]>(url).pipe(
      map((lessons: any[]) => {
        return lessons.map(lesson => ({
          id: lesson.id,
          courseId: lesson.course?.id || courseId || '',
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
        } as TrainerLesson));
      }),
      catchError((error) => {
        console.error('Error fetching lessons:', error);
        return of([]);
      })
    );
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

  createLesson(lesson: Partial<TrainerLesson>): Observable<TrainerLesson> {
    return this.http.post<TrainerLesson>(`${this.apiUrl}/lessons`, lesson).pipe(
      map((lesson: any) => ({
        id: lesson.id,
        courseId: lesson.course?.id || '',
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
      } as TrainerLesson))
    );
  }

  updateLesson(id: string, lesson: Partial<TrainerLesson>): Observable<TrainerLesson> {
    return this.http.put<TrainerLesson>(`${this.apiUrl}/lessons/${id}`, lesson);
  }

  deleteLesson(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/lessons/${id}`);
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

  // ==================== QUESTIONS DE QUIZ ====================
  
  getQuizById(id: string): Observable<TrainerQuiz> {
    return this.http.get<TrainerQuiz>(`${this.apiUrl}/quizzes/${id}`);
  }

  getQuizQuestions(quizId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/quiz-questions/quiz/${quizId}`);
  }

  createQuizQuestion(question: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/quiz-questions`, question);
  }

  updateQuizQuestion(id: string, question: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/quiz-questions/${id}`, question);
  }

  deleteQuizQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/quiz-questions/${id}`);
  }

  // ==================== SUIVI DES APPRENANTS ====================
  
  getStudents(formationId?: string): Observable<StudentDashboard[]> {
    // Utiliser l'endpoint /levels qui utilise le Gradient Boosting pour calculer les niveaux
    const url = formationId 
      ? `${this.apiUrl}/students/levels?formationId=${formationId}`
      : `${this.apiUrl}/students/levels`;
    
    return this.http.get<any[]>(url).pipe(
      map((users: any[]) => {
        // Mapper les User du backend vers StudentDashboard avec les niveaux calculés par Gradient Boosting
        return users.map(user => ({
          studentId: user.id,
          studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          studentEmail: user.email,
          studentAvatar: user.avatarUrl || '',
          formationId: formationId || '',
          formationName: 'Formation',
          overallProgress: 0, // À calculer depuis CourseProgress
          modulesCompleted: 0,
          totalModules: 0,
          coursesCompleted: 0,
          totalCourses: 0,
          timeSpent: 0,
          lastActivity: user.lastConversationDate ? new Date(user.lastConversationDate) : new Date(),
          currentStreak: 0,
          averageScore: 0,
          performance: {
            studentId: user.id,
            formationId: formationId || '',
            modulesProgress: [],
            coursesProgress: [],
            quizScores: [],
            exerciseScores: [],
            timeDistribution: [],
            trend: 'stable' as const
          },
          difficulties: [],
          achievements: [],
          chatLevel: user.level || 'Débutant', // Niveau calculé par Gradient Boosting
          chatLevelScore: user.levelScore || 0,
          totalConversations: user.totalConversations || 0,
          totalChatMessages: user.totalMessages || 0
        } as StudentDashboard));
      }),
      catchError((error) => {
        console.error('Error fetching students with levels:', error);
        // Fallback vers l'endpoint standard
        const fallbackUrl = formationId 
          ? `${this.apiUrl}/students?formationId=${formationId}`
          : `${this.apiUrl}/students`;
        return this.http.get<any[]>(fallbackUrl).pipe(
          map((users: any[]) => users.map(user => ({
            studentId: user.id,
            studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            studentEmail: user.email,
            studentAvatar: user.avatarUrl || '',
            formationId: formationId || '',
            formationName: 'Formation',
            overallProgress: 0,
            modulesCompleted: 0,
            totalModules: 0,
            coursesCompleted: 0,
            totalCourses: 0,
            timeSpent: 0,
            lastActivity: new Date(),
            currentStreak: 0,
            averageScore: 0,
            performance: {
              studentId: user.id,
              formationId: formationId || '',
              modulesProgress: [],
              coursesProgress: [],
              quizScores: [],
              exerciseScores: [],
              timeDistribution: [],
              trend: 'stable' as const
            },
            difficulties: [],
            achievements: [],
            chatLevel: 'Débutant',
            chatLevelScore: 0,
            totalConversations: 0,
            totalChatMessages: 0
          } as StudentDashboard)))
        );
      })
    );
  }
  
  // Méthode pour obtenir les étudiants avec leurs niveaux (utilise Gradient Boosting)
  getStudentsWithLevels(formationId?: string): Observable<StudentDashboard[]> {
    // Utiliser l'endpoint avec niveaux
    const url = formationId 
      ? `${this.apiUrl}/students/levels?formationId=${formationId}`
      : `${this.apiUrl}/students/levels`;
    return this.http.get<any[]>(url).pipe(
      map((users: any[]) => {
        // Mapper les User du backend vers StudentDashboard
        return users.map(user => ({
          studentId: user.id,
          studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          studentEmail: user.email,
          studentAvatar: user.avatarUrl || '',
          formationId: formationId || '',
          formationName: 'Formation',
          overallProgress: 0, // À calculer depuis CourseProgress
          modulesCompleted: 0,
          totalModules: 0,
          coursesCompleted: 0,
          totalCourses: 0,
          timeSpent: 0,
          lastActivity: new Date(),
          currentStreak: 0,
          averageScore: 0,
          performance: {
            studentId: user.id,
            formationId: formationId || '',
            modulesProgress: [],
            coursesProgress: [],
            quizScores: [],
            exerciseScores: [],
            timeDistribution: [],
            trend: 'stable' as const
          },
          difficulties: [],
          achievements: [],
          chatLevel: (user as any).level || 'Débutant',
          chatLevelScore: (user as any).levelScore || 0,
          totalConversations: (user as any).totalConversations || 0,
          totalChatMessages: (user as any).totalMessages || 0
        } as StudentDashboard));
      }),
      catchError((error) => {
        console.error('Error fetching students:', error);
        return of([]);
      })
    );
  }

  getStudentById(id: string): Observable<StudentDashboard> {
    return this.http.get<StudentDashboard>(`${this.apiUrl}/students/${id}`);
  }

  getAtRiskStudents(): Observable<AtRiskStudent[]> {
    return this.http.get<any[]>(`${this.apiUrl}/students/at-risk`).pipe(
      map((students: any[]) => students.map((s: any) => ({
        studentId: s.studentId || '',
        studentName: s.studentName || '',
        studentAvatar: s.studentAvatar || '',
        formationId: s.formationId || '',
        formationName: s.formationName || '',
        riskLevel: (s.riskLevel || 'low') as 'low' | 'medium' | 'high',
        reasons: s.reasons || [],
        lastActivity: s.lastActivity ? new Date(s.lastActivity) : new Date(),
        daysInactive: s.daysInactive || 0,
        progress: s.progress || 0,
        performance: (s.performance || 'average') as 'poor' | 'average' | 'good',
        suggestedActions: s.suggestedActions || []
      }))),
      catchError((error) => {
        console.error('Error fetching at-risk students:', error);
        // Fallback to empty array
        return of([]);
      })
    );
  }

  // ==================== FORMATION STUDENTS ====================
  
  /**
   * Récupère les étudiants inscrits à une formation avec leur progression détaillée
   */
  getFormationStudents(formationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formations/${formationId}/students`).pipe(
      map((students: any[]) => students.map((s: any) => ({
        id: s.id,
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        email: s.email || '',
        avatarUrl: s.avatarUrl || '',
        enrollmentId: s.enrollmentId,
        enrolledAt: s.enrolledAt ? new Date(s.enrolledAt) : new Date(),
        status: s.status || 'ACTIVE',
        overallProgress: s.overallProgress || 0,
        completedModules: s.completedModules || 0,
        totalModules: s.totalModules || 0,
        completedLessons: s.completedLessons || 0,
        totalLessons: s.totalLessons || 0,
        averageQuizScore: s.averageQuizScore || 0,
        lastActivityDate: s.lastActivityDate ? new Date(s.lastActivityDate) : undefined,
        modulesProgress: s.modulesProgress || []
      }))),
      catchError((error) => {
        console.error('Error fetching formation students:', error);
        return of([]);
      })
    );
  }

  // ==================== ÉVALUATION ====================
  
  getExerciseReviews(): Observable<ExerciseReview[]> {
    // Utiliser l'endpoint backend pour récupérer tous les exercices (pas seulement pending)
    return this.http.get<any[]>(`${this.apiUrl}/exercises/submissions`).pipe(
      map((submissions: any[]) => {
        return submissions.map(sub => ({
          id: sub.id,
          exerciseId: sub.exercise?.id || '',
          exerciseName: sub.exercise?.title || 'Exercice',
          exerciseTitle: sub.exercise?.title || 'Exercice',
          submissionId: sub.id,
          studentId: sub.user?.id || '',
          studentName: `${sub.user?.firstName || ''} ${sub.user?.lastName || ''}`.trim() || 'Apprenant',
          studentAvatar: sub.user?.avatarUrl || '',
          submittedAt: sub.submittedAt ? new Date(sub.submittedAt) : new Date(),
          content: sub.content || sub.answer || '',
          attachments: sub.attachments || [],
          answerPreview: sub.content ? (sub.content.length > 100 ? sub.content.substring(0, 100) + '...' : sub.content) : '',
          timeSpent: sub.timeSpent || 0,
          formationId: sub.exercise?.course?.module?.formation?.id || '',
          score: sub.score || undefined,
          maxScore: sub.exercise?.maxScore || 100,
          feedback: sub.feedback || undefined,
          recommendations: [],
          status: (sub.status?.toLowerCase() || 'pending') as 'pending' | 'reviewed' | 'graded' | 'validated',
          reviewedBy: sub.gradedBy?.id || undefined,
          reviewedAt: sub.reviewedAt ? new Date(sub.reviewedAt) : undefined,
          gradedAt: sub.reviewedAt ? new Date(sub.reviewedAt) : undefined
        } as ExerciseReview));
      }),
      catchError((error) => {
        console.error('Error fetching exercise reviews:', error);
        // Fallback vers pending reviews
        return this.getPendingExerciseReviews();
      })
    );
  }

  getExerciseReviewsMock(): Observable<ExerciseReview[]> {
    // Mock data (fallback)
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
    // Utiliser l'endpoint backend pour récupérer tous les quiz attempts
    return this.http.get<any[]>(`${this.apiUrl}/reviews/quizzes/pending`).pipe(
      map((attempts: any[]) => {
        return attempts.map(attempt => ({
          id: attempt.id,
          quizId: attempt.quiz?.id || '',
          quizName: attempt.quiz?.title || 'Quiz',
          quizTitle: attempt.quiz?.title || 'Quiz',
          attemptId: attempt.id,
          studentId: attempt.user?.id || '',
          studentName: `${attempt.user?.firstName || ''} ${attempt.user?.lastName || ''}`.trim() || 'Apprenant',
          studentAvatar: attempt.user?.avatarUrl || undefined,
          completedAt: attempt.completedAt ? new Date(attempt.completedAt) : new Date(),
          score: attempt.score || 0,
          percentage: attempt.percentage || 0,
          passed: attempt.passed || false,
          correctAnswers: attempt.correctAnswers || 0,
          totalQuestions: attempt.totalQuestions || 0,
          timeSpent: attempt.timeSpent || undefined,
          formationId: attempt.quiz?.course?.module?.formation?.id || undefined,
          answers: attempt.answers || [],
          hasFeedback: !!attempt.feedback,
          feedback: attempt.feedback || undefined,
          recommendations: [],
          reviewed: !!attempt.feedback,
          reviewedBy: attempt.reviewedBy?.id || undefined,
          reviewedAt: attempt.reviewedAt ? new Date(attempt.reviewedAt) : undefined
        } as QuizReview));
      }),
      catchError((error) => {
        console.error('Error fetching quiz reviews:', error);
        // Fallback vers pending reviews
        return this.getPendingQuizReviews();
      })
    );
  }

  getQuizReviewsMock(): Observable<QuizReview[]> {
    // Mock data (fallback)
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
    return this.http.get<any[]>(`${this.apiUrl}/messages`).pipe(
      map((messages: any[]) => {
        if (!messages || messages.length === 0) {
          return [];
        }
        return messages.map((msg: any) => {
          const user = msg.conversation?.user || {};
          const senderRole = msg.sender === 'USER' ? 'student' : (user.role?.toLowerCase() === 'user' ? 'student' : user.role?.toLowerCase() === 'trainer' ? 'trainer' : 'admin');
          const senderName = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`.trim()
            : (user.firstName || user.lastName || user.email || 'Utilisateur');
          
          return {
            id: msg.id || msg.conversationId || '',
            conversationId: msg.conversationId || msg.conversation?.id || '',
            senderId: user.id || '',
            senderName: senderName,
            senderRole: senderRole as 'student' | 'trainer' | 'admin',
            recipientId: '', // À déterminer selon le contexte
            recipientName: '',
            recipientRole: 'trainer' as 'student' | 'trainer' | 'admin',
            subject: msg.content?.substring(0, 50) || 'Message',
            content: msg.content || '',
            type: 'message' as 'message' | 'reminder' | 'feedback' | 'announcement',
            priority: 'medium' as 'low' | 'medium' | 'high',
            read: msg.read || false,
            sentAt: msg.timestamp ? new Date(msg.timestamp) : new Date()
          };
        });
      }),
      catchError((error) => {
        console.error('Error fetching trainer messages:', error);
        return of([]);
      })
    );
  }

  getConversationMessages(conversationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages/conversation/${conversationId}`).pipe(
      catchError((error) => {
        console.error('Error fetching conversation messages:', error);
        return of([]);
      })
    );
  }

  getStudentQuestions(): Observable<StudentQuestion[]> {
    // Utiliser les messages de chat comme questions d'étudiants
    return this.http.get<any[]>(`${this.apiUrl}/messages`).pipe(
      map((messages: any[]) => {
        // Filtrer les messages des étudiants (USER) et les mapper comme questions
        return messages
          .filter((msg: any) => msg.sender === 'USER' && msg.conversation?.user?.role === 'USER')
          .map((msg: any, index: number) => ({
            id: msg.id || `q-${index}`,
            studentId: msg.conversation?.user?.id || '',
            studentName: msg.conversation?.user ? `${msg.conversation.user.firstName || ''} ${msg.conversation.user.lastName || ''}`.trim() : 'Étudiant',
            question: msg.content || '',
            category: 'technical' as 'technical' | 'content' | 'pedagogical' | 'other',
            priority: 'medium' as 'low' | 'medium' | 'high',
            status: 'open' as 'open' | 'answered' | 'resolved' | 'closed',
            createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
      }),
      catchError((error) => {
        console.error('Error fetching student questions:', error);
        return of([]);
      })
    );
  }

  getReminders(): Observable<Reminder[]> {
    // Pour l'instant, retourner un tableau vide car il n'y a pas de modèle Reminder dans le backend
    // TODO: Créer un modèle Reminder dans le backend si nécessaire
    return of([]).pipe(
      catchError((error) => {
        console.error('Error fetching reminders:', error);
        return of([]);
      })
    );
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
    return this.http.get<any[]>(`${this.apiUrl}/learning-paths`).pipe(
      map((paths: any[]) => paths.map(p => {
        // Extraire les informations des ajustements (recommandations ML)
        const adjustments = p.adjustments || [];
        const mainAdjustment = adjustments.length > 0 ? adjustments[0] : {};
        
        return {
          id: p.id || '',
          studentId: p.studentId || '',
          studentName: p.studentName || '',
          formationId: p.formationId || '',
          formationName: p.formationName || '',
          formationTitle: p.formationName || '',
          baseFormationId: p.baseFormationId || p.formationId || '',
          adjustments: adjustments,
          modules: p.modules || [],
          modulesCount: p.modules?.length || 0,
          status: (p.status || 'active') as 'active' | 'completed' | 'archived' | 'draft',
          createdBy: p.createdBy || '',
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          // Informations basées sur le ML
          aiSuggestions: p.aiSuggestions || [],
          confidenceScore: mainAdjustment.confidenceScore || 0,
          predictedDifficulty: mainAdjustment.predictedDifficulty || null,
          courseTitle: mainAdjustment.courseTitle || '',
          conversationExcerpt: mainAdjustment.conversationExcerpt || '',
          completionRate: 0, // À calculer si disponible
          estimatedTime: 0, // À calculer si disponible
          averageScore: 0 // À calculer si disponible
        };
      })),
      catchError((error) => {
        console.error('Error fetching personalized paths:', error);
        return of([]);
      })
    );
  }

  getAIPathSuggestions(): Observable<any[]> {
    // Utiliser les nouveaux endpoints de recommandations ML
    return this.http.get<any[]>(`${this.apiUrl}/recommendations`).pipe(
      map((recommendations: any[]) => recommendations.map((rec: any) => {
        // Extraire le nom de l'étudiant depuis students array
        const student = rec.students && rec.students.length > 0 ? rec.students[0] : null;
        const studentName = student 
          ? `${student.name || student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'Étudiant'
          : 'Étudiant';
        
        // Construire une suggestion détaillée avec les infos du ML
        let suggestion = rec.justification || rec.description || `Recommandation basée sur l'analyse ML des conversations`;
        if (rec.title) {
          suggestion = `${rec.title}: ${suggestion}`;
        }
        
        // Extraire la confiance depuis basedOn ou utiliser une valeur par défaut
        const confidence = rec.confidence || this.extractConfidenceFromBasedOn(rec.basedOn) || 0.75;
        
        return {
          id: rec.id,
          studentName: studentName,
          suggestion: suggestion,
          priority: confidence > 0.7 ? 'high' : 'medium',
          confidenceScore: confidence,
          courseTitle: rec.title || '',
          conversationExcerpt: rec.justification || '',
          studentId: student?.id || '',
          specialty: rec.specialty || '',
          level: rec.level || '',
          topics: rec.topics || []
        };
      })),
      catchError((error) => {
        console.error('Error fetching AI path suggestions:', error);
        return of([]);
      })
    );
  }

  private extractConfidenceFromBasedOn(basedOn: string[]): number | null {
    if (!basedOn || !Array.isArray(basedOn)) return null;
    
    for (const item of basedOn) {
      const match = item.match(/confiance:\s*(\d+(?:\.\d+)?)/i);
      if (match) {
        return parseFloat(match[1]) / 100.0;
      }
    }
    return null;
  }

  // Nouvelle méthode pour récupérer les recommandations ML détaillées
  getMLRecommendations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ml-recommendations`).pipe(
      map((recommendations: any[]) => recommendations.map(rec => ({
        id: rec.id,
        title: rec.title,
        description: rec.description,
        justification: rec.justification,
        level: rec.level,
        specialty: rec.specialty,
        priority: rec.priority,
        status: rec.status,
        confidence: rec.confidence || this.extractConfidenceFromBasedOn(rec.basedOn) || 0.75,
        topics: rec.topics || [],
        students: rec.students || [],
        studentCount: rec.studentCount || 0,
        createdAt: rec.createdAt ? new Date(rec.createdAt) : new Date(),
        basedOn: rec.basedOn || []
      }))),
      catchError((error) => {
        console.error('Error fetching ML recommendations:', error);
        return of([]);
      })
    );
  }

  // Récupérer les détails d'une recommandation spécifique
  getRecommendationDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ml-recommendations/${id}`).pipe(
      map((rec: any) => ({
        id: rec.id,
        title: rec.title,
        description: rec.description,
        justification: rec.justification,
        level: rec.level,
        specialty: rec.specialty,
        priority: rec.priority,
        status: rec.status,
        confidence: rec.confidence || this.extractConfidenceFromBasedOn(rec.basedOn) || 0.75,
        topics: rec.topics || [],
        students: rec.students || [],
        studentCount: rec.studentCount || 0,
        createdAt: rec.createdAt ? new Date(rec.createdAt) : new Date(),
        basedOn: rec.basedOn || [],
        levelAnalysis: rec.levelAnalysis || {}
      })),
      catchError((error) => {
        console.error('Error fetching recommendation details:', error);
        return throwError(() => error);
      })
    );
  }

  // Appliquer une recommandation (créer une formation)
  applyRecommendation(recommendationId: string, formationData?: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ml-recommendations/${recommendationId}/apply`, formationData || {}).pipe(
      map((response: any) => ({
        message: response.message,
        formation: response.formation,
        recommendationId: response.recommendationId
      })),
      catchError((error) => {
        console.error('Error applying recommendation:', error);
        return throwError(() => error);
      })
    );
  }

  // Générer des recommandations pour tous les étudiants
  generateAllRecommendations(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ml-recommendations/generate`, {}).pipe(
      map((response: any) => ({
        message: response.message,
        count: response.count,
        recommendations: response.recommendations || []
      })),
      catchError((error) => {
        console.error('Error generating recommendations:', error);
        return throwError(() => error);
      })
    );
  }

  createLearningPath(path: Partial<PersonalizedLearningPath>): Observable<PersonalizedLearningPath> {
    return this.http.post<PersonalizedLearningPath>(`${this.apiUrl}/learning-paths`, path);
  }

  updateLearningPath(id: string, path: Partial<PersonalizedLearningPath>): Observable<PersonalizedLearningPath> {
    return this.http.put<PersonalizedLearningPath>(`${this.apiUrl}/learning-paths/${id}`, path);
  }

  // ==================== ASSISTANT IA ====================
  
  generateContent(request: Partial<AIContentGenerationRequest>): Observable<AIGeneratedContent> {
    return this.http.post<any>(`${this.apiUrl}/ai/generate`, request).pipe(
      map((content: any) => ({
        id: content.id || '',
        requestId: content.requestId || content.id || '',
        type: (content.type || 'exercise') as 'exercise' | 'quiz' | 'summary' | 'lesson' | 'example' | 'case_study',
        content: content.content || {},
        metadata: {
          generationTime: content.metadata?.generationTime || 0,
          tokensUsed: content.metadata?.tokensUsed,
          model: content.metadata?.model
        },
        generatedAt: content.createdAt ? new Date(content.createdAt) : new Date(),
        reviewed: content.status === 'approved' || content.status === 'rejected',
        approved: content.status === 'approved',
        used: false,
        rating: content.rating,
        feedback: content.feedback
      })),
      catchError((error) => {
        console.error('Error generating content:', error);
        return throwError(() => error);
      })
    );
  }

  approveAIContent(contentId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/ai/approve/${contentId}`, {}).pipe(
      catchError((error) => {
        console.error('Error approving AI content:', error);
        return throwError(() => error);
      })
    );
  }

  getAIGenerationHistory(): Observable<AIGeneratedContent[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ai/history`).pipe(
      map((history: any[]) => history.map(item => ({
        id: item.id || '',
        requestId: item.requestId || item.id || '',
        type: (item.type || 'exercise') as 'exercise' | 'quiz' | 'summary' | 'lesson' | 'example' | 'case_study',
        content: item.content || {},
        metadata: {
          generationTime: item.metadata?.generationTime || 0,
          tokensUsed: item.metadata?.tokensUsed,
          model: item.metadata?.model
        },
        generatedAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        reviewed: item.status === 'approved' || item.status === 'rejected',
        approved: item.status === 'approved',
        used: false,
        rating: item.rating,
        feedback: item.feedback
      }))),
      catchError((error) => {
        console.error('Error fetching AI generation history:', error);
        return of([]);
      })
    );
  }

  getAIStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/ai/statistics`).pipe(
      map((stats: any) => ({
        totalGenerated: stats.totalGenerated || 0,
        quizzesGenerated: stats.quizzesGenerated || 0,
        exercisesGenerated: stats.exercisesGenerated || 0,
        summariesGenerated: stats.summariesGenerated || 0
      })),
      catchError((error) => {
        console.error('Error fetching AI statistics:', error);
        return of({
          totalGenerated: 0,
          quizzesGenerated: 0,
          exercisesGenerated: 0,
          summariesGenerated: 0
        });
      })
    );
  }

  // ==================== RECOMMANDATIONS ====================
  
  getRecommendations(studentId?: string, status?: string): Observable<any[]> {
    let url = `${this.apiUrl}/recommendations`;
    const params: string[] = [];
    if (studentId) params.push(`studentId=${studentId}`);
    if (status) params.push(`status=${status}`);
    if (params.length > 0) url += '?' + params.join('&');
    
    return this.http.get<any[]>(url).pipe(
      map((recommendations: any[]) => recommendations.map(rec => ({
        id: rec.id,
        studentId: rec.student?.id || rec.studentId,
        studentName: rec.student ? `${rec.student.firstName || ''} ${rec.student.lastName || ''}`.trim() : '',
        studentEmail: rec.student?.email || '',
        courseId: rec.course?.id || rec.courseId,
        course: rec.course ? {
          id: rec.course.id,
          moduleId: rec.course.module?.id || '',
          title: rec.course.title,
          description: rec.course.description || '',
          duration: rec.course.estimatedHours ? rec.course.estimatedHours * 60 : 0,
          difficulty: rec.course.level ? (rec.course.level.toLowerCase() === 'debutant' ? 'Facile' : rec.course.level.toLowerCase() === 'intermediaire' ? 'Moyen' : 'Difficile') as DifficultyLevel : 'Moyen' as DifficultyLevel,
          status: rec.course.status || 'DRAFT',
          category: rec.course.category || '',
          thumbnailUrl: rec.course.thumbnailUrl || ''
        } : undefined,
        reason: rec.reason || '',
        conversationExcerpt: rec.conversationExcerpt || '',
        confidenceScore: rec.confidenceScore || 0,
        status: rec.status || 'PENDING',
        reviewedBy: rec.reviewedBy?.id || rec.reviewedBy,
        reviewedAt: rec.reviewedAt ? new Date(rec.reviewedAt) : undefined,
        reviewNotes: rec.reviewNotes || '',
        createdAt: rec.createdAt ? new Date(rec.createdAt) : new Date(),
        updatedAt: rec.updatedAt ? new Date(rec.updatedAt) : new Date()
      })))
    );
  }

  getRecommendationById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recommendations/${id}`);
  }

  generateRecommendationsForStudent(studentId: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/recommendations/generate/${studentId}`, {});
  }

  acceptRecommendation(id: string, notes?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recommendations/${id}/accept`, { notes: notes || '' });
  }

  rejectRecommendation(id: string, notes?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recommendations/${id}/reject`, { notes: notes || '' });
  }
}



