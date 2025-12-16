import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
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

  constructor() {}

  // ==================== FORMATIONS ====================

  getFormations(): Observable<Formation[]> {
    return of(this.formations).pipe(delay(300));
  }

  getFormationById(id: string): Observable<Formation | undefined> {
    return of(this.formations.find(f => f.id === id)).pipe(delay(200));
  }

  createFormation(formation: Partial<Formation>): Observable<Formation> {
    const newFormation: Formation = {
      id: 'f' + (this.formations.length + 1),
      title: formation.title || '',
      description: formation.description || '',
      thumbnail: formation.thumbnail || '',
      level: formation.level || 'Débutant',
      category: formation.category || '',
      status: 'draft',
      duration: formation.duration || 0,
      modules: [],
      enrolledCount: 0,
      completionRate: 0,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.formations.push(newFormation);
    return of(newFormation).pipe(delay(400));
  }

  updateFormation(id: string, updates: Partial<Formation>): Observable<Formation> {
    const index = this.formations.findIndex(f => f.id === id);
    if (index !== -1) {
      this.formations[index] = { 
        ...this.formations[index], 
        ...updates, 
        updatedAt: new Date() 
      };
      return of(this.formations[index]).pipe(delay(300));
    }
    throw new Error('Formation not found');
  }

  deleteFormation(id: string): Observable<boolean> {
    const index = this.formations.findIndex(f => f.id === id);
    if (index !== -1) {
      this.formations.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false);
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
    return of(this.validations.filter(v => v.status === 'pending')).pipe(delay(300));
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
}




