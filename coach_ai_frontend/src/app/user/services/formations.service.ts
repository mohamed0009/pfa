import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Formation, FormationEnrollment, FormationProgress, FormationTrainer, FormationModule } from '../models/formation.interfaces';

@Injectable({
  providedIn: 'root'
})
export class FormationsService {
  private apiUrl = 'http://localhost:8081/api/user/formations';

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les formations disponibles (publiées)
   */
  getAvailableFormations(): Observable<Formation[]> {
    return this.http.get<any[]>(`${this.apiUrl}/available`).pipe(
      map((formations: any[]) => formations.map(f => this.mapBackendFormation(f))),
      catchError((error) => {
        console.error('Error fetching available formations:', error);
        return of([]);
      })
    );
  }
  
  /**
   * Récupère toutes les formations (alias pour compatibilité)
   */
  getAllFormations(): Observable<Formation[]> {
    return this.getAvailableFormations();
  }
  
  /**
   * Récupère une formation par son ID
   */
  getFormationById(id: string): Observable<Formation> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((formation: any) => this.mapBackendFormation(formation)),
      catchError((error) => {
        console.error('Error fetching formation:', error);
        throw error;
      })
    );
  }
  
  /**
   * Vérifie si l'utilisateur est inscrit à une formation
   */
  isEnrolledInFormation(formationId: string): Observable<boolean> {
    return this.getEnrolledFormations().pipe(
      map((enrollments: FormationEnrollment[]) => {
        return enrollments.some(e => e.formationId === formationId && e.status === 'EN_COURS');
      }),
      catchError((error) => {
        console.error('Error checking enrollment:', error);
        return of(false);
      })
    );
  }

  /**
   * Récupère les formations auxquelles l'utilisateur est inscrit
   */
  getEnrolledFormations(): Observable<FormationEnrollment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/enrolled`).pipe(
      map((enrollments: any[]) => enrollments.map(e => this.mapBackendEnrollment(e))),
      catchError((error) => {
        console.error('Error fetching enrolled formations:', error);
        return of([]);
      })
    );
  }

  /**
   * Inscription à une formation
   */
  enrollInFormation(formationId: string): Observable<FormationEnrollment> {
    return this.http.post<any>(`${this.apiUrl}/${formationId}/enroll`, {}).pipe(
      map((enrollment: any) => this.mapBackendEnrollment(enrollment)),
      catchError((error) => {
        console.error('Error enrolling in formation:', error);
        throw error;
      })
    );
  }

  /**
   * Récupère la progression d'une formation
   */
  getFormationProgress(enrollmentId: string): Observable<FormationProgress> {
    return this.http.get<any>(`${this.apiUrl}/progress/${enrollmentId}`).pipe(
      map((progress: any) => this.mapBackendProgress(progress)),
      catchError((error) => {
        console.error('Error fetching formation progress:', error);
        throw error;
      })
    );
  }

  /**
   * Met à jour la progression d'une leçon (vidéo)
   */
  updateLessonProgress(enrollmentId: string, lessonId: string, watchPercentage: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/progress/lessons/${lessonId}/watch`, {
      enrollmentId,
      watchPercentage
    }).pipe(
      catchError((error) => {
        console.error('Error updating lesson progress:', error);
        throw error;
      })
    );
  }

  /**
   * Vérifie si une leçon peut être accessible
   */
  canAccessLesson(enrollmentId: string, lessonId: string): Observable<boolean> {
    return this.http.get<{canAccess: boolean}>(`${this.apiUrl}/progress/lessons/${lessonId}/can-access`, {
      params: { enrollmentId }
    }).pipe(
      map(response => response.canAccess),
      catchError((error) => {
        console.error('Error checking lesson access:', error);
        return of(false);
      })
    );
  }

  /**
   * Génère le certificat si tous les modules sont validés
   */
  generateCertificate(enrollmentId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/progress/${enrollmentId}/certificate`, {}).pipe(
      catchError((error) => {
        console.error('Error generating certificate:', error);
        throw error;
      })
    );
  }

  /**
   * Marque le contenu texte d'un module comme complété
   */
  completeModuleText(enrollmentId: string, moduleId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enrollments/${enrollmentId}/modules/${moduleId}/complete-text`, {}).pipe(
      catchError((error) => {
        console.error('Error completing module text:', error);
        throw error;
      })
    );
  }

  /**
   * Marque la vidéo d'un module comme complétée
   */
  completeModuleVideo(enrollmentId: string, moduleId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enrollments/${enrollmentId}/modules/${moduleId}/complete-video`, {}).pipe(
      catchError((error) => {
        console.error('Error completing module video:', error);
        throw error;
      })
    );
  }

  /**
   * Marque le lab d'un module comme complété
   */
  completeModuleLab(enrollmentId: string, moduleId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enrollments/${enrollmentId}/modules/${moduleId}/complete-lab`, {}).pipe(
      catchError((error) => {
        console.error('Error completing module lab:', error);
        throw error;
      })
    );
  }

  /**
   * Soumet le quiz d'un module
   */
  submitModuleQuiz(enrollmentId: string, moduleId: string, answers: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enrollments/${enrollmentId}/modules/${moduleId}/submit-quiz`, { answers }).pipe(
      catchError((error) => {
        console.error('Error submitting module quiz:', error);
        throw error;
      })
    );
  }

  private mapBackendFormation(formation: any): Formation {
    // Calculer les compteurs depuis les modules (nouvelle architecture)
    const modules = formation.modules || [];
    const modulesCount = modules.length;
    const coursesCount = 0; // Plus de cours dans nouvelle architecture
    let quizzesCount = 0;
    
    // Compter les quiz des modules
    modules.forEach((module: any) => {
      if (module.quiz) {
        quizzesCount++;
      }
    });
    
    // Mapper le formateur (assignedTo ou createdBy)
    let trainer: FormationTrainer | undefined;
    const trainerData = formation.assignedTo || formation.createdBy;
    if (trainerData) {
      trainer = {
        id: trainerData.id || '',
        firstName: trainerData.firstName || trainerData.first_name || 'Formateur',
        lastName: trainerData.lastName || trainerData.last_name || '',
        email: trainerData.email || '',
        avatarUrl: trainerData.avatarUrl || trainerData.avatar_url,
        bio: trainerData.bio
      };
    }
    
    // Mapper les modules (nouvelle architecture)
    const mappedModules: FormationModule[] = modules.map((m: any) => ({
      id: m.id,
      formationId: formation.id,
      title: m.title,
      description: m.description || '',
      order: m.order || m.module_order || 0,
      status: m.status || 'DRAFT',
      textContent: m.textContent,
      videoUrl: m.videoUrl,
      labContent: m.labContent,
      quiz: m.quiz ? {
        id: m.quiz.id,
        moduleId: m.id,
        title: m.quiz.title,
        description: m.quiz.description || '',
        difficulty: m.quiz.difficulty || 'Moyen',
        duration: m.quiz.duration || 0,
        passingScore: m.quiz.passingScore || 70,
        maxAttempts: m.quiz.maxAttempts || 3,
        questions: m.quiz.questions || [],
        status: m.quiz.status || 'DRAFT'
      } : undefined,
      isLocked: m.isLocked !== undefined ? m.isLocked : false,
      duration: m.duration || 0,
      createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
      updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
      courses: [], // Vide dans nouvelle architecture
      coursesCount: 0 // Plus de cours
    }));
    
    return {
      id: formation.id,
      title: formation.title,
      description: formation.description || '',
      thumbnail: formation.thumbnail,
      level: formation.level || 'DEBUTANT',
      category: formation.category || '',
      status: formation.status || 'DRAFT',
      duration: formation.duration || 0,
      modules: mappedModules,
      enrolledCount: formation.enrolledCount || 0,
      completionRate: formation.completionRate || 0,
      createdBy: trainerData?.id || '',
      assignedTo: formation.assignedTo?.id,
      assignedToName: formation.assignedToName || (trainer ? `${trainer.firstName} ${trainer.lastName}`.trim() : undefined),
      trainer: trainer,
      modulesCount: modulesCount,
      coursesCount: coursesCount,
      quizzesCount: quizzesCount,
      createdAt: formation.createdAt ? new Date(formation.createdAt) : new Date(),
      updatedAt: formation.updatedAt ? new Date(formation.updatedAt) : new Date(),
      submittedForValidationAt: formation.submittedForValidationAt ? new Date(formation.submittedForValidationAt) : undefined,
      publishedAt: formation.publishedAt ? new Date(formation.publishedAt) : undefined,
      validatedBy: formation.validatedBy?.id,
      validatedAt: formation.validatedAt ? new Date(formation.validatedAt) : undefined,
      rejectionReason: formation.rejectionReason
    };
  }

  private mapBackendEnrollment(enrollment: any): FormationEnrollment {
    const progress = enrollment.progress ? this.mapBackendProgress(enrollment.progress) : {
      id: '',
      enrollmentId: enrollment.id,
      overallProgress: 0,
      completedModules: 0,
      totalModules: 0,
      completedQuizzes: 0,
      totalQuizzes: 0,
      averageQuizScore: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      completedLessons: 0,
      totalLessons: 0,
      completedCourses: 0,
      totalCourses: 0
    };

    return {
      id: enrollment.id,
      enrollmentId: enrollment.id,
      userId: enrollment.user?.id || enrollment.userId || '',
      formationId: enrollment.formation?.id || enrollment.formationId,
      formationTitle: enrollment.formation?.title,
      formation: enrollment.formation ? this.mapBackendFormation(enrollment.formation) : undefined,
      status: enrollment.status || 'EN_COURS',
      enrolledAt: enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : new Date(),
      startedAt: enrollment.startedAt ? new Date(enrollment.startedAt) : undefined,
      completedAt: enrollment.completedAt ? new Date(enrollment.completedAt) : undefined,
      targetCompletionDate: enrollment.targetCompletionDate ? new Date(enrollment.targetCompletionDate) : undefined,
      certificateEarned: enrollment.certificateEarned || false,
      certificateUrl: enrollment.certificateUrl,
      progress: progress,
      moduleProgresses: (enrollment.moduleProgresses || []).map((mp: any) => ({
        id: mp.id,
        enrollmentId: enrollment.id,
        moduleId: mp.module?.id || mp.moduleId,
        textCompleted: mp.textCompleted || false,
        videoCompleted: mp.videoCompleted || false,
        labCompleted: mp.labCompleted || false,
        quizCompleted: mp.quizCompleted || false,
        quizScore: mp.quizScore,
        isModuleValidated: mp.isModuleValidated || mp.moduleValidated || false,
        textCompletedAt: mp.textCompletedAt ? new Date(mp.textCompletedAt) : undefined,
        videoCompletedAt: mp.videoCompletedAt ? new Date(mp.videoCompletedAt) : undefined,
        labCompletedAt: mp.labCompletedAt ? new Date(mp.labCompletedAt) : undefined,
        quizCompletedAt: mp.quizCompletedAt ? new Date(mp.quizCompletedAt) : undefined,
        completedAt: mp.completedAt ? new Date(mp.completedAt) : undefined,
        createdAt: mp.createdAt ? new Date(mp.createdAt) : new Date(),
        updatedAt: mp.updatedAt ? new Date(mp.updatedAt) : new Date(),
        module: mp.module ? this.mapBackendModule(mp.module) : undefined
      }))
    };
  }

  private mapBackendModule(module: any): FormationModule {
    return {
      id: module.id,
      formationId: module.formation?.id || module.formationId,
      title: module.title,
      description: module.description || '',
      order: module.order || 0,
      status: module.status || 'DRAFT',
      textContent: module.textContent,
      videoUrl: module.videoUrl,
      labContent: module.labContent,
      quiz: module.quiz ? {
        id: module.quiz.id,
        moduleId: module.id,
        title: module.quiz.title,
        description: module.quiz.description || '',
        difficulty: module.quiz.difficulty || 'Moyen',
        duration: module.quiz.duration || 0,
        passingScore: module.quiz.passingScore || 70,
        maxAttempts: module.quiz.maxAttempts || 3,
        questions: (module.quiz.questions || []).map((q: any) => ({
          id: q.id,
          question: q.question,
          questionNumber: q.questionNumber || 0,
          type: q.type || 'MULTIPLE_CHOICE',
          points: q.points || 10,
          correctAnswer: q.correctAnswer,
          options: (q.options || q.quizOptions || []).map((opt: any) => ({
            id: opt.id || opt.text,
            text: opt.text,
            isCorrect: opt.isCorrect || opt.correct || false
          }))
        })),
        status: module.quiz.status || 'DRAFT'
      } : undefined,
      isLocked: module.isLocked !== undefined ? module.isLocked : false,
      duration: module.duration || 0,
      createdAt: module.createdAt ? new Date(module.createdAt) : new Date(),
      updatedAt: module.updatedAt ? new Date(module.updatedAt) : new Date(),
      courses: [],
      coursesCount: 0
    };
  }

  private mapBackendProgress(progress: any): FormationProgress {
    return {
      id: progress.id,
      enrollmentId: progress.enrollment?.id || progress.enrollmentId,
      overallProgress: progress.overallProgress || 0,
      completedModules: progress.completedModules || 0,
      totalModules: progress.totalModules || 0,
      completedQuizzes: progress.completedQuizzes || 0,
      totalQuizzes: progress.totalQuizzes || 0,
      averageQuizScore: progress.averageQuizScore || 0,
      totalTimeSpent: progress.totalTimeSpent || 0,
      currentStreak: progress.currentStreak || 0,
      lastActivityDate: progress.lastActivityDate ? new Date(progress.lastActivityDate) : undefined,
      // Pour compatibilité
      completedCourses: 0,
      totalCourses: 0,
      completedLessons: 0,
      totalLessons: 0
    };
  }
}
