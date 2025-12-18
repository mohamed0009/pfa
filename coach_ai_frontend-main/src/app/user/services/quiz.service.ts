import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Quiz, QuizAttempt, Question, UserAnswer, Exercise, ExerciseSubmission } from '../models/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
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

  constructor() {}

  // Récupérer tous les quiz
  getQuizzes(): Observable<Quiz[]> {
    return of(this.mockQuizzes).pipe(delay(300));
  }

  // Récupérer un quiz spécifique
  getQuiz(quizId: string): Observable<Quiz | undefined> {
    const quiz = this.mockQuizzes.find(q => q.id === quizId);
    return of(quiz).pipe(delay(350));
  }

  // Récupérer les quiz d'un module
  getQuizzesByModule(moduleId: string): Observable<Quiz[]> {
    const quizzes = this.mockQuizzes.filter(q => q.moduleId === moduleId);
    return of(quizzes).pipe(delay(300));
  }

  // Démarrer un quiz
  startQuiz(quizId: string): Observable<QuizAttempt> {
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

    const quiz = this.mockQuizzes.find(q => q.id === quizId);
    if (quiz) {
      quiz.attempts.push(attempt);
    }

    return of(attempt).pipe(delay(300));
  }

  // Soumettre un quiz
  submitQuiz(attemptId: string, answers: UserAnswer[]): Observable<QuizAttempt> {
    // Trouver la tentative
    let attempt: QuizAttempt | undefined;
    let quiz: Quiz | undefined;

    for (const q of this.mockQuizzes) {
      attempt = q.attempts.find(a => a.id === attemptId);
      if (attempt) {
        quiz = q;
        break;
      }
    }

    if (attempt && quiz) {
      attempt.answers = answers;
      attempt.completedAt = new Date();
      
      // Calculer le score
      const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      const earnedPoints = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
      
      attempt.score = earnedPoints;
      attempt.percentage = Math.round((earnedPoints / totalPoints) * 100);
      attempt.passed = attempt.percentage >= quiz.passingScore;
      
      // Générer un feedback
      if (attempt.passed) {
        attempt.feedback = attempt.percentage >= 90 
          ? 'Excellent ! Vous maîtrisez parfaitement ce sujet.' 
          : 'Très bien ! Vous avez une bonne compréhension du sujet.';
      } else {
        attempt.feedback = 'Continuez vos efforts. Révisez les points faibles et retentez le quiz.';
      }
    }

    return of(attempt!).pipe(delay(500));
  }

  // Récupérer tous les exercices
  getExercises(): Observable<Exercise[]> {
    return of(this.mockExercises).pipe(delay(300));
  }

  // Récupérer un exercice
  getExercise(exerciseId: string): Observable<Exercise | undefined> {
    const exercise = this.mockExercises.find(e => e.id === exerciseId);
    return of(exercise).pipe(delay(300));
  }

  // Soumettre un exercice
  submitExercise(exerciseId: string, content: string, attachments: string[]): Observable<ExerciseSubmission> {
    const submission: ExerciseSubmission = {
      id: 'sub_' + Date.now(),
      exerciseId,
      userId: 'user1',
      submittedAt: new Date(),
      content,
      attachments
    };

    const exercise = this.mockExercises.find(e => e.id === exerciseId);
    if (exercise) {
      exercise.status = 'submitted';
      exercise.submission = submission;
    }

    return of(submission).pipe(delay(400));
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




