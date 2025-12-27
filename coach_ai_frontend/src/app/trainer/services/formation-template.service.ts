import { Injectable } from '@angular/core';
import { TrainerService } from './trainer.service';
import { TrainerFormation, TrainerModule, TrainerCourse, TrainerLesson, TrainerQuiz, DifficultyLevel } from '../models/trainer.interfaces';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface FormationTemplate {
  title: string;
  description: string;
  level: DifficultyLevel;
  category: string;
  duration: number; // en heures
  modules: ModuleTemplate[];
}

export interface ModuleTemplate {
  title: string;
  description: string;
  duration: number; // en heures
  order: number;
  courses: CourseTemplate[];
  quiz?: QuizTemplate;
}

export interface CourseTemplate {
  title: string;
  description: string;
  estimatedHours: number;
  order: number;
  lessons: LessonTemplate[];
}

export interface LessonTemplate {
  title: string;
  description: string;
  type: 'video' | 'text' | 'schema';
  videoUrl?: string;
  contentUrl?: string;
  transcript?: string;
  duration: number; // en minutes
  order: number;
}

export interface QuizTemplate {
  title: string;
  description: string;
  duration: number; // en minutes
  passingScore: number;
  maxAttempts: number;
  questions: QuizQuestionTemplate[];
}

export interface QuizQuestionTemplate {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
  order: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormationTemplateService {
  constructor(private trainerService: TrainerService) {}

  /**
   * Crée une formation complète avec modules, cours, leçons et quizs
   */
  createFormationFromTemplate(template: FormationTemplate): Observable<TrainerFormation> {
    // 1. Créer la formation
    // Mapper le niveau vers le format attendu par le backend
    const levelMap: Record<DifficultyLevel, 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE'> = {
      'Facile': 'DEBUTANT',
      'Moyen': 'INTERMEDIAIRE',
      'Difficile': 'AVANCE'
    };
    
    return this.trainerService.createFormation({
      title: template.title,
      description: template.description,
      level: levelMap[template.level] as any,
      category: template.category,
      duration: template.duration,
      thumbnail: ''
    }).pipe(
      switchMap((formation: any) => {
        const formationId = formation.id;
        
        // 2. Créer tous les modules avec leurs cours et leçons
        const moduleObservables = template.modules.map((moduleTemplate, moduleIndex) => {
          return this.createModuleWithContent(formationId, moduleTemplate, moduleIndex + 1);
        });

        return forkJoin(moduleObservables).pipe(
          map(() => formation as TrainerFormation)
        );
      })
    );
  }

  /**
   * Crée un module avec ses cours, leçons et quiz
   */
  private createModuleWithContent(
    formationId: string,
    moduleTemplate: ModuleTemplate,
    order: number
  ): Observable<TrainerModule> {
    // Créer le module
    return this.trainerService.createModule({
      formationId: formationId,
      title: moduleTemplate.title,
      description: moduleTemplate.description,
      duration: moduleTemplate.duration,
      order: order
    }).pipe(
      switchMap((module: any) => {
        const moduleId = module.id;

        // Créer tous les cours du module
        const courseObservables = moduleTemplate.courses.map((courseTemplate, courseIndex) => {
          return this.createCourseWithLessons(moduleId, courseTemplate, courseIndex + 1);
        });

        // Créer le quiz du module si présent
        const quizObservable = moduleTemplate.quiz
          ? this.createModuleQuiz(moduleId, moduleTemplate.quiz)
          : of(null);

        return forkJoin([...courseObservables, quizObservable]).pipe(
          map(() => module as TrainerModule)
        );
      })
    );
  }

  /**
   * Crée un cours avec ses leçons
   */
  private createCourseWithLessons(
    moduleId: string,
    courseTemplate: CourseTemplate,
    order: number
  ): Observable<TrainerCourse> {
    // Créer le cours
    // Convertir estimatedHours en duration (minutes) pour TrainerCourse
    return this.trainerService.createCourse({
      moduleId: moduleId,
      title: courseTemplate.title,
      description: courseTemplate.description,
      duration: courseTemplate.estimatedHours * 60, // Convertir heures en minutes
      order: order
    }).pipe(
      switchMap((course: any) => {
        const courseId = course.id;

        // Créer toutes les leçons du cours
        const lessonObservables = courseTemplate.lessons.map((lessonTemplate, lessonIndex) => {
          return this.createLesson(courseId, lessonTemplate, lessonIndex + 1);
        });

        return forkJoin(lessonObservables).pipe(
          map(() => course as TrainerCourse)
        );
      })
    );
  }

  /**
   * Crée une leçon
   */
  private createLesson(
    courseId: string,
    lessonTemplate: LessonTemplate,
    order: number
  ): Observable<TrainerLesson> {
    const lessonData: any = {
      courseId: courseId,
      title: lessonTemplate.title,
      description: lessonTemplate.description,
      type: this.mapLessonType(lessonTemplate.type),
      order: order,
      duration: lessonTemplate.duration
    };

    if (lessonTemplate.type === 'video' && lessonTemplate.videoUrl) {
      lessonData.videoUrl = lessonTemplate.videoUrl;
      if (lessonTemplate.transcript) {
        lessonData.transcript = lessonTemplate.transcript;
      }
    } else if ((lessonTemplate.type === 'text' || lessonTemplate.type === 'schema') && lessonTemplate.contentUrl) {
      lessonData.contentUrl = lessonTemplate.contentUrl;
    }

    return this.trainerService.createLesson(lessonData);
  }

  /**
   * Crée un quiz de module
   */
  private createModuleQuiz(
    moduleId: string,
    quizTemplate: QuizTemplate
  ): Observable<TrainerQuiz> {
    return this.trainerService.createModuleQuiz({
      moduleId: moduleId,
      title: quizTemplate.title,
      description: quizTemplate.description,
      duration: quizTemplate.duration,
      passingScore: quizTemplate.passingScore,
      maxAttempts: quizTemplate.maxAttempts
    });
  }

  /**
   * Mappe le type de leçon frontend vers backend
   */
  private mapLessonType(type: string): string {
    const typeMap: Record<string, string> = {
      'video': 'VIDEO',
      'text': 'LECTURE',
      'schema': 'LECTURE'
    };
    return typeMap[type] || 'VIDEO';
  }

  /**
   * Génère un template de formation exemple (JavaScript)
   */
  getJavaScriptFormationTemplate(): FormationTemplate {
    return {
      title: 'Formation Complète JavaScript',
      description: 'Une formation complète pour maîtriser JavaScript de A à Z, avec des modules progressifs, des cours pratiques et des quiz d\'évaluation.',
      level: 'Moyen' as DifficultyLevel,
      category: 'Développement Web',
      duration: 40, // 40 heures totales
      modules: [
        {
          title: 'Module 1 : Les Bases de JavaScript',
          description: 'Introduction aux concepts fondamentaux de JavaScript',
          duration: 10, // 10 heures
          order: 1,
          courses: [
            {
              title: 'Introduction à JavaScript',
              description: 'Découvrez l\'histoire et les bases de JavaScript',
              estimatedHours: 2,
              order: 1,
              lessons: [
                {
                  title: 'Qu\'est-ce que JavaScript ?',
                  description: 'Introduction générale à JavaScript et son rôle dans le développement web',
                  type: 'video',
                  videoUrl: 'https://example.com/video1',
                  transcript: 'JavaScript est un langage de programmation...',
                  duration: 15,
                  order: 1
                },
                {
                  title: 'Historique et évolution',
                  description: 'L\'évolution de JavaScript depuis sa création',
                  type: 'text',
                  contentUrl: 'https://example.com/article1',
                  duration: 10,
                  order: 2
                },
                {
                  title: 'Schéma de l\'écosystème JavaScript',
                  description: 'Visualisation de l\'écosystème JavaScript moderne',
                  type: 'schema',
                  contentUrl: 'https://example.com/schema1',
                  duration: 5,
                  order: 3
                }
              ]
            },
            {
              title: 'Variables et Types de Données',
              description: 'Apprenez à déclarer des variables et utiliser les types de données',
              estimatedHours: 3,
              order: 2,
              lessons: [
                {
                  title: 'Déclaration de variables',
                  description: 'let, const, var et leurs différences',
                  type: 'video',
                  videoUrl: 'https://example.com/video2',
                  duration: 20,
                  order: 1
                },
                {
                  title: 'Types primitifs',
                  description: 'String, Number, Boolean, etc.',
                  type: 'text',
                  contentUrl: 'https://example.com/article2',
                  duration: 15,
                  order: 2
                }
              ]
            },
            {
              title: 'Fonctions et Portée',
              description: 'Comprendre les fonctions et la portée des variables',
              estimatedHours: 3,
              order: 3,
              lessons: [
                {
                  title: 'Déclaration de fonctions',
                  description: 'Fonctions déclarées, expressions de fonctions, arrow functions',
                  type: 'video',
                  videoUrl: 'https://example.com/video3',
                  duration: 25,
                  order: 1
                },
                {
                  title: 'Portée et closure',
                  description: 'Comprendre le scope et les closures',
                  type: 'text',
                  contentUrl: 'https://example.com/article3',
                  duration: 20,
                  order: 2
                }
              ]
            },
            {
              title: 'Structures de Contrôle',
              description: 'Conditions et boucles en JavaScript',
              estimatedHours: 2,
              order: 4,
              lessons: [
                {
                  title: 'Conditions if/else et switch',
                  description: 'Gérer les conditions dans votre code',
                  type: 'video',
                  videoUrl: 'https://example.com/video4',
                  duration: 18,
                  order: 1
                },
                {
                  title: 'Boucles for, while, forEach',
                  description: 'Itérer sur des collections de données',
                  type: 'video',
                  videoUrl: 'https://example.com/video5',
                  duration: 22,
                  order: 2
                }
              ]
            }
          ],
          quiz: {
            title: 'Quiz Final - Module 1 : Les Bases',
            description: 'Évaluez vos connaissances sur les bases de JavaScript',
            duration: 30,
            passingScore: 70,
            maxAttempts: 3,
            questions: [
              {
                question: 'Quelle est la différence entre let et const ?',
                type: 'multiple_choice',
                options: [
                  'let est mutable, const est immuable',
                  'let est pour les variables, const pour les constantes',
                  'Aucune différence',
                  'const est plus rapide'
                ],
                correctAnswer: '0',
                points: 10,
                explanation: 'let permet de réassigner une valeur, const non',
                order: 1
              },
              {
                question: 'JavaScript est un langage compilé',
                type: 'true_false',
                correctAnswer: 'false',
                points: 5,
                explanation: 'JavaScript est un langage interprété',
                order: 2
              }
            ]
          }
        },
        {
          title: 'Module 2 : Programmation Orientée Objet',
          description: 'Maîtrisez les concepts de POO en JavaScript',
          duration: 12,
          order: 2,
          courses: [
            {
              title: 'Objets et Classes',
              description: 'Créer et manipuler des objets en JavaScript',
              estimatedHours: 4,
              order: 1,
              lessons: [
                {
                  title: 'Création d\'objets',
                  description: 'Syntaxe objet littéral et constructeurs',
                  type: 'video',
                  videoUrl: 'https://example.com/video6',
                  duration: 20,
                  order: 1
                },
                {
                  title: 'Classes ES6',
                  description: 'Utiliser les classes modernes de JavaScript',
                  type: 'video',
                  videoUrl: 'https://example.com/video7',
                  duration: 25,
                  order: 2
                }
              ]
            },
            {
              title: 'Héritage et Polymorphisme',
              description: 'Comprendre l\'héritage en JavaScript',
              estimatedHours: 4,
              order: 2,
              lessons: [
                {
                  title: 'Prototypes et chaîne de prototypes',
                  description: 'Le système de prototypes de JavaScript',
                  type: 'video',
                  videoUrl: 'https://example.com/video8',
                  duration: 30,
                  order: 1
                },
                {
                  title: 'Héritage avec extends',
                  description: 'Créer des classes qui héritent d\'autres classes',
                  type: 'text',
                  contentUrl: 'https://example.com/article4',
                  duration: 20,
                  order: 2
                }
              ]
            },
            {
              title: 'Encapsulation et Abstraction',
              description: 'Principes de l\'encapsulation en JavaScript',
              estimatedHours: 4,
              order: 3,
              lessons: [
                {
                  title: 'Méthodes privées et publiques',
                  description: 'Contrôler l\'accès aux propriétés et méthodes',
                  type: 'video',
                  videoUrl: 'https://example.com/video9',
                  duration: 25,
                  order: 1
                }
              ]
            }
          ],
          quiz: {
            title: 'Quiz Final - Module 2 : POO',
            description: 'Testez vos connaissances sur la programmation orientée objet',
            duration: 35,
            passingScore: 75,
            maxAttempts: 3,
            questions: [
              {
                question: 'Qu\'est-ce qu\'un prototype en JavaScript ?',
                type: 'multiple_choice',
                options: [
                  'Un modèle pour créer des objets',
                  'Un mécanisme d\'héritage',
                  'Une fonction spéciale',
                  'Un type de variable'
                ],
                correctAnswer: '1',
                points: 15,
                explanation: 'Le prototype est le mécanisme d\'héritage de JavaScript',
                order: 1
              }
            ]
          }
        },
        {
          title: 'Module 3 : Manipulation du DOM',
          description: 'Interagir avec les éléments HTML via JavaScript',
          duration: 10,
          order: 3,
          courses: [
            {
              title: 'Sélection et Manipulation d\'Éléments',
              description: 'Sélectionner et modifier les éléments du DOM',
              estimatedHours: 3,
              order: 1,
              lessons: [
                {
                  title: 'Méthodes de sélection',
                  description: 'querySelector, getElementById, etc.',
                  type: 'video',
                  videoUrl: 'https://example.com/video10',
                  duration: 20,
                  order: 1
                },
                {
                  title: 'Modifier le contenu',
                  description: 'textContent, innerHTML, et leurs différences',
                  type: 'video',
                  videoUrl: 'https://example.com/video11',
                  duration: 18,
                  order: 2
                }
              ]
            },
            {
              title: 'Événements',
              description: 'Gérer les interactions utilisateur',
              estimatedHours: 4,
              order: 2,
              lessons: [
                {
                  title: 'Écouteurs d\'événements',
                  description: 'addEventListener et gestion des événements',
                  type: 'video',
                  videoUrl: 'https://example.com/video12',
                  duration: 25,
                  order: 1
                },
                {
                  title: 'Types d\'événements courants',
                  description: 'click, submit, keydown, etc.',
                  type: 'text',
                  contentUrl: 'https://example.com/article5',
                  duration: 15,
                  order: 2
                }
              ]
            },
            {
              title: 'Création Dynamique d\'Éléments',
              description: 'Créer et ajouter des éléments au DOM',
              estimatedHours: 3,
              order: 3,
              lessons: [
                {
                  title: 'createElement et appendChild',
                  description: 'Créer des éléments dynamiquement',
                  type: 'video',
                  videoUrl: 'https://example.com/video13',
                  duration: 20,
                  order: 1
                }
              ]
            }
          ],
          quiz: {
            title: 'Quiz Final - Module 3 : DOM',
            description: 'Évaluez votre maîtrise de la manipulation du DOM',
            duration: 25,
            passingScore: 70,
            maxAttempts: 3,
            questions: [
              {
                question: 'Quelle méthode permet de sélectionner un élément par son ID ?',
                type: 'multiple_choice',
                options: [
                  'querySelector',
                  'getElementById',
                  'getElementsByClassName',
                  'Toutes les réponses'
                ],
                correctAnswer: '1',
                points: 10,
                explanation: 'getElementById est la méthode dédiée',
                order: 1
              }
            ]
          }
        },
        {
          title: 'Module 4 : Asynchrone et Promesses',
          description: 'Gérer l\'asynchrone avec Promises et async/await',
          duration: 8,
          order: 4,
          courses: [
            {
              title: 'Callbacks et Promises',
              description: 'Comprendre les callbacks et les promesses',
              estimatedHours: 3,
              order: 1,
              lessons: [
                {
                  title: 'Le problème des callbacks',
                  description: 'Callback hell et ses solutions',
                  type: 'video',
                  videoUrl: 'https://example.com/video14',
                  duration: 20,
                  order: 1
                },
                {
                  title: 'Introduction aux Promises',
                  description: 'Créer et utiliser des promesses',
                  type: 'video',
                  videoUrl: 'https://example.com/video15',
                  duration: 25,
                  order: 2
                }
              ]
            },
            {
              title: 'Async/Await',
              description: 'La syntaxe moderne pour l\'asynchrone',
              estimatedHours: 3,
              order: 2,
              lessons: [
                {
                  title: 'Syntaxe async/await',
                  description: 'Utiliser async et await pour simplifier le code asynchrone',
                  type: 'video',
                  videoUrl: 'https://example.com/video16',
                  duration: 25,
                  order: 1
                },
                {
                  title: 'Gestion des erreurs',
                  description: 'try/catch avec async/await',
                  type: 'text',
                  contentUrl: 'https://example.com/article6',
                  duration: 15,
                  order: 2
                }
              ]
            },
            {
              title: 'Fetch API',
              description: 'Faire des requêtes HTTP avec fetch',
              estimatedHours: 2,
              order: 3,
              lessons: [
                {
                  title: 'Requêtes GET et POST',
                  description: 'Utiliser fetch pour communiquer avec une API',
                  type: 'video',
                  videoUrl: 'https://example.com/video17',
                  duration: 20,
                  order: 1
                }
              ]
            }
          ],
          quiz: {
            title: 'Quiz Final - Module 4 : Asynchrone',
            description: 'Testez vos connaissances sur l\'asynchrone',
            duration: 30,
            passingScore: 70,
            maxAttempts: 3,
            questions: [
              {
                question: 'Quelle est la différence entre Promise et async/await ?',
                type: 'short_answer',
                correctAnswer: 'async/await est une syntaxe qui simplifie l\'utilisation des Promises',
                points: 15,
                explanation: 'async/await est du sucre syntaxique pour les Promises',
                order: 1
              }
            ]
          }
        }
      ]
    };
  }
}

