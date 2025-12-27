import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { 
  Formation, 
  Module, 
  Course, 
  Resource, 
  ContentValidation,
  ContentStatus,
  ResourceType
} from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ContentManagementService {
  private apiUrl = 'http://localhost:8081/api/admin/content';

  constructor(private http: HttpClient) {}

  private formations: Formation[] = [
    {
      id: 'f1',
      title: 'Développement Web Full Stack',
      description: 'Formation complète pour devenir développeur web full stack avec les technologies modernes',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
      level: 'Intermédiaire',
      category: 'Développement',
      status: 'approved',
      duration: 120,
      modules: [],
      enrolledCount: 245,
      completionRate: 78,
      createdBy: 'trainer1',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: 'f2',
      title: 'Data Science et Intelligence Artificielle',
      description: 'Maîtrisez les fondamentaux de la data science et de l\'IA avec Python',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      level: 'Avancé',
      category: 'Data Science',
      status: 'approved',
      duration: 150,
      modules: [],
      enrolledCount: 189,
      completionRate: 65,
      createdBy: 'trainer2',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-11-28')
    },
    {
      id: 'f3',
      title: 'Marketing Digital & Growth Hacking',
      description: 'Stratégies avancées de marketing digital et techniques de croissance',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      level: 'Débutant',
      category: 'Marketing',
      status: 'pending',
      duration: 80,
      modules: [],
      enrolledCount: 0,
      completionRate: 0,
      createdBy: 'trainer3',
      createdAt: new Date('2024-12-10'),
      updatedAt: new Date('2024-12-10')
    }
  ];

  private modules: Module[] = [
    {
      id: 'm1',
      formationId: 'f1',
      title: 'Introduction au Développement Web',
      description: 'Les bases du développement web moderne',
      order: 1,
      status: 'approved',
      courses: [],
      duration: 20,
      createdBy: 'trainer1',
      createdAt: new Date('2024-01-20')
    },
    {
      id: 'm2',
      formationId: 'f1',
      title: 'Frontend avec React',
      description: 'Développement d\'interfaces utilisateur avec React',
      order: 2,
      status: 'approved',
      courses: [],
      duration: 35,
      createdBy: 'trainer1',
      createdAt: new Date('2024-02-01')
    },
    {
      id: 'm3',
      formationId: 'f1',
      title: 'Backend avec Node.js',
      description: 'Création d\'APIs et gestion de bases de données',
      order: 3,
      status: 'approved',
      courses: [],
      duration: 40,
      createdBy: 'trainer1',
      createdAt: new Date('2024-03-01')
    }
  ];

  private courses: Course[] = [
    {
      id: 'c1',
      moduleId: 'm1',
      title: 'HTML & CSS Fondamentaux',
      description: 'Apprendre les bases de HTML5 et CSS3',
      content: 'Contenu du cours sur HTML et CSS...',
      order: 1,
      status: 'approved',
      duration: 180,
      lessons: [],
      resources: [],
      enrolledStudents: 245,
      completionRate: 92,
      createdBy: 'trainer1',
      createdAt: new Date('2024-01-22'),
      validatedBy: 'admin1',
      validatedAt: new Date('2024-01-23')
    },
    {
      id: 'c2',
      moduleId: 'm1',
      title: 'JavaScript Essentiel',
      description: 'Les concepts fondamentaux de JavaScript',
      content: 'Contenu du cours JavaScript...',
      order: 2,
      status: 'approved',
      duration: 240,
      lessons: [],
      resources: [],
      enrolledStudents: 245,
      completionRate: 85,
      createdBy: 'trainer1',
      createdAt: new Date('2024-01-25'),
      validatedBy: 'admin1',
      validatedAt: new Date('2024-01-26')
    },
    {
      id: 'c3',
      moduleId: 'm2',
      title: 'Introduction à React',
      description: 'Premiers pas avec React et les composants',
      content: 'Contenu React introduction...',
      order: 1,
      status: 'pending',
      duration: 200,
      lessons: [],
      resources: [],
      enrolledStudents: 0,
      completionRate: 0,
      createdBy: 'trainer1',
      createdAt: new Date('2024-12-11')
    }
  ];

  private resources: Resource[] = [
    {
      id: 'r1',
      courseId: 'c1',
      title: 'Guide complet HTML5',
      description: 'PDF de référence pour HTML5',
      type: 'pdf',
      url: '/assets/resources/html5-guide.pdf',
      fileSize: 2500000,
      uploadedBy: 'trainer1',
      uploadedAt: new Date('2024-01-22')
    },
    {
      id: 'r2',
      courseId: 'c1',
      title: 'Tutoriel vidéo CSS Grid',
      description: 'Vidéo explicative sur CSS Grid Layout',
      type: 'video',
      url: 'https://example.com/videos/css-grid.mp4',
      uploadedBy: 'trainer1',
      uploadedAt: new Date('2024-01-23')
    }
  ];

  private validations: ContentValidation[] = [
    {
      id: 'v1',
      contentId: 'c3',
      contentType: 'cours',
      status: 'pending',
    },
    {
      id: 'v2',
      contentId: 'f3',
      contentType: 'formation',
      status: 'pending',
    }
  ];

  // ==================== FORMATIONS ====================

  getFormations(): Observable<Formation[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/admin/formations`).pipe(
      map((formations: any[]) => formations.map(f => this.mapBackendFormationToFrontend(f))),
      catchError((error) => {
        console.error('Error fetching formations from backend:', error);
        return of([]);
      })
    );
  }

  // Récupérer les formations en attente d'approbation (créées par les formateurs via recommandations ML)
  getPendingFormations(): Observable<Formation[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/admin/content/pending`).pipe(
      map((response: any) => {
        const formations = response.formations || [];
        return formations.map((f: any) => this.mapBackendFormationToFrontend(f));
      }),
      catchError((error) => {
        console.error('Error fetching pending formations:', error);
        return of([]);
      })
    );
  }
  
  private mapBackendFormationToFrontend(formation: any): Formation {
    return {
      id: formation.id,
      title: formation.title,
      description: formation.description || '',
      thumbnail: formation.thumbnail || '',
      level: this.mapBackendLevelToFrontend(formation.level),
      category: formation.category || '',
      status: this.mapBackendStatusToFrontend(formation.status),
      duration: formation.duration || 0,
      modules: [], // Les modules seront chargés séparément si nécessaire
      enrolledCount: formation.enrolledCount || 0,
      completionRate: formation.completionRate || 0,
      createdBy: formation.createdBy?.id || formation.createdBy || '',
      createdAt: formation.createdAt ? new Date(formation.createdAt) : new Date(),
      updatedAt: formation.updatedAt ? new Date(formation.updatedAt) : new Date()
    };
  }
  
  private mapBackendLevelToFrontend(level: string): 'Débutant' | 'Intermédiaire' | 'Avancé' {
    const mapping: Record<string, 'Débutant' | 'Intermédiaire' | 'Avancé'> = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avancé'
    };
    return mapping[level] || 'Débutant';
  }
  
  private mapBackendStatusToFrontend(status: string): ContentStatus {
    const mapping: Record<string, ContentStatus> = {
      'DRAFT': 'draft',
      'PENDING': 'pending',
      'APPROVED': 'approved',
      'PUBLISHED': 'published' as ContentStatus,
      'REJECTED': 'rejected',
      'ARCHIVED': 'archived'
    };
    return mapping[status] || 'draft';
  }

  getFormationById(id: string): Observable<Formation | undefined> {
    return of(this.formations.find(f => f.id === id)).pipe(delay(200));
  }

  createFormation(formation: Partial<Formation>): Observable<Formation> {
    const formationData: any = {
      title: formation.title || '',
      description: formation.description || '',
      thumbnail: formation.thumbnail || '',
      level: formation.level?.toUpperCase() || 'DEBUTANT',
      category: formation.category || '',
      duration: formation.duration || 0,
      trainerId: formation.createdBy || undefined
    };
    
    return this.http.post<any>(`http://localhost:8081/api/admin/formations`, formationData).pipe(
      map((saved: any) => this.mapBackendFormationToFrontend(saved)),
      catchError((error) => {
        console.error('Error creating formation:', error);
        throw error;
      })
    );
  }

  updateFormation(id: string, updates: Partial<Formation>): Observable<Formation> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.thumbnail !== undefined) updateData.thumbnail = updates.thumbnail;
    if (updates.level !== undefined) updateData.level = updates.level.toUpperCase();
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.status !== undefined) updateData.status = updates.status.toUpperCase();
    
    return this.http.put<any>(`http://localhost:8081/api/admin/formations/${id}`, updateData).pipe(
      map((saved: any) => this.mapBackendFormationToFrontend(saved)),
      catchError((error) => {
        console.error('Error updating formation:', error);
        throw error;
      })
    );
  }

  deleteFormation(id: string): Observable<boolean> {
    return this.http.delete<void>(`http://localhost:8081/api/admin/formations/${id}`).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error deleting formation:', error);
        return of(false);
      })
    );
  }

  // ==================== MODULES ====================

  getModulesByFormation(formationId: string): Observable<Module[]> {
    return of(this.modules.filter(m => m.formationId === formationId)).pipe(delay(250));
  }

  createModule(module: Partial<Module>): Observable<Module> {
    const newModule: Module = {
      id: 'm' + (this.modules.length + 1),
      formationId: module.formationId || '',
      title: module.title || '',
      description: module.description || '',
      order: module.order || this.modules.filter(m => m.formationId === module.formationId).length + 1,
      status: 'draft',
      courses: [],
      duration: 0,
      createdBy: 'current-user',
      createdAt: new Date()
    };
    this.modules.push(newModule);
    return of(newModule).pipe(delay(350));
  }

  updateModule(id: string, updates: Partial<Module>): Observable<Module> {
    const index = this.modules.findIndex(m => m.id === id);
    if (index !== -1) {
      this.modules[index] = { ...this.modules[index], ...updates };
      return of(this.modules[index]).pipe(delay(300));
    }
    throw new Error('Module not found');
  }

  deleteModule(id: string): Observable<boolean> {
    const index = this.modules.findIndex(m => m.id === id);
    if (index !== -1) {
      this.modules.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  // ==================== COURSES ====================

  getCoursesByModule(moduleId: string): Observable<Course[]> {
    return of(this.courses.filter(c => c.moduleId === moduleId)).pipe(delay(250));
  }

  getCourseById(id: string): Observable<Course | undefined> {
    return of(this.courses.find(c => c.id === id)).pipe(delay(200));
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    const newCourse: Course = {
      id: 'c' + (this.courses.length + 1),
      moduleId: course.moduleId || '',
      title: course.title || '',
      description: course.description || '',
      content: course.content || '',
      order: course.order || this.courses.filter(c => c.moduleId === course.moduleId).length + 1,
      status: 'draft',
      duration: course.duration || 0,
      lessons: [],
      resources: [],
      enrolledStudents: 0,
      completionRate: 0,
      createdBy: 'current-user',
      createdAt: new Date()
    };
    this.courses.push(newCourse);
    return of(newCourse).pipe(delay(400));
  }

  updateCourse(id: string, updates: Partial<Course>): Observable<Course> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...updates };
      return of(this.courses[index]).pipe(delay(300));
    }
    throw new Error('Course not found');
  }

  deleteCourse(id: string): Observable<boolean> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courses.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  // ==================== RESOURCES ====================

  getResourcesByCourse(courseId: string): Observable<Resource[]> {
    return of(this.resources.filter(r => r.courseId === courseId)).pipe(delay(200));
  }

  addResource(resource: Partial<Resource>): Observable<Resource> {
    const newResource: Resource = {
      id: 'r' + (this.resources.length + 1),
      courseId: resource.courseId || '',
      title: resource.title || '',
      description: resource.description || '',
      type: resource.type || 'document',
      url: resource.url || '',
      fileSize: resource.fileSize,
      uploadedBy: 'current-user',
      uploadedAt: new Date()
    };
    this.resources.push(newResource);
    return of(newResource).pipe(delay(350));
  }

  deleteResource(id: string): Observable<boolean> {
    const index = this.resources.findIndex(r => r.id === id);
    if (index !== -1) {
      this.resources.splice(index, 1);
      return of(true).pipe(delay(250));
    }
    return of(false);
  }

  // ==================== VALIDATION ====================

  getPendingValidations(): Observable<ContentValidation[]> {
    return this.http.get<any>(`${this.apiUrl}/pending`).pipe(
      map((data: any) => {
        const validations: ContentValidation[] = [];
        
        // Mapper les formations en attente
        if (data.formations) {
          data.formations.forEach((f: any) => {
            validations.push({
              id: f.id,
              contentId: f.id,
              contentType: 'formation',
              status: 'pending',
              reviewedAt: f.createdAt ? new Date(f.createdAt) : undefined
            });
          });
        }
        
        // Mapper les cours en attente
        if (data.courses) {
          data.courses.forEach((c: any) => {
            validations.push({
              id: c.id,
              contentId: c.id,
              contentType: 'cours',
              status: 'pending',
              reviewedAt: c.createdAt ? new Date(c.createdAt) : undefined
            });
          });
        }
        
        return validations;
      }),
      catchError((error) => {
        console.error('Error fetching pending validations:', error);
        return of([]);
      })
    );
  }

  approveFormation(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/formations/${id}/approve`, {}).pipe(
      catchError((error) => {
        console.error('Error approving formation:', error);
        throw error;
      })
    );
  }

  rejectFormation(id: string, reason?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/formations/${id}/reject`, { reason: reason || '' }).pipe(
      catchError((error) => {
        console.error('Error rejecting formation:', error);
        throw error;
      })
    );
  }

  approveCourse(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/courses/${id}/approve`, {}).pipe(
      catchError((error) => {
        console.error('Error approving course:', error);
        throw error;
      })
    );
  }

  rejectCourse(id: string, reason?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/courses/${id}/reject`, { reason: reason || '' }).pipe(
      catchError((error) => {
        console.error('Error rejecting course:', error);
        throw error;
      })
    );
  }

  validateContent(validationId: string, approved: boolean, feedback?: string): Observable<ContentValidation> {
    const index = this.validations.findIndex(v => v.id === validationId);
    if (index !== -1) {
      this.validations[index] = {
        ...this.validations[index],
        status: approved ? 'approved' : 'rejected',
        reviewedBy: 'current-admin',
        reviewedAt: new Date(),
        feedback
      };

      // Update content status
      const validation = this.validations[index];
      if (validation.contentType === 'cours') {
        const courseIndex = this.courses.findIndex(c => c.id === validation.contentId);
        if (courseIndex !== -1) {
          this.courses[courseIndex].status = approved ? 'approved' : 'rejected';
          if (!approved && feedback) {
            this.courses[courseIndex].rejectionReason = feedback;
          }
        }
      } else if (validation.contentType === 'formation') {
        const formationIndex = this.formations.findIndex(f => f.id === validation.contentId);
        if (formationIndex !== -1) {
          this.formations[formationIndex].status = approved ? 'approved' : 'rejected';
        }
      }

      return of(this.validations[index]).pipe(delay(400));
    }
    throw new Error('Validation not found');
  }

  // ==================== STATS & SEARCH ====================

  getContentStats(): Observable<any> {
    return of({
      totalFormations: this.formations.length,
      activeFormations: this.formations.filter(f => f.status === 'approved').length,
      pendingFormations: this.formations.filter(f => f.status === 'pending').length,
      totalCourses: this.courses.length,
      approvedCourses: this.courses.filter(c => c.status === 'approved').length,
      pendingCourses: this.courses.filter(c => c.status === 'pending').length,
      totalResources: this.resources.length,
      totalEnrollments: this.formations.reduce((sum, f) => sum + f.enrolledCount, 0)
    }).pipe(delay(250));
  }

  searchContent(query: string): Observable<any[]> {
    const lowerQuery = query.toLowerCase();
    const results: any[] = [];

    this.formations.forEach(f => {
      if (f.title.toLowerCase().includes(lowerQuery) || 
          f.description.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'formation', data: f });
      }
    });

    this.courses.forEach(c => {
      if (c.title.toLowerCase().includes(lowerQuery) || 
          c.description.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'cours', data: c });
      }
    });

    return of(results).pipe(delay(300));
  }

  // ==================== FORMATION ENROLLMENTS ====================

  /**
   * Récupère toutes les formations avec leurs statistiques
   */
  getAllFormations(): Observable<Formation[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/admin/formations`).pipe(
      map((formations: any[]) => formations.map(f => this.mapBackendFormationToFrontend(f))),
      catchError((error) => {
        console.error('Error fetching all formations:', error);
        return of(this.formations).pipe(delay(300));
      })
    );
  }

  /**
   * Récupère les inscriptions pour une formation spécifique
   */
  getFormationEnrollments(formationId: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/admin/formations/${formationId}/inscriptions`).pipe(
      map((enrollments: any[]) => enrollments.map((e: any) => ({
        enrollmentId: e.enrollmentId,
        studentId: e.studentId,
        studentName: e.studentName || '',
        studentEmail: e.studentEmail || '',
        enrolledAt: e.enrolledAt ? new Date(e.enrolledAt) : new Date(),
        status: e.status || 'ACTIVE',
        overallProgress: e.overallProgress || 0,
        completedModules: e.completedModules || 0,
        totalModules: e.totalModules || 0,
        averageQuizScore: e.averageQuizScore || 0
      }))),
      catchError((error) => {
        console.error('Error fetching formation enrollments:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère la progression des étudiants pour une formation
   */
  getFormationProgression(formationId: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/admin/formations/${formationId}/progression`).pipe(
      map((progression: any[]) => progression.map((p: any) => ({
        studentId: p.studentId,
        studentName: p.studentName || '',
        overallProgress: p.overallProgress || 0,
        completedModules: p.completedModules || 0,
        totalModules: p.totalModules || 0,
        completedLessons: p.completedLessons || 0,
        totalLessons: p.totalLessons || 0,
        averageQuizScore: p.averageQuizScore || 0,
        lastActivityDate: p.lastActivityDate ? new Date(p.lastActivityDate) : undefined,
        modules: p.modules || []
      }))),
      catchError((error) => {
        console.error('Error fetching formation progression:', error);
        return of([]);
      })
    );
  }

  /**
   * Valide ou refuse une formation
   */
  validateFormation(id: string, action: 'approve' | 'reject', reason?: string): Observable<any> {
    return this.http.patch<any>(`http://localhost:8081/api/admin/formations/${id}/validation`, {
      action,
      reason: reason || ''
    }).pipe(
      map((saved: any) => this.mapBackendFormationToFrontend(saved)),
      catchError((error) => {
        console.error('Error validating formation:', error);
        throw error;
      })
    );
  }

  /**
   * Associe ou change le formateur d'une formation
   */
  assignTrainerToFormation(formationId: string, trainerId: string): Observable<Formation> {
    return this.http.patch<any>(`http://localhost:8081/api/admin/formations/${formationId}/formateur`, {
      trainerId
    }).pipe(
      map((saved: any) => this.mapBackendFormationToFrontend(saved)),
      catchError((error) => {
        console.error('Error assigning trainer:', error);
        throw error;
      })
    );
  }
}




