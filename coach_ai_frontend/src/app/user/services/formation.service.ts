import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  Formation, 
  FormationEnrollment, 
  FormationProgress, 
  ModuleProgress 
} from '../models/formation.interfaces';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = 'http://localhost:8081/api/user/formations';

  constructor(private http: HttpClient) {}

  /**
   * Recherche des formations par spécialité et niveau
   */
  searchFormations(category?: string, level?: string, search?: string): Observable<Formation[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (level) params = params.set('level', level);
    if (search) params = params.set('search', search);

    return this.http.get<Formation[]>(`${this.apiUrl}/search`, { params }).pipe(
      map((formations: any[]) => formations.map(f => this.mapFormation(f))),
      catchError((error) => {
        console.error('Error searching formations:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les détails d'une formation
   */
  getFormation(id: string): Observable<Formation> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(f => this.mapFormation(f)),
      catchError((error) => {
        console.error('Error fetching formation:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Inscription à une formation
   */
  enrollInFormation(formationId: string): Observable<FormationEnrollment> {
    return this.http.post<any>(`${this.apiUrl}/${formationId}/enroll`, {}).pipe(
      map(enrollment => this.mapEnrollment(enrollment)),
      catchError((error) => {
        console.error('Error enrolling in formation:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les formations auxquelles l'utilisateur est inscrit
   */
  getMyFormations(): Observable<FormationEnrollment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-formations`).pipe(
      map(enrollments => enrollments.map(e => this.mapEnrollment(e))),
      catchError((error) => {
        console.error('Error fetching my formations:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère la progression d'un module
   */
  getModuleProgress(enrollmentId: string, moduleId: string): Observable<ModuleProgress> {
    return this.http.get<any>(
      `${this.apiUrl}/enrollments/${enrollmentId}/modules/${moduleId}/progress`
    ).pipe(
      map(progress => this.mapModuleProgress(progress)),
      catchError((error) => {
        console.error('Error fetching module progress:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Marque le texte d'un module comme complété
   */
  markTextCompleted(enrollmentId: string, moduleId: string): Observable<ModuleProgress> {
    return this.http.post<any>(
      `${this.apiUrl}/enrollments/${enrollmentId}/modules/${moduleId}/complete-text`,
      {}
    ).pipe(
      map(progress => this.mapModuleProgress(progress)),
      catchError((error) => {
        console.error('Error completing text:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Marque la vidéo d'un module comme complétée
   */
  markVideoCompleted(enrollmentId: string, moduleId: string): Observable<ModuleProgress> {
    return this.http.post<any>(
      `${this.apiUrl}/enrollments/${enrollmentId}/modules/${moduleId}/complete-video`,
      {}
    ).pipe(
      map(progress => this.mapModuleProgress(progress)),
      catchError((error) => {
        console.error('Error completing video:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Marque le lab d'un module comme complété
   */
  markLabCompleted(enrollmentId: string, moduleId: string): Observable<ModuleProgress> {
    return this.http.post<any>(
      `${this.apiUrl}/enrollments/${enrollmentId}/modules/${moduleId}/complete-lab`,
      {}
    ).pipe(
      map(progress => this.mapModuleProgress(progress)),
      catchError((error) => {
        console.error('Error completing lab:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Soumet le quiz d'un module
   */
  submitModuleQuiz(enrollmentId: string, moduleId: string, answers: Record<string, any>): Observable<ModuleProgress> {
    return this.http.post<any>(
      `${this.apiUrl}/enrollments/${enrollmentId}/modules/${moduleId}/submit-quiz`,
      { answers }
    ).pipe(
      map(progress => this.mapModuleProgress(progress)),
      catchError((error) => {
        console.error('Error submitting quiz:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mappe les données backend vers l'interface frontend
   */
  private mapFormation(data: any): Formation {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      level: data.level,
      category: data.category,
      status: data.status,
      duration: data.duration || 0,
      modules: (data.modules || []).map((m: any) => this.mapModule(m)),
      enrolledCount: data.enrolledCount || 0,
      completionRate: data.completionRate || 0,
      createdBy: data.createdBy?.id || '',
      assignedTo: data.assignedTo?.id,
      assignedToName: data.assignedTo ? 
        `${data.assignedTo.firstName || ''} ${data.assignedTo.lastName || ''}`.trim() : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      submittedForValidationAt: data.submittedForValidationAt ? new Date(data.submittedForValidationAt) : undefined,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      validatedBy: data.validatedBy?.id,
      validatedAt: data.validatedAt ? new Date(data.validatedAt) : undefined,
      rejectionReason: data.rejectionReason
    };
  }

  private mapModule(data: any): any {
    return {
      id: data.id,
      formationId: data.formation?.id || data.formationId,
      title: data.title,
      description: data.description,
      order: data.order || data.moduleOrder || 0,
      status: data.status,
      textContent: data.textContent,
      videoUrl: data.videoUrl,
      labContent: data.labContent,
      quiz: data.quiz ? this.mapQuiz(data.quiz) : undefined,
      isLocked: data.isLocked !== undefined ? data.isLocked : false,
      duration: data.duration || 0,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  private mapQuiz(data: any): any {
    return {
      id: data.id,
      moduleId: data.module?.id || data.moduleId,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      duration: data.duration || 0,
      passingScore: data.passingScore || 70,
      maxAttempts: data.maxAttempts || 3,
      questions: (data.questions || []).map((q: any) => this.mapQuizQuestion(q)),
      status: data.status
    };
  }

  private mapQuizQuestion(data: any): any {
    return {
      id: data.id,
      quizId: data.quiz?.id || data.quizId,
      question: data.question,
      type: data.type,
      options: data.options || [],
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      points: data.points || 1,
      order: data.order || data.questionNumber || 0
    };
  }

  private mapEnrollment(data: any): FormationEnrollment {
    return {
      id: data.id,
      userId: data.user?.id || '',
      formationId: data.formation?.id || '',
      status: data.status,
      enrolledAt: new Date(data.enrolledAt),
      startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      targetCompletionDate: data.targetCompletionDate ? new Date(data.targetCompletionDate) : undefined,
      certificateEarned: data.certificateEarned || false,
      certificateUrl: data.certificateUrl,
      progress: data.progress ? this.mapFormationProgress(data.progress) : {
        id: '',
        enrollmentId: data.id,
        overallProgress: 0,
        completedModules: 0,
        totalModules: 0,
        completedQuizzes: 0,
        totalQuizzes: 0,
        averageQuizScore: 0,
        totalTimeSpent: 0,
        currentStreak: 0
      },
      moduleProgresses: (data.moduleProgresses || []).map((mp: any) => this.mapModuleProgress(mp))
    };
  }

  private mapFormationProgress(data: any): FormationProgress {
    return {
      id: data.id,
      enrollmentId: data.enrollment?.id || '',
      overallProgress: data.overallProgress || 0,
      completedModules: data.completedModules || 0,
      totalModules: data.totalModules || 0,
      completedQuizzes: data.completedQuizzes || 0,
      totalQuizzes: data.totalQuizzes || 0,
      averageQuizScore: data.averageQuizScore || 0,
      totalTimeSpent: data.totalTimeSpent || 0,
      currentStreak: data.currentStreak || 0,
      lastActivityDate: data.lastActivityDate ? new Date(data.lastActivityDate) : undefined
    };
  }

  private mapModuleProgress(data: any): ModuleProgress {
    return {
      id: data.id,
      enrollmentId: data.enrollment?.id || '',
      moduleId: data.module?.id || '',
      textCompleted: data.textCompleted || false,
      videoCompleted: data.videoCompleted || false,
      labCompleted: data.labCompleted || false,
      quizCompleted: data.quizCompleted || false,
      quizScore: data.quizScore,
      isModuleValidated: data.isModuleValidated || data.moduleValidated || false,
      textCompletedAt: data.textCompletedAt ? new Date(data.textCompletedAt) : undefined,
      videoCompletedAt: data.videoCompletedAt ? new Date(data.videoCompletedAt) : undefined,
      labCompletedAt: data.labCompletedAt ? new Date(data.labCompletedAt) : undefined,
      quizCompletedAt: data.quizCompletedAt ? new Date(data.quizCompletedAt) : undefined,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      module: data.module ? this.mapModule(data.module) : undefined,
      getProgressPercentage: () => {
        const completed = (data.textCompleted ? 1 : 0) + 
                         (data.videoCompleted ? 1 : 0) + 
                         (data.labCompleted ? 1 : 0) + 
                         (data.quizCompleted ? 1 : 0);
        return (completed * 100) / 4;
      },
      isFullyCompleted: () => {
        return data.textCompleted && data.videoCompleted && 
               data.labCompleted && data.quizCompleted;
      }
    };
  }
}

