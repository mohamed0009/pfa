import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface QuizQuestion {
  id: string;
  questionNumber: number;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'CODE';
  question: string;
  explanation?: string;
  points: number;
  options?: QuizOption[];
  correctAnswer?: string;
  codeTemplate?: string;
  aiHintEnabled: boolean;
  order: number;
}

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number; // minutes
  passingScore: number;
  maxAttempts: number;
  isGraded: boolean;
  questions: QuizQuestion[];
}

interface QuizAnswer {
  questionId: string;
  userAnswer: string;
}

@Component({
  selector: 'app-quiz-player',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-player.component.html',
  styleUrl: './quiz-player.component.scss'
})
export class QuizPlayerComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  currentQuestionIndex: number = 0;
  userAnswers: Map<string, string> = new Map();
  timeRemaining: number = 0; // secondes
  isSubmitted: boolean = false;
  score: number = 0;
  passed: boolean = false;
  
  // Expose String pour le template
  String = String;
  
  private timerSubscription?: Subscription;
  private apiUrl = 'http://localhost:8081/api/user/quizzes';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (quizId) {
      this.loadQuiz(quizId);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  loadQuiz(quizId: string): void {
    this.http.get<Quiz>(`${this.apiUrl}/${quizId}`).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.timeRemaining = quiz.duration * 60; // Convertir minutes en secondes
        this.startTimer();
        console.log('Quiz loaded:', quiz);
      },
      error: (error) => {
        console.error('Error loading quiz:', error);
        alert('Erreur lors du chargement du quiz');
      }
    });
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.submitQuiz(); // Auto-submit quand temps écoulé
      }
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  getCurrentQuestion(): QuizQuestion | null {
    if (!this.quiz) return null;
    return this.quiz.questions[this.currentQuestionIndex] || null;
  }

  selectAnswer(answer: string): void {
    const question = this.getCurrentQuestion();
    if (!question) return;
    
    this.userAnswers.set(question.id, answer);
  }

  getUserAnswer(questionId: string): string | undefined {
    return this.userAnswers.get(questionId);
  }

  goToQuestion(index: number): void {
    if (index >= 0 && this.quiz && index < this.quiz.questions.length) {
      this.currentQuestionIndex = index;
    }
  }

  nextQuestion(): void {
    if (this.quiz && this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  canSubmit(): boolean {
    if (!this.quiz) return false;
    // Vérifier que toutes les questions obligatoires ont une réponse
    return this.quiz.questions.every(q => this.userAnswers.has(q.id));
  }

  submitQuiz(): void {
    if (!this.quiz) return;

    this.stopTimer();

    // Préparer les réponses pour l'API
    const answers: QuizAnswer[] = Array.from(this.userAnswers.entries()).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer
    }));

    const submission = {
      quizId: this.quiz.id,
      answers: answers,
      timeSpent: (this.quiz.duration * 60) - this.timeRemaining
    };

    this.http.post<any>(`${this.apiUrl}/${this.quiz.id}/submit`, submission).subscribe({
      next: (result) => {
        this.score = result.score;
        this.passed = result.passed;
        this.isSubmitted = true;
        console.log('Quiz submitted:', result);

        // Si échec, notifier le formateur
        if (!this.passed) {
          this.notifyTrainerOfFailure();
        }
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        alert('Erreur lors de la soumission du quiz');
      }
    });
  }

  private notifyTrainerOfFailure(): void {
    // L'API backend peut créer une alerte pour le formateur
    console.log('Notifying trainer of quiz failure');
  }

  retryQuiz(): void {
    // Recharger le quiz pour une nouvelle tentative
    if (this.quiz) {
      this.userAnswers.clear();
      this.currentQuestionIndex = 0;
      this.isSubmitted = false;
      this.timeRemaining = this.quiz.duration * 60;
      this.startTimer();
    }
  }

  exitQuiz(): void {
    this.router.navigate(['/user/dashboard']);
  }

  getTimeFormatted(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getProgressPercentage(): number {
    if (!this.quiz) return 0;
    return Math.round((this.userAnswers.size / this.quiz.questions.length) * 100);
  }

  isQuestionAnswered(questionId: string): boolean {
    return this.userAnswers.has(questionId);
  }
}

