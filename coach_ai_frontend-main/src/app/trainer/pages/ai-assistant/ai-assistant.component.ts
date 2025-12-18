import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../services/trainer.service';
import { AIContentGenerationRequest, AIGeneratedContent, DifficultyLevel } from '../../models/trainer.interfaces';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss']
})
export class AiAssistantComponent {
  contentType: 'exercise' | 'quiz' | 'summary' | 'lesson' | 'example' | 'case_study' = 'exercise';
  difficulty: DifficultyLevel = 'Moyen';
  prompt = '';
  context = '';
  numberOfQuestions = 5;
  includeExamples = true;
  includeExplanations = true;
  tone: 'formal' | 'friendly' | 'motivating' | 'professional' = 'friendly';
  
  isGenerating = false;
  generatedContent: AIGeneratedContent | null = null;
  generationHistory: AIGeneratedContent[] = [];
  showHistory = false;

  contentTypes = [
    { value: 'exercise', label: 'Exercice', icon: 'assignment' },
    { value: 'quiz', label: 'Quiz', icon: 'quiz' },
    { value: 'summary', label: 'Résumé de cours', icon: 'summarize' },
    { value: 'lesson', label: 'Leçon', icon: 'menu_book' },
    { value: 'example', label: 'Exemple', icon: 'code' },
    { value: 'case_study', label: 'Étude de cas', icon: 'business_center' }
  ];

  difficulties: DifficultyLevel[] = ['Facile', 'Moyen', 'Difficile'];
  
  tones = [
    { value: 'formal', label: 'Formel' },
    { value: 'friendly', label: 'Amical' },
    { value: 'motivating', label: 'Motivant' },
    { value: 'professional', label: 'Professionnel' }
  ];

  constructor(private trainerService: TrainerService) {}

  generateContent(): void {
    if (!this.prompt.trim()) {
      return;
    }

    this.isGenerating = true;
    
    const request: Partial<AIContentGenerationRequest> = {
      type: this.contentType,
      prompt: this.prompt,
      difficulty: this.difficulty,
      context: this.context,
      parameters: {
        language: 'fr',
        tone: this.tone,
        detailLevel: 'moderate',
        includeExamples: this.includeExamples,
        includeExplanations: this.includeExplanations,
        numberOfQuestions: this.numberOfQuestions
      }
    };

    this.trainerService.generateContent(request).subscribe({
      next: (content) => {
        this.generatedContent = content;
        this.generationHistory.unshift(content);
        this.isGenerating = false;
      },
      error: () => {
        this.isGenerating = false;
      }
    });
  }

  approveContent(): void {
    if (this.generatedContent) {
      this.trainerService.approveAIContent(this.generatedContent.id).subscribe(() => {
        // Handle success
        this.generatedContent = null;
        this.prompt = '';
        this.context = '';
      });
    }
  }

  regenerateContent(): void {
    this.generateContent();
  }

  clearGeneration(): void {
    this.generatedContent = null;
    this.prompt = '';
    this.context = '';
  }

  loadHistory(): void {
    this.trainerService.getAIGenerationHistory().subscribe(history => {
      this.generationHistory = history;
    });
  }

  setContentType(value: string): void {
    this.contentType = value as typeof this.contentType;
  }

  getContentTypeIcon(type: string): string {
    return this.contentTypes.find(t => t.value === type)?.icon || 'help';
  }

  getContentTypeLabel(type: string): string {
    return this.contentTypes.find(t => t.value === type)?.label || type;
  }
}



