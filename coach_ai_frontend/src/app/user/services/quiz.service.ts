import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { Quiz, QuizAttempt, Question, UserAnswer, Exercise, ExerciseSubmission } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:8081/api/user';

  constructor(private http: HttpClient) {}

  // Mapper les données backend vers l'interface frontend
  private mapBackendQuizToFrontend(backendQuiz: any): Quiz {
    return {
      id: backendQuiz.id,
      moduleId: backendQuiz.course?.id || '',
      title: backendQuiz.title || '',
      description: backendQuiz.description || '',
      difficulty: this.mapDifficulty(backendQuiz.difficulty),
      duration: backendQuiz.duration || 0,
      questionsCount: backendQuiz.questions?.length || 0,
      passingScore: backendQuiz.passingScore || 70,
      attempts: (backendQuiz.attempts || []).map((a: any) => this.mapBackendAttemptToFrontend(a)),
      questions: (backendQuiz.questions || []).map((q: any) => this.mapBackendQuestionToFrontend(q)),
      isAIGenerated: backendQuiz.isAIGenerated || false
    };
  }

  private mapBackendQuestionToFrontend(backendQuestion: any): Question {
    const options = backendQuestion.options?.map((opt: any) => opt.text || opt) || [];
    
    return {
      id: backendQuestion.id,
      type: this.mapQuestionType(backendQuestion.type),
      question: backendQuestion.question || '',
      options: options.length > 0 ? options : undefined,
      correctAnswer: backendQuestion.correctAnswer || '',
      explanation: backendQuestion.explanation,
      points: backendQuestion.points || 10
    };
  }

  private mapBackendAttemptToFrontend(backendAttempt: any): QuizAttempt {
    return {
      id: backendAttempt.id,
      quizId: backendAttempt.quiz?.id || backendAttempt.quizId || '',
      userId: backendAttempt.user?.id || backendAttempt.userId || '',
      startedAt: new Date(backendAttempt.startedAt),
      completedAt: backendAttempt.submittedAt ? new Date(backendAttempt.submittedAt) : undefined,
      score: backendAttempt.score || 0,
      percentage: backendAttempt.score || 0,
      passed: backendAttempt.passed || false,
      answers: [],
      feedback: ''
    };
  }

  private mapDifficulty(backendDifficulty: string): 'Facile' | 'Moyen' | 'Difficile' {
    const upper = backendDifficulty?.toUpperCase() || '';
    if (upper === 'FACILE') return 'Facile';
    if (upper === 'MOYEN') return 'Moyen';
    if (upper === 'DIFFICILE') return 'Difficile';
    return 'Moyen';
  }

  private mapQuestionType(backendType: string): 'mcq' | 'true_false' | 'open' {
    const upper = backendType?.toUpperCase() || '';
    if (upper === 'MULTIPLE_CHOICE') return 'mcq';
    if (upper === 'TRUE_FALSE') return 'true_false';
    return 'open';
  }

  // Fallback mock data (utilisé si le backend n'est pas disponible)
  private mockQuizzes: Quiz[] = [
    {
      id: 'quiz1',
      moduleId: 'mod2',
      title: 'Quiz : JavaScript Fondamentaux',
      description: 'Testez vos connaissances sur les bases de JavaScript',
      difficulty: 'Moyen',
      duration: 20,
      questionsCount: 10,
      passingScore: 70,
      isAIGenerated: false,
      attempts: [
        {
          id: 'attempt1',
          quizId: 'quiz1',
          userId: 'user1',
          startedAt: new Date('2025-12-10T14:30:00'),
          completedAt: new Date('2025-12-10T14:48:00'),
          score: 85,
          percentage: 85,
          passed: true,
          answers: [],
          feedback: 'Excellent travail ! Vous maîtrisez bien les fondamentaux de JavaScript.'
        }
      ],
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Quelle est la différence entre let et const en JavaScript ?',
          options: [
            'let est pour les variables réassignables, const pour les constantes',
            'let est global, const est local',
            'Il n\'y a pas de différence',
            'const ne peut contenir que des nombres'
          ],
          correctAnswer: 0,
          explanation: 'let permet de réassigner une valeur, tandis que const crée une variable dont la référence ne peut pas être modifiée.',
          points: 10
        },
        {
          id: 'q2',
          type: 'true_false',
          question: 'En JavaScript, tous les objets héritent de Object.prototype',
          correctAnswer: 'true',
          explanation: 'Vrai. Tous les objets JavaScript héritent des propriétés et méthodes de Object.prototype.',
          points: 10
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'Quel est le résultat de : typeof null ?',
          options: ['null', 'object', 'undefined', 'error'],
          correctAnswer: 1,
          explanation: 'typeof null renvoie "object", c\'est une particularité historique de JavaScript.',
          points: 10
        }
      ]
    },
    {
      id: 'quiz2',
      moduleId: 'mod3',
      title: 'Quiz : React Composants',
      description: 'Évaluez votre compréhension des composants React',
      difficulty: 'Moyen',
      duration: 25,
      questionsCount: 12,
      passingScore: 75,
      isAIGenerated: true,
      attempts: [],
      questions: [
        {
          id: 'q4',
          type: 'mcq',
          question: 'Quelle est la bonne façon de définir un composant fonctionnel ?',
          options: [
            'function MyComponent() { return <div>Hello</div> }',
            'const MyComponent = () => { return <div>Hello</div> }',
            'Les deux réponses sont correctes',
            'Aucune des réponses'
          ],
          correctAnswer: 2,
          explanation: 'Les deux syntaxes sont valides pour définir un composant fonctionnel React.',
          points: 8
        },
        {
          id: 'q5',
          type: 'true_false',
          question: 'Les props sont mutables dans un composant React',
          correctAnswer: 'false',
          explanation: 'Faux. Les props sont en lecture seule et ne doivent jamais être modifiées directement.',
          points: 8
        }
      ]
    },
    {
      id: 'quiz3',
      moduleId: 'mod3',
      title: 'Quiz : Hooks React',
      description: 'Testez vos connaissances sur les hooks React',
      difficulty: 'Difficile',
      duration: 30,
      questionsCount: 15,
      passingScore: 70,
      isAIGenerated: true,
      attempts: [],
      questions: []
    }
  ];

  private mockExercises: Exercise[] = [
    {
      id: 'ex1',
      moduleId: 'mod3',
      title: 'Créer une Todo List en React',
      description: 'Développez une application de gestion de tâches avec React',
      type: 'pratique',
      difficulty: 'Moyen',
      estimatedTime: 120,
      instructions: 'Créez une application Todo List qui permet d\'ajouter, supprimer et marquer des tâches comme complétées. Utilisez les hooks useState pour gérer l\'état.',
      status: 'in_progress',
      submission: {
        id: 'sub1',
        exerciseId: 'ex1',
        userId: 'user1',
        submittedAt: new Date('2025-12-12T16:30:00'),
        content: 'Code de l\'exercice...',
        attachments: [],
        feedback: 'Bon travail ! Pensez à ajouter la validation des champs.',
        score: 82,
        reviewedAt: new Date('2025-12-13T09:00:00')
      }
    },
    {
      id: 'ex2',
      moduleId: 'mod3',
      title: 'Formulaire de Contact avec Validation',
      description: 'Créez un formulaire avec validation en temps réel',
      type: 'pratique',
      difficulty: 'Facile',
      estimatedTime: 90,
      instructions: 'Implémentez un formulaire de contact avec validation pour le nom, email et message.',
      status: 'not_started'
    }
  ];

  // Récupérer tous les quiz
  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<any[]>(`${this.apiUrl}/quizzes`).pipe(
      map((backendQuizzes: any[]) => {
        if (!backendQuizzes || backendQuizzes.length === 0) {
          // Fallback vers mock data si aucune donnée
          return this.mockQuizzes;
        }
        return backendQuizzes.map(q => this.mapBackendQuizToFrontend(q));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching quizzes from backend:', error);
        // Fallback vers mock data en cas d'erreur
        return of(this.mockQuizzes);
      })
    );
  }

  // Récupérer un quiz spécifique
  getQuiz(quizId: string): Observable<Quiz | undefined> {
    return this.http.get<any>(`${this.apiUrl}/quizzes/${quizId}`).pipe(
      map((backendQuiz: any) => {
        if (!backendQuiz) {
          return undefined;
        }
        return this.mapBackendQuizToFrontend(backendQuiz);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching quiz from backend:', error);
        // Fallback vers mock data
        const quiz = this.mockQuizzes.find(q => q.id === quizId);
        return of(quiz);
      })
    );
  }

  // Récupérer les quiz d'un module
  getQuizzesByModule(moduleId: string): Observable<Quiz[]> {
    return this.getQuizzes().pipe(
      map(quizzes => quizzes.filter(q => q.moduleId === moduleId))
    );
  }

  // Démarrer un quiz
  startQuiz(quizId: string): Observable<QuizAttempt> {
    return this.http.post<any>(`${this.apiUrl}/quizzes/${quizId}/attempts`, {}).pipe(
      map((backendAttempt: any) => {
        return this.mapBackendAttemptToFrontend(backendAttempt);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error starting quiz attempt:', error);
        // Fallback vers mock
        const attempt: QuizAttempt = {
          id: 'attempt_' + Date.now(),
          quizId,
          userId: 'user1',
          startedAt: new Date(),
          score: 0,
          percentage: 0,
          passed: false,
          answers: [],
          feedback: ''
        };
        return of(attempt);
      })
    );
  }

  // Soumettre un quiz
  submitQuiz(attemptId: string, answers: UserAnswer[]): Observable<QuizAttempt> {
    // Convertir les réponses au format backend
    const answerData = answers.map(a => ({
      questionId: a.questionId,
      userAnswer: String(a.answer)
    }));

    return this.http.post<any>(`${this.apiUrl}/quizzes/attempts/${attemptId}/submit`, answerData).pipe(
      map((backendAttempt: any) => {
        const attempt = this.mapBackendAttemptToFrontend(backendAttempt);
        attempt.answers = answers;
        
        // Générer un feedback basé sur le score
        if (attempt.passed) {
          attempt.feedback = attempt.percentage >= 90 
            ? 'Excellent ! Vous maîtrisez parfaitement ce sujet.' 
            : 'Très bien ! Vous avez une bonne compréhension du sujet.';
        } else {
          attempt.feedback = 'Continuez vos efforts. Révisez les points faibles et retentez le quiz.';
        }
        
        return attempt;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error submitting quiz:', error);
        return throwError(() => new Error('Erreur lors de la soumission du quiz'));
      })
    );
  }

  // Récupérer tous les exercices
  getExercises(): Observable<Exercise[]> {
    return this.http.get<any[]>(`${this.apiUrl}/exercises`).pipe(
      map((backendExercises: any[]) => {
        if (!backendExercises || backendExercises.length === 0) {
          return this.mockExercises;
        }
        return backendExercises.map(e => this.mapBackendExerciseToFrontend(e));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching exercises from backend:', error);
        return of(this.mockExercises);
      })
    );
  }

  // Récupérer un exercice
  getExercise(exerciseId: string): Observable<Exercise | undefined> {
    return this.http.get<any>(`${this.apiUrl}/exercises/${exerciseId}`).pipe(
      map((backendExercise: any) => {
        if (!backendExercise) {
          return undefined;
        }
        return this.mapBackendExerciseToFrontend(backendExercise);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching exercise from backend:', error);
        const exercise = this.mockExercises.find(e => e.id === exerciseId);
        return of(exercise);
      })
    );
  }

  // Soumettre un exercice
  submitExercise(exerciseId: string, content: string, attachments: string[]): Observable<ExerciseSubmission> {
    const submissionData = {
      content,
      attachments: attachments || []
    };

    return this.http.post<any>(`${this.apiUrl}/exercises/${exerciseId}/submissions`, submissionData).pipe(
      map((backendSubmission: any) => {
        return {
          id: backendSubmission.id,
          exerciseId: backendSubmission.exercise?.id || exerciseId,
          userId: backendSubmission.user?.id || '',
          submittedAt: new Date(backendSubmission.submittedAt),
          content: backendSubmission.content || content,
          attachments: backendSubmission.attachments || attachments,
          feedback: backendSubmission.feedback,
          score: backendSubmission.score,
          reviewedAt: backendSubmission.reviewedAt ? new Date(backendSubmission.reviewedAt) : undefined
        };
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error submitting exercise:', error);
        return throwError(() => new Error('Erreur lors de la soumission de l\'exercice'));
      })
    );
  }

  // Mapper les données backend vers l'interface frontend pour les exercices
  private mapBackendExerciseToFrontend(backendExercise: any): Exercise {
    // Déterminer le statut basé sur les soumissions
    let status: 'not_started' | 'in_progress' | 'submitted' | 'reviewed' = 'not_started';
    let submission: ExerciseSubmission | undefined = undefined;

    // Récupérer les soumissions si disponibles
    if (backendExercise.submissions && backendExercise.submissions.length > 0) {
      const latestSubmission = backendExercise.submissions[backendExercise.submissions.length - 1];
      const submissionStatus = latestSubmission.status?.toUpperCase();
      
      if (submissionStatus === 'REVIEWED' || submissionStatus === 'GRADED') {
        status = 'reviewed';
      } else if (submissionStatus === 'SUBMITTED') {
        status = 'submitted';
      } else {
        status = 'in_progress';
      }

      submission = {
        id: latestSubmission.id,
        exerciseId: backendExercise.id,
        userId: latestSubmission.user?.id || '',
        submittedAt: new Date(latestSubmission.submittedAt),
        content: latestSubmission.content || '',
        attachments: latestSubmission.attachments || [],
        feedback: latestSubmission.feedback,
        score: latestSubmission.score,
        reviewedAt: latestSubmission.reviewedAt ? new Date(latestSubmission.reviewedAt) : undefined
      };
    }

    return {
      id: backendExercise.id,
      moduleId: backendExercise.course?.id || '',
      title: backendExercise.title || '',
      description: backendExercise.description || '',
      type: this.mapExerciseType(backendExercise.type),
      difficulty: this.mapDifficulty(backendExercise.difficulty),
      estimatedTime: backendExercise.estimatedTime || 0,
      instructions: backendExercise.instructions || '',
      status,
      submission
    };
  }

  private mapExerciseType(backendType: string): 'pratique' | 'simulation' | 'projet' {
    const upper = backendType?.toUpperCase() || '';
    if (upper === 'PRATIQUE' || upper === 'CODE') return 'pratique';
    if (upper === 'SIMULATION') return 'simulation';
    if (upper === 'PROJET') return 'projet';
    return 'pratique';
  }

  // Évaluer une réponse (pour les questions ouvertes - mock AI)
  evaluateAnswer(questionId: string, answer: string): Observable<{ isCorrect: boolean; feedback: string; points: number }> {
    // Simulation d'évaluation IA
    const result = {
      isCorrect: Math.random() > 0.3, // 70% de chance d'être correcte
      feedback: 'Votre réponse montre une bonne compréhension du concept. Pensez à inclure plus d\'exemples concrets.',
      points: Math.floor(Math.random() * 5) + 5 // Entre 5 et 10 points
    };
    
    return of(result).pipe(delay(800));
  }
}




