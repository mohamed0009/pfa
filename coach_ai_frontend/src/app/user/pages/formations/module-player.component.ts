import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { FormationsService } from '../../services/formations.service';
import { FormationModule, Formation, ModuleProgress } from '../../models/formation.interfaces';

// Interface pour le coach IA
interface AICoachMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AICoachSession {
  id: string;
  formationId: string;
  moduleId: string;
  messages: AICoachMessage[];
  createdAt: Date;
}

@Component({
  selector: 'app-module-player',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './module-player.component.html',
  styleUrl: './module-player.component.scss'
})
export class ModulePlayerComponent implements OnInit, OnDestroy {
  formation: Formation | null = null;
  module: FormationModule | null = null;
  enrollmentId: string | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  currentTab: 'text' | 'video' | 'lab' | 'quiz' = 'text';
  contentTab: 'transcript' | 'notes' | 'discussions' = 'transcript';
  renderedTextContent: string = '';
  renderedLabContent: string = '';
  userNotes: string = '';
  
  // Sidebar and AI Chat
  sidebarOpen: boolean = true;
  aiChatOpen: boolean = false;
  aiSession: AICoachSession | null = null;
  aiMessage: string = '';
  
  // Module Progress
  moduleProgresses: Map<string, ModuleProgress> = new Map();
  
  // Quiz properties
  currentQuiz: any = null;
  currentQuestionIndex: number = 0;
  userAnswers: Map<string, string> = new Map();
  quizScore: number = 0;
  quizPassed: boolean = false;
  isQuizSubmitted: boolean = false;
  showQuizResults: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationsService: FormationsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const formationId = this.route.snapshot.paramMap.get('id');
    const moduleId = this.route.snapshot.paramMap.get('moduleId');
    
    if (formationId && moduleId) {
      this.loadFormationAndModule(formationId, moduleId);
    }
    
    // Initialize AI Session
    this.initializeAISession();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFormationAndModule(formationId: string, moduleId: string): void {
    this.formationsService.getFormationById(formationId).subscribe({
      next: (formation: Formation) => {
        this.formation = formation;
        const module = formation.modules?.find(m => m.id === moduleId);
        
        if (module) {
          this.module = module;
          this.initializeModule();
        } else {
          console.error('Module not found');
          this.router.navigate(['/user/formations', formationId]);
        }
      },
      error: (error) => {
        console.error('Error loading formation:', error);
        this.router.navigate(['/user/formations']);
      }
    });
  }

  initializeModule(): void {
    if (!this.module) return;

    // Déterminer l'onglet par défaut
    if (this.module.videoUrl) {
      this.currentTab = 'video';
    } else if (this.module.textContent) {
      this.currentTab = 'text';
    } else if (this.module.labContent) {
      this.currentTab = 'lab';
    } else if (this.module.quiz) {
      this.currentTab = 'quiz';
    }

    // Rendre le contenu markdown en HTML (simplifié)
    if (this.module.textContent) {
      this.renderedTextContent = this.module.textContent
        .replace(/\n/g, '<br>')
        .replace(/#{3}\s(.+)/g, '<h3>$1</h3>')
        .replace(/#{2}\s(.+)/g, '<h2>$1</h2>')
        .replace(/#{1}\s(.+)/g, '<h1>$1</h1>');
    }
    
    if (this.module.labContent) {
      this.renderedLabContent = this.module.labContent
        .replace(/\n/g, '<br>')
        .replace(/#{3}\s(.+)/g, '<h3>$1</h3>')
        .replace(/#{2}\s(.+)/g, '<h2>$1</h2>')
        .replace(/#{1}\s(.+)/g, '<h1>$1</h1>');
    }

    // Préparer l'URL vidéo YouTube
    if (this.module.videoUrl) {
      const videoId = this.extractYouTubeId(this.module.videoUrl);
      if (videoId) {
        this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${videoId}`
        );
      } else {
        this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.module.videoUrl);
      }
    }

    // Charger le quiz si disponible
    if (this.module.quiz) {
      this.currentQuiz = this.module.quiz;
    }

    // Charger l'enrollment et la progression
    this.loadEnrollment();
    
    // Mettre à jour la session IA avec le module actuel
    if (this.aiSession && this.formation && this.module) {
      this.aiSession.formationId = this.formation.id;
      this.aiSession.moduleId = this.module.id;
    }
  }

  extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  loadEnrollment(): void {
    if (!this.formation) return;

    this.formationsService.getEnrolledFormations().subscribe({
      next: (enrollments) => {
        const enrollment = enrollments.find(e => e.formationId === this.formation?.id);
        if (enrollment) {
          this.enrollmentId = enrollment.id;
          // Charger les progressions des modules
          if (enrollment.moduleProgresses) {
            enrollment.moduleProgresses.forEach((mp: ModuleProgress) => {
              this.moduleProgresses.set(mp.moduleId, mp);
            });
          }
        }
      }
    });
  }

  // Sidebar Management
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // AI Chat Management
  toggleAIChat(): void {
    this.aiChatOpen = !this.aiChatOpen;
  }

  initializeAISession(): void {
    this.aiSession = {
      id: 'session-' + Date.now(),
      formationId: this.formation?.id || '',
      moduleId: this.module?.id || '',
      messages: [
        {
          role: 'ai',
          content: this.formation 
            ? `Bonjour ! Je suis votre coach IA pour la formation "${this.formation.title}". Comment puis-je vous aider aujourd'hui ?`
            : 'Bonjour ! Je suis votre coach IA. Comment puis-je vous aider ?',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    };
  }

  sendAIMessage(): void {
    if (!this.aiMessage.trim() || !this.aiSession) return;

    const userMessage: AICoachMessage = {
      role: 'user',
      content: this.aiMessage,
      timestamp: new Date()
    };

    this.aiSession.messages.push(userMessage);

    // Simuler une réponse de l'IA (à remplacer par un vrai appel API)
    setTimeout(() => {
      const aiResponse: AICoachMessage = {
        role: 'ai',
        content: `Je comprends votre question sur "${this.aiMessage}". Voici une explication détaillée : Les concepts que vous étudiez sont importants pour votre progression. Continuez à pratiquer et n'hésitez pas à poser des questions !`,
        timestamp: new Date()
      };
      if (this.aiSession) {
        this.aiSession.messages.push(aiResponse);
      }
    }, 1000);

    this.aiMessage = '';
  }

  // Module Navigation
  selectModule(module: FormationModule): void {
    if (module.isLocked) return;
    this.router.navigate(['/user/formations', this.formation?.id, 'modules', module.id]);
  }

  isModuleActive(module: FormationModule): boolean {
    return this.module?.id === module.id;
  }

  isModuleCompleted(module: FormationModule): boolean {
    const progress = this.moduleProgresses.get(module.id);
    return progress ? (progress.textCompleted && progress.videoCompleted && progress.labCompleted && progress.quizCompleted) : false;
  }

  getModuleProgress(module: FormationModule): number {
    const progress = this.moduleProgresses.get(module.id);
    if (!progress) return 0;
    
    let completed = 0;
    if (progress.textCompleted) completed++;
    if (progress.videoCompleted) completed++;
    if (progress.labCompleted) completed++;
    if (progress.quizCompleted) completed++;
    
    return Math.round((completed / 4) * 100);
  }

  getContentIcon(module: FormationModule): string {
    if (module.quiz) return 'quiz';
    if (module.videoUrl) return 'play_circle';
    if (module.labContent) return 'code';
    return 'article';
  }

  // Content Management
  markCurrentContentCompleted(): void {
    if (!this.enrollmentId || !this.module) return;

    switch (this.currentTab) {
      case 'text':
        this.markTextCompleted();
        break;
      case 'video':
        this.markVideoCompleted();
        break;
      case 'lab':
        this.markLabCompleted();
        break;
    }
  }

  isModuleFullyCompleted(): boolean {
    if (!this.module) return false;
    return this.isModuleCompleted(this.module);
  }

  markTextCompleted(): void {
    if (!this.enrollmentId || !this.module) return;

    this.formationsService.completeModuleText(this.enrollmentId, this.module.id).subscribe({
      next: () => {
        console.log('Text marked as completed');
        // Mettre à jour la progression locale
        const progress = this.moduleProgresses.get(this.module!.id);
        if (progress) {
          progress.textCompleted = true;
        }
      },
      error: (error) => {
        console.error('Error marking text as completed:', error);
      }
    });
  }

  markVideoCompleted(): void {
    if (!this.enrollmentId || !this.module) return;

    this.formationsService.completeModuleVideo(this.enrollmentId, this.module.id).subscribe({
      next: () => {
        console.log('Video marked as completed');
        const progress = this.moduleProgresses.get(this.module!.id);
        if (progress) {
          progress.videoCompleted = true;
        }
      },
      error: (error) => {
        console.error('Error marking video as completed:', error);
      }
    });
  }

  markLabCompleted(): void {
    if (!this.enrollmentId || !this.module) return;

    this.formationsService.completeModuleLab(this.enrollmentId, this.module.id).subscribe({
      next: () => {
        console.log('Lab marked as completed');
        const progress = this.moduleProgresses.get(this.module!.id);
        if (progress) {
          progress.labCompleted = true;
        }
      },
      error: (error) => {
        console.error('Error marking lab as completed:', error);
      }
    });
  }

  // Quiz Management
  selectAnswer(questionId: string, answer: string): void {
    this.userAnswers.set(questionId, answer);
  }

  getQuestionOptions(question: any): any[] {
    if (question.options && Array.isArray(question.options)) {
      if (question.options.length > 0 && typeof question.options[0] === 'object' && question.options[0].text !== undefined) {
        return question.options;
      }
      if (question.options.length > 0 && typeof question.options[0] === 'string') {
        return question.options.map((opt: string, index: number) => ({
          id: index.toString(),
          text: opt,
          isCorrect: index.toString() === question.correctAnswer
        }));
      }
      return question.options;
    }
    if (question.quizOptions && Array.isArray(question.quizOptions)) {
      return question.quizOptions;
    }
    return [];
  }

  getOptionText(option: any): string {
    if (typeof option === 'string') {
      return option;
    }
    return option.text || option.optionText || option.label || '';
  }

  submitQuiz(): void {
    if (!this.currentQuiz || !this.enrollmentId || !this.module) return;

    const answers: any = {};
    this.userAnswers.forEach((value, key) => {
      answers[key] = value;
    });

    this.formationsService.submitModuleQuiz(this.enrollmentId, this.module.id, answers).subscribe({
      next: (response: any) => {
        this.quizScore = response.quizScore || 0;
        this.quizPassed = response.quizPassed || false;
        this.isQuizSubmitted = true;
        this.showQuizResults = true;
        
        // Mettre à jour la progression
        const progress = this.moduleProgresses.get(this.module!.id);
        if (progress) {
          progress.quizCompleted = true;
          progress.quizScore = this.quizScore;
        }
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        let correctAnswers = 0;
        const totalQuestions = this.currentQuiz.questions?.length || 0;

        if (this.currentQuiz.questions) {
          this.currentQuiz.questions.forEach((question: any) => {
            const userAnswer = this.userAnswers.get(question.id);
            if (userAnswer === question.correctAnswer) {
              correctAnswers++;
            }
          });
        }

        this.quizScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        this.quizPassed = this.quizScore >= (this.currentQuiz.passingScore || 70);
        this.isQuizSubmitted = true;
        this.showQuizResults = true;
      }
    });
  }

  // Navigation
  goToNextModule(): void {
    if (!this.formation || !this.module) return;

    const currentIndex = this.formation.modules?.findIndex(m => m.id === this.module?.id) ?? -1;
    if (currentIndex >= 0 && this.formation.modules && currentIndex < this.formation.modules.length - 1) {
      const nextModule = this.formation.modules[currentIndex + 1];
      if (!nextModule.isLocked) {
        this.router.navigate(['/user/formations', this.formation.id, 'modules', nextModule.id]);
      }
    }
  }

  goToPreviousModule(): void {
    if (!this.formation || !this.module) return;

    const currentIndex = this.formation.modules?.findIndex(m => m.id === this.module?.id) ?? -1;
    if (currentIndex > 0 && this.formation.modules) {
      const prevModule = this.formation.modules[currentIndex - 1];
      this.router.navigate(['/user/formations', this.formation.id, 'modules', prevModule.id]);
    }
  }

  hasNextModule(): boolean {
    if (!this.formation || !this.module || !this.formation.modules) return false;
    const currentIndex = this.formation.modules.findIndex(m => m.id === this.module?.id);
    return currentIndex >= 0 && currentIndex < this.formation.modules.length - 1;
  }

  hasPreviousModule(): boolean {
    if (!this.formation || !this.module || !this.formation.modules) return false;
    const currentIndex = this.formation.modules.findIndex(m => m.id === this.module?.id);
    return currentIndex > 0;
  }
}
