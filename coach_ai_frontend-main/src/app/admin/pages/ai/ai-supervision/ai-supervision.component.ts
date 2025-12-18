import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiSupervisionService } from '../../../services/ai-supervision.service';
import { 
  AIConfiguration, 
  AIInteraction, 
  AIGeneratedContent,
  AIKnowledgeDocument
} from '../../../models/admin.interfaces';

@Component({
  selector: 'app-ai-supervision',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-supervision.component.html',
  styleUrl: './ai-supervision.component.scss'
})
export class AiSupervisionComponent implements OnInit {
  config: AIConfiguration | null = null;
  interactions: AIInteraction[] = [];
  generatedContent: AIGeneratedContent[] = [];
  knowledgeDocuments: AIKnowledgeDocument[] = [];
  
  // Stats
  aiStats = {
    totalInteractions: 0,
    averageResponseTime: 0,
    flaggedInteractions: 0,
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    generatedContentCount: { quiz: 0, exercise: 0, summary: 0 },
    averageContentRating: 0,
    knowledgeBaseSize: 0,
    indexedDocuments: 0
  };

  // Filters
  activeTab: 'configuration' | 'interactions' | 'generated' | 'knowledge' = 'configuration';
  interactionFilter: 'all' | 'flagged' = 'all';
  contentTypeFilter: 'all' | 'quiz' | 'exercise' | 'summary' = 'all';

  // Modals
  showInteractionModal = false;
  selectedInteraction: AIInteraction | null = null;
  showFlagModal = false;
  flagReason = '';

  // Configuration (editable)
  editingConfig = false;

  constructor(private aiService: AiSupervisionService) {}

  ngOnInit(): void {
    this.loadConfiguration();
    this.loadInteractions();
    this.loadGeneratedContent();
    this.loadKnowledgeDocuments();
    this.loadStatistics();
  }

  loadConfiguration(): void {
    this.aiService.getConfiguration().subscribe(config => {
      this.config = { ...config };
    });
  }

  loadInteractions(): void {
    const filters = this.interactionFilter === 'flagged' ? { flaggedOnly: true } : undefined;
    this.aiService.getInteractions(filters).subscribe(interactions => {
      this.interactions = interactions;
    });
  }

  loadGeneratedContent(): void {
    const type = this.contentTypeFilter === 'all' ? undefined : this.contentTypeFilter;
    this.aiService.getGeneratedContent(type).subscribe(content => {
      this.generatedContent = content;
    });
  }

  loadKnowledgeDocuments(): void {
    this.aiService.getKnowledgeDocuments().subscribe(docs => {
      this.knowledgeDocuments = docs;
    });
  }

  loadStatistics(): void {
    this.aiService.getAIStatistics().subscribe(stats => {
      this.aiStats = stats;
    });
  }

  // Configuration
  saveConfiguration(): void {
    if (!this.config) return;

    this.aiService.updateConfiguration(this.config).subscribe(() => {
      this.editingConfig = false;
      alert('Configuration mise à jour avec succès');
    });
  }

  cancelConfigEdit(): void {
    this.editingConfig = false;
    this.loadConfiguration(); // Reload original config
  }

  // Interactions
  viewInteraction(interaction: AIInteraction): void {
    this.selectedInteraction = interaction;
    this.showInteractionModal = true;
  }

  openFlagModal(interaction: AIInteraction): void {
    this.selectedInteraction = interaction;
    this.showFlagModal = true;
  }

  flagInteraction(): void {
    if (!this.selectedInteraction || !this.flagReason) return;

    this.aiService.flagInteraction(this.selectedInteraction.id, this.flagReason).subscribe(() => {
      this.loadInteractions();
      this.loadStatistics();
      this.closeFlagModal();
      alert('Interaction signalée avec succès');
    });
  }

  unflagInteraction(interaction: AIInteraction): void {
    this.aiService.unflagInteraction(interaction.id).subscribe(() => {
      this.loadInteractions();
      this.loadStatistics();
    });
  }

  closeFlagModal(): void {
    this.showFlagModal = false;
    this.flagReason = '';
    this.selectedInteraction = null;
  }

  // Generated Content
  archiveContent(content: AIGeneratedContent): void {
    if (confirm('Archiver ce contenu généré?')) {
      this.aiService.archiveGeneratedContent(content.id).subscribe(() => {
        this.loadGeneratedContent();
      });
    }
  }

  // Knowledge Base
  uploadDocument(): void {
    // Simulate file upload
    const mockDoc: Partial<AIKnowledgeDocument> = {
      title: 'Nouveau Document',
      category: 'Général',
      fileType: 'pdf',
      fileSize: 1500000
    };

    this.aiService.uploadKnowledgeDocument(mockDoc).subscribe(() => {
      this.loadKnowledgeDocuments();
      this.loadStatistics();
      alert('Document uploadé et en cours d\'indexation');
    });
  }

  deleteDocument(doc: AIKnowledgeDocument): void {
    if (confirm(`Supprimer "${doc.title}" de la base de connaissances?`)) {
      this.aiService.deleteKnowledgeDocument(doc.id).subscribe(() => {
        this.loadKnowledgeDocuments();
        this.loadStatistics();
      });
    }
  }

  // Helpers
  getSentimentColor(sentiment?: string): string {
    switch (sentiment) {
      case 'positive': return '#10b981';
      case 'neutral': return '#6b7280';
      case 'negative': return '#dc2626';
      default: return '#6b7280';
    }
  }

  getSentimentIcon(sentiment?: string): string {
    switch (sentiment) {
      case 'positive': return 'sentiment_satisfied';
      case 'neutral': return 'sentiment_neutral';
      case 'negative': return 'sentiment_dissatisfied';
      default: return 'help';
    }
  }

  getContentTypeIcon(type: string): string {
    switch (type) {
      case 'quiz': return 'quiz';
      case 'exercise': return 'assignment';
      case 'summary': return 'summarize';
      default: return 'description';
    }
  }

  getFileStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'error': return '#dc2626';
      default: return '#6b7280';
    }
  }
}




