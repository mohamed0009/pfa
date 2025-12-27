import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { LearningPath, LearningModule, Lesson, Recommendation } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class LearningPathService {
  private apiUrl = 'http://localhost:8081/api/user/learning-path';
  
  constructor(private http: HttpClient) {}
  private mockLearningPath: LearningPath = {
    id: 'path1',
    userId: 'user1',
    formation: 'Développement Web Full Stack',
    niveau: 'Intermédiaire',
    startDate: new Date('2024-09-15'),
    estimatedEndDate: new Date('2025-03-15'),
    currentStep: 3,
    totalSteps: 8,
    progressPercentage: 37.5,
    modules: [
      {
        id: 'mod1',
        title: 'Introduction au HTML et CSS',
        description: 'Maîtrisez les bases du développement web avec HTML5 et CSS3',
        status: 'completed',
        progressPercentage: 100,
        estimatedDuration: 12,
        order: 1,
        lessons: [
          {
            id: 'lesson1',
            moduleId: 'mod1',
            title: 'Structure HTML5',
            description: 'Apprenez la structure de base d\'une page HTML5',
            type: 'Vidéo',
            duration: 45,
            status: 'completed',
            resourceUrl: '/resources/html5-structure',
            order: 1
          },
          {
            id: 'lesson2',
            moduleId: 'mod1',
            title: 'Sélecteurs CSS',
            description: 'Découvrez les différents types de sélecteurs CSS',
            type: 'Lecture',
            duration: 30,
            status: 'completed',
            resourceUrl: '/resources/css-selectors',
            order: 2
          }
        ]
      },
      {
        id: 'mod2',
        title: 'JavaScript Fondamentaux',
        description: 'Découvrez les concepts de base de JavaScript ES6+',
        status: 'completed',
        progressPercentage: 100,
        estimatedDuration: 20,
        order: 2,
        lessons: [
          {
            id: 'lesson3',
            moduleId: 'mod2',
            title: 'Variables et Types',
            description: 'Comprendre let, const, et les types de données',
            type: 'Vidéo',
            duration: 40,
            status: 'completed',
            order: 1
          },
          {
            id: 'lesson4',
            moduleId: 'mod2',
            title: 'Fonctions et Closures',
            description: 'Maîtriser les fonctions, arrow functions et closures',
            type: 'Exercice Pratique',
            duration: 60,
            status: 'completed',
            order: 2
          }
        ]
      },
      {
        id: 'mod3',
        title: 'React - Introduction',
        description: 'Démarrez avec React et créez vos premières applications',
        status: 'in_progress',
        progressPercentage: 60,
        estimatedDuration: 25,
        order: 3,
        lessons: [
          {
            id: 'lesson5',
            moduleId: 'mod3',
            title: 'Composants React',
            description: 'Créez vos premiers composants fonctionnels',
            type: 'Vidéo',
            duration: 50,
            status: 'completed',
            order: 1
          },
          {
            id: 'lesson6',
            moduleId: 'mod3',
            title: 'Props et State',
            description: 'Gérez les données dans vos composants',
            type: 'Exercice Pratique',
            duration: 70,
            status: 'in_progress',
            order: 2
          },
          {
            id: 'lesson7',
            moduleId: 'mod3',
            title: 'Hooks - useState et useEffect',
            description: 'Utilisez les hooks React essentiels',
            type: 'Vidéo',
            duration: 45,
            status: 'available',
            order: 3
          }
        ]
      },
      {
        id: 'mod4',
        title: 'React - Avancé',
        description: 'Approfondissez vos connaissances en React',
        status: 'available',
        progressPercentage: 0,
        estimatedDuration: 30,
        order: 4,
        lessons: [
          {
            id: 'lesson8',
            moduleId: 'mod4',
            title: 'Context API',
            description: 'Gérez l\'état global avec Context',
            type: 'Vidéo',
            duration: 55,
            status: 'available',
            order: 1
          },
          {
            id: 'lesson9',
            moduleId: 'mod4',
            title: 'React Router',
            description: 'Naviguez entre les pages de votre application',
            type: 'Exercice Pratique',
            duration: 60,
            status: 'locked',
            order: 2
          }
        ]
      },
      {
        id: 'mod5',
        title: 'Node.js et Express',
        description: 'Créez des APIs backend avec Node.js',
        status: 'locked',
        progressPercentage: 0,
        estimatedDuration: 28,
        order: 5,
        lessons: []
      }
    ]
  };

  private mockRecommendations: Recommendation[] = [
    {
      id: 'rec1',
      userId: 'user1',
      type: 'exercise',
      title: 'Exercice Pratique : Créer un composant React',
      description: 'Mettez en pratique vos connaissances en créant un composant de liste de tâches',
      reason: 'Basé sur votre progression actuelle dans le module React',
      targetId: 'ex1',
      relevanceScore: 95,
      createdAt: new Date(),
      isAIGenerated: true
    },
    {
      id: 'rec2',
      userId: 'user1',
      type: 'quiz',
      title: 'Quiz : JavaScript ES6',
      description: 'Testez vos connaissances sur les fonctionnalités ES6',
      reason: 'Pour consolider vos acquis en JavaScript',
      targetId: 'quiz2',
      relevanceScore: 88,
      createdAt: new Date(),
      isAIGenerated: false
    },
    {
      id: 'rec3',
      userId: 'user1',
      type: 'resource',
      title: 'Documentation : React Hooks',
      description: 'Guide complet sur les hooks React',
      reason: 'Vous êtes actuellement sur le module React',
      targetId: 'res5',
      relevanceScore: 82,
      createdAt: new Date(),
      isAIGenerated: true
    }
  ];

  // Récupérer le parcours d'apprentissage
  getLearningPath(): Observable<LearningPath> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((data: any) => {
        return {
          id: data.id || 'path1',
          userId: data.userId || '',
          formation: data.formation || '',
          niveau: data.niveau || 'Débutant',
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate) : new Date(),
          currentStep: data.currentStep || 0,
          totalSteps: data.totalSteps || 0,
          progressPercentage: data.progressPercentage || 0,
          modules: (data.modules || []).map((m: any) => ({
            id: m.id,
            title: m.title || '',
            description: m.description || '',
            status: m.status || 'available',
            progressPercentage: m.progressPercentage || 0,
            estimatedDuration: m.estimatedDuration || 0,
            order: m.order || 0,
            lessons: (m.lessons || []).map((l: any) => ({
              id: l.id,
              moduleId: l.moduleId || m.id,
              title: l.title || '',
              description: l.description || '',
              type: l.type || 'Vidéo',
              duration: l.duration || 0,
              status: l.status || 'available',
              resourceUrl: l.resourceUrl,
              order: l.order || 0
            }))
          }))
        } as LearningPath;
      }),
      catchError((error) => {
        console.error('Error fetching learning path:', error);
        return of(this.mockLearningPath).pipe(delay(400));
      })
    );
  }

  // Récupérer un module spécifique
  getModule(moduleId: string): Observable<LearningModule | undefined> {
    const module = this.mockLearningPath.modules.find(m => m.id === moduleId);
    return of(module).pipe(delay(300));
  }

  // Récupérer une leçon spécifique
  getLesson(lessonId: string): Observable<Lesson | undefined> {
    let lesson: Lesson | undefined;
    for (const module of this.mockLearningPath.modules) {
      lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) break;
    }
    return of(lesson).pipe(delay(300));
  }

  // Marquer une leçon comme complétée
  completeLesson(lessonId: string): Observable<boolean> {
    for (const module of this.mockLearningPath.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.status = 'completed';
        
        // Mettre à jour la progression du module
        const completedLessons = module.lessons.filter(l => l.status === 'completed').length;
        module.progressPercentage = Math.round((completedLessons / module.lessons.length) * 100);
        
        // Vérifier si le module est complété
        if (module.progressPercentage === 100) {
          module.status = 'completed';
        }
        
        // Mettre à jour la progression globale
        this.updateOverallProgress();
        
        return of(true).pipe(delay(400));
      }
    }
    return of(false);
  }

  // Démarrer une leçon
  startLesson(lessonId: string): Observable<boolean> {
    for (const module of this.mockLearningPath.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson && lesson.status === 'available') {
        lesson.status = 'in_progress';
        if (module.status === 'available') {
          module.status = 'in_progress';
        }
        return of(true).pipe(delay(300));
      }
    }
    return of(false);
  }

  // Mettre à jour la progression globale
  private updateOverallProgress(): void {
    const completedModules = this.mockLearningPath.modules.filter(m => m.status === 'completed').length;
    this.mockLearningPath.progressPercentage = Math.round(
      (completedModules / this.mockLearningPath.modules.length) * 100
    );
    this.mockLearningPath.currentStep = completedModules + 1;
  }

  // Récupérer les recommandations approuvées par le formateur
  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/user/recommendations`).pipe(
      map((recs: any[]) => {
        if (!recs || recs.length === 0) {
          return this.mockRecommendations;
        }
        // Mapper les recommandations backend vers l'interface frontend
        return recs.map(r => ({
          id: r.id || '',
          userId: r.student?.id || '',
          type: 'course' as 'course' | 'exercise' | 'quiz' | 'resource',
          title: r.course?.title || '',
          description: r.course?.description || '',
          reason: r.reason || '',
          targetId: r.course?.id || '',
          relevanceScore: r.confidenceScore || 0,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          isAIGenerated: true // Les recommandations sont générées par l'IA
        } as Recommendation));
      }),
      catchError((error) => {
        console.error('Error fetching recommendations:', error);
        return of(this.mockRecommendations).pipe(delay(350));
      })
    );
  }

  // Obtenir le prochain contenu à étudier
  getNextLesson(): Observable<Lesson | null> {
    return this.http.get<any>(`${this.apiUrl}/next-lesson`).pipe(
      map((lesson: any) => {
        if (!lesson) return null;
        return {
          id: lesson.id,
          moduleId: lesson.moduleId || '',
          title: lesson.title || '',
          description: lesson.description || '',
          type: lesson.type || 'Vidéo',
          duration: lesson.duration || 0,
          status: lesson.status || 'available',
          resourceUrl: lesson.resourceUrl,
          order: lesson.order || 0
        } as Lesson;
      }),
      catchError((error) => {
        console.error('Error fetching next lesson:', error);
        // Fallback to mock logic
        for (const module of this.mockLearningPath.modules) {
          const nextLesson = module.lessons.find(
            l => l.status === 'in_progress' || l.status === 'available'
          );
          if (nextLesson) {
            return of(nextLesson).pipe(delay(200));
          }
        }
        return of(null).pipe(delay(200));
      })
    );
  }
}




