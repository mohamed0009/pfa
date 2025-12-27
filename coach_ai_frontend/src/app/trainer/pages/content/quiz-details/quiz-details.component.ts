import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../../services/trainer.service';
import { TrainerQuiz, DifficultyLevel } from '../../../models/trainer.interfaces';

export interface QuizQuestion {
  id?: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options: QuizOption[];
  correctAnswer: string; // Index de la bonne réponse pour QCM
  points: number;
  explanation?: string;
  order: number;
}

export interface QuizOption {
  id?: string;
  text: string;
  isCorrect: boolean;
}

@Component({
  selector: 'app-quiz-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './quiz-details.component.html',
  styleUrls: ['./quiz-details.component.scss']
})
export class QuizDetailsComponent implements OnInit {
  quiz: TrainerQuiz | null = null;
  questions: QuizQuestion[] = [];
  isLoading = true;
  
  // Méthodes helper pour le template
  parseInt(value: string): number {
    return parseInt(value, 10);
  }
  
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
  
  // Modal de création de question
  showCreateQuestionModal = false;
  isCreatingQuestion = false;
  newQuestion: QuizQuestion = {
    question: '',
    type: 'MULTIPLE_CHOICE',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: '0',
    points: 1,
    explanation: '',
    order: 0
  };

  // Modal d'édition de question
  showEditQuestionModal = false;
  isUpdatingQuestion = false;
  editingQuestion: QuizQuestion | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private trainerService: TrainerService
  ) {}

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (quizId) {
      this.loadQuiz(quizId);
      this.loadQuestions(quizId);
    }
  }

  private loadQuiz(id: string): void {
    this.trainerService.getQuizById(id).subscribe({
      next: (quiz: any) => {
        this.quiz = {
          id: quiz.id,
          courseId: quiz.course?.id || quiz.courseId || '',
          title: quiz.title,
          description: quiz.description || '',
          difficulty: quiz.difficulty ? (quiz.difficulty.toLowerCase() === 'facile' ? 'Facile' : quiz.difficulty.toLowerCase() === 'moyen' ? 'Moyen' : 'Difficile') as DifficultyLevel : 'Moyen' as DifficultyLevel,
          duration: quiz.duration || 30,
          passingScore: quiz.passingScore || 60,
          maxAttempts: quiz.maxAttempts || 3,
          status: (quiz.status?.toLowerCase() || 'draft') as any,
          questions: quiz.questions || [],
          attempts: quiz.attempts || [],
          createdBy: quiz.createdBy?.id || '',
          createdAt: quiz.createdAt ? new Date(quiz.createdAt) : new Date(),
          updatedAt: quiz.updatedAt ? new Date(quiz.updatedAt) : new Date()
        };
      },
      error: (error: any) => {
        console.error('Error loading quiz:', error);
        this.router.navigate(['/trainer/content/quizzes']);
      }
    });
  }

  private loadQuestions(quizId: string): void {
    this.isLoading = true;
    this.trainerService.getQuizQuestions(quizId).subscribe({
      next: (questions: any[]) => {
        this.questions = questions.map(q => ({
          id: q.id,
          question: q.question,
          type: q.type || 'MULTIPLE_CHOICE',
          options: q.options || [],
          correctAnswer: q.correctAnswer || '0',
          points: q.points || 1,
          explanation: q.explanation || '',
          order: q.order || q.questionNumber || 0
        }));
        this.questions.sort((a, b) => a.order - b.order);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading questions:', error);
        this.questions = [];
        this.isLoading = false;
      }
    });
  }

  openCreateQuestionModal(): void {
    this.showCreateQuestionModal = true;
    this.newQuestion = {
      question: '',
      type: 'MULTIPLE_CHOICE',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: '0',
      points: 1,
      explanation: '',
      order: this.questions.length + 1
    };
  }

  closeCreateQuestionModal(): void {
    this.showCreateQuestionModal = false;
  }

  addOption(): void {
    this.newQuestion.options.push({ text: '', isCorrect: false });
  }

  removeOption(index: number): void {
    if (this.newQuestion.options.length > 2) {
      this.newQuestion.options.splice(index, 1);
      // Ajuster correctAnswer si nécessaire
      const currentCorrect = parseInt(this.newQuestion.correctAnswer);
      if (currentCorrect >= this.newQuestion.options.length) {
        this.newQuestion.correctAnswer = '0';
      }
    }
  }

  createQuestion(): void {
    if (!this.newQuestion.question.trim() || !this.quiz) {
      alert('La question est requise');
      return;
    }

    if (this.newQuestion.type === 'MULTIPLE_CHOICE') {
      const validOptions = this.newQuestion.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        alert('Au moins 2 options sont requises pour un QCM');
        return;
      }
      if (!this.newQuestion.correctAnswer) {
        alert('Veuillez sélectionner la bonne réponse');
        return;
      }
    }

    this.isCreatingQuestion = true;
    const questionData: any = {
      quizId: this.quiz.id,
      question: this.newQuestion.question,
      type: this.newQuestion.type,
      points: this.newQuestion.points,
      order: this.newQuestion.order,
      explanation: this.newQuestion.explanation
    };

    if (this.newQuestion.type === 'MULTIPLE_CHOICE') {
      questionData.options = this.newQuestion.options.filter(opt => opt.text.trim());
      questionData.correctAnswer = this.newQuestion.correctAnswer;
    } else {
      questionData.correctAnswer = this.newQuestion.correctAnswer;
    }

    this.trainerService.createQuizQuestion(questionData).subscribe({
      next: (question: any) => {
        this.questions.push({
          id: question.id,
          question: question.question,
          type: question.type || 'MULTIPLE_CHOICE',
          options: question.options || [],
          correctAnswer: question.correctAnswer || '0',
          points: question.points || 1,
          explanation: question.explanation || '',
          order: question.order || question.questionNumber || 0
        });
        this.questions.sort((a, b) => a.order - b.order);
        this.closeCreateQuestionModal();
        this.isCreatingQuestion = false;
      },
      error: (error: any) => {
        console.error('Error creating question:', error);
        alert('Erreur lors de la création de la question');
        this.isCreatingQuestion = false;
      }
    });
  }

  deleteQuestion(questionId: string | undefined): void {
    if (!questionId) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      this.trainerService.deleteQuizQuestion(questionId).subscribe({
        next: () => {
          this.questions = this.questions.filter(q => q.id !== questionId);
        },
        error: (error: any) => {
          console.error('Error deleting question:', error);
          alert('Erreur lors de la suppression de la question');
        }
      });
    }
  }

  openEditQuestionModal(question: QuizQuestion): void {
    this.editingQuestion = JSON.parse(JSON.stringify(question)); // Deep copy
    this.showEditQuestionModal = true;
  }

  closeEditQuestionModal(): void {
    this.showEditQuestionModal = false;
    this.editingQuestion = null;
  }

  updateQuestion(): void {
    if (!this.editingQuestion || !this.quiz) {
      return;
    }

    if (!this.editingQuestion.question.trim()) {
      alert('La question est requise');
      return;
    }

    if (this.editingQuestion.type === 'MULTIPLE_CHOICE') {
      const validOptions = this.editingQuestion.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        alert('Au moins 2 options sont requises pour un QCM');
        return;
      }
    }

    this.isUpdatingQuestion = true;
    const updateData: any = {
      question: this.editingQuestion.question,
      type: this.editingQuestion.type,
      points: this.editingQuestion.points,
      order: this.editingQuestion.order,
      explanation: this.editingQuestion.explanation
    };

    if (this.editingQuestion.type === 'MULTIPLE_CHOICE') {
      updateData.options = this.editingQuestion.options.filter(opt => opt.text.trim());
      updateData.correctAnswer = this.editingQuestion.correctAnswer;
    } else {
      updateData.correctAnswer = this.editingQuestion.correctAnswer;
    }

    this.trainerService.updateQuizQuestion(this.editingQuestion.id!, updateData).subscribe({
      next: (question: any) => {
        const index = this.questions.findIndex(q => q.id === this.editingQuestion!.id);
        if (index !== -1) {
          this.questions[index] = {
            id: question.id,
            question: question.question,
            type: question.type || 'MULTIPLE_CHOICE',
            options: question.options || [],
            correctAnswer: question.correctAnswer || '0',
            points: question.points || 1,
            explanation: question.explanation || '',
            order: question.order || question.questionNumber || 0
          };
          this.questions.sort((a, b) => a.order - b.order);
        }
        this.closeEditQuestionModal();
        this.isUpdatingQuestion = false;
      },
      error: (error: any) => {
        console.error('Error updating question:', error);
        alert('Erreur lors de la mise à jour de la question');
        this.isUpdatingQuestion = false;
      }
    });
  }

  addEditOption(): void {
    if (this.editingQuestion) {
      this.editingQuestion.options.push({ text: '', isCorrect: false });
    }
  }

  removeEditOption(index: number): void {
    if (this.editingQuestion && this.editingQuestion.options.length > 2) {
      this.editingQuestion.options.splice(index, 1);
      const currentCorrect = parseInt(this.editingQuestion.correctAnswer);
      if (currentCorrect >= this.editingQuestion.options.length) {
        this.editingQuestion.correctAnswer = '0';
      }
    }
  }

  onQuestionTypeChange(): void {
    if (this.newQuestion.type !== 'MULTIPLE_CHOICE') {
      this.newQuestion.options = [];
      this.newQuestion.correctAnswer = '';
    } else if (this.newQuestion.options.length === 0) {
      this.newQuestion.options = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ];
      this.newQuestion.correctAnswer = '0';
    }
  }

  onEditQuestionTypeChange(): void {
    if (this.editingQuestion) {
      if (this.editingQuestion.type !== 'MULTIPLE_CHOICE') {
        this.editingQuestion.options = [];
        this.editingQuestion.correctAnswer = '';
      } else if (this.editingQuestion.options.length === 0) {
        this.editingQuestion.options = [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ];
        this.editingQuestion.correctAnswer = '0';
      }
    }
  }
}

