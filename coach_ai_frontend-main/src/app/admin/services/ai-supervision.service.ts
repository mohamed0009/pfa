import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AIConfiguration,
  AIInteraction,
  AIGeneratedContent,
  AIKnowledgeDocument
} from '../models/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AiSupervisionService {

  private configSubject = new BehaviorSubject<AIConfiguration>({
    id: 'config1',
    language: 'Français',
    tone: 'friendly',
    detailLevel: 'moderate',
    enableQuizGeneration: true,
    enableExerciseGeneration: true,
    enableSummaryGeneration: true,
    enablePersonalization: true,
    maxResponseLength: 500,
    updatedBy: 'admin1',
    updatedAt: new Date()
  });

  // ... (private arrays for mock data can stay for now as other methods use them)
  private interactions: AIInteraction[] = []; // Cleared mock data

  private generatedContent: AIGeneratedContent[] = [
    {
      id: 'gen1',
      type: 'quiz',
      courseId: 'c1',
      courseName: 'HTML & CSS Fondamentaux',
      content: {
        questions: [
          {
            question: 'Quelle balise HTML est utilisée pour créer un lien hypertexte?',
            options: ['<link>', '<a>', '<href>', '<url>'],
            correctAnswer: 1
          }
        ]
      },
      generatedAt: new Date('2024-12-12T09:00:00'),
      usedCount: 45,
      rating: 4.5,
      status: 'active'
    },
    {
      id: 'gen2',
      type: 'exercise',
      courseId: 'c2',
      courseName: 'JavaScript Essentiel',
      content: {
        title: 'Manipulation de tableaux',
        description: 'Exercices sur les méthodes de tableaux JavaScript',
        exercises: [
          {
            instruction: 'Utilisez la méthode map() pour doubler tous les nombres du tableau',
            starter: 'const numbers = [1, 2, 3, 4, 5];\n// Votre code ici'
          }
        ]
      },
      generatedAt: new Date('2024-12-11T14:30:00'),
      usedCount: 38,
      rating: 4.8,
      status: 'active'
    },
    {
      id: 'gen3',
      type: 'summary',
      courseId: 'c1',
      courseName: 'HTML & CSS Fondamentaux',
      content: {
        title: 'Résumé du module 1',
        summary: 'HTML5 est la dernière version du langage de balisage. Les principales nouveautés incluent...',
        keyPoints: [
          'Éléments sémantiques',
          'Nouvelles APIs',
          'Support multimédia natif'
        ]
      },
      generatedAt: new Date('2024-12-10T16:00:00'),
      usedCount: 67,
      rating: 4.2,
      status: 'active'
    }
  ];

  private knowledgeDocuments: AIKnowledgeDocument[] = [
    {
      id: 'doc1',
      title: 'Guide complet React 18',
      category: 'React',
      fileType: 'pdf',
      fileSize: 5200000,
      uploadedBy: 'admin1',
      uploadedAt: new Date('2024-11-15'),
      indexed: true,
      status: 'active'
    },
    {
      id: 'doc2',
      title: 'Documentation JavaScript ES2023',
      category: 'JavaScript',
      fileType: 'pdf',
      fileSize: 3800000,
      uploadedBy: 'admin1',
      uploadedAt: new Date('2024-11-20'),
      indexed: true,
      status: 'active'
    },
    {
      id: 'doc3',
      title: 'Bonnes pratiques CSS',
      category: 'CSS',
      fileType: 'pdf',
      fileSize: 2100000,
      uploadedBy: 'formateur1',
      uploadedAt: new Date('2024-12-01'),
      indexed: false,
      status: 'processing'
    }
  ];

  constructor(private http: HttpClient) { }

  // ==================== CONFIGURATION ====================

  getConfiguration(): Observable<AIConfiguration> {
    return this.configSubject.asObservable();
  }

  updateConfiguration(updates: Partial<AIConfiguration>): Observable<AIConfiguration> {
    const current = this.configSubject.value;
    const updated: AIConfiguration = {
      ...current,
      ...updates,
      updatedBy: 'current-admin',
      updatedAt: new Date()
    };
    this.configSubject.next(updated);
    return of(updated).pipe(delay(400));
  }

  // ==================== INTERACTIONS ====================

  getInteractions(filters?: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    flaggedOnly?: boolean;
  }): Observable<AIInteraction[]> {
    let params: any = {};
    if (filters?.flaggedOnly) {
      params.flaggedOnly = 'true';
    }

    // Call real backend endpoint
    return this.http.get<any[]>('http://localhost:8080/api/admin/ai/interactions', { params }).pipe(
      map(data => data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp), // Convert string to Date
        // Ensure other fields match interface
        sentiment: item.sentiment || 'neutral',
        flagged: item.flagged || false,
        responseTime: item.responseTime || 0
      })))
    );
  }

  getInteractionById(id: string): Observable<AIInteraction | undefined> {
    return of(this.interactions.find(i => i.id === id)).pipe(delay(200));
  }

  flagInteraction(id: string, reason: string): Observable<AIInteraction> {
    const index = this.interactions.findIndex(i => i.id === id);
    if (index !== -1) {
      this.interactions[index] = {
        ...this.interactions[index],
        flagged: true,
        flagReason: reason
      };
      return of(this.interactions[index]).pipe(delay(300));
    }
    throw new Error('Interaction not found');
  }

  unflagInteraction(id: string): Observable<AIInteraction> {
    const index = this.interactions.findIndex(i => i.id === id);
    if (index !== -1) {
      this.interactions[index] = {
        ...this.interactions[index],
        flagged: false,
        flagReason: undefined
      };
      return of(this.interactions[index]).pipe(delay(300));
    }
    throw new Error('Interaction not found');
  }

  // ==================== GENERATED CONTENT ====================

  getGeneratedContent(type?: 'quiz' | 'exercise' | 'summary'): Observable<AIGeneratedContent[]> {
    let filtered = this.generatedContent;
    if (type) {
      filtered = filtered.filter(c => c.type === type);
    }
    return of(filtered).pipe(delay(300));
  }

  getGeneratedContentById(id: string): Observable<AIGeneratedContent | undefined> {
    return of(this.generatedContent.find(c => c.id === id)).pipe(delay(200));
  }

  archiveGeneratedContent(id: string): Observable<boolean> {
    const index = this.generatedContent.findIndex(c => c.id === id);
    if (index !== -1) {
      this.generatedContent[index].status = 'archived';
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  rateGeneratedContent(id: string, rating: number): Observable<AIGeneratedContent> {
    const index = this.generatedContent.findIndex(c => c.id === id);
    if (index !== -1) {
      this.generatedContent[index].rating = rating;
      return of(this.generatedContent[index]).pipe(delay(250));
    }
    throw new Error('Content not found');
  }

  // ==================== KNOWLEDGE BASE ====================

  getKnowledgeDocuments(): Observable<AIKnowledgeDocument[]> {
    return of(this.knowledgeDocuments).pipe(delay(300));
  }

  uploadKnowledgeDocument(document: Partial<AIKnowledgeDocument>): Observable<AIKnowledgeDocument> {
    const newDoc: AIKnowledgeDocument = {
      id: 'doc' + (this.knowledgeDocuments.length + 1),
      title: document.title || '',
      category: document.category || '',
      fileType: document.fileType || 'pdf',
      fileSize: document.fileSize || 0,
      uploadedBy: 'current-admin',
      uploadedAt: new Date(),
      indexed: false,
      status: 'processing'
    };

    this.knowledgeDocuments.push(newDoc);

    // Simulate indexing
    setTimeout(() => {
      const index = this.knowledgeDocuments.findIndex(d => d.id === newDoc.id);
      if (index !== -1) {
        this.knowledgeDocuments[index].indexed = true;
        this.knowledgeDocuments[index].status = 'active';
      }
    }, 5000);

    return of(newDoc).pipe(delay(400));
  }

  deleteKnowledgeDocument(id: string): Observable<boolean> {
    const index = this.knowledgeDocuments.findIndex(d => d.id === id);
    if (index !== -1) {
      this.knowledgeDocuments.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  // ==================== STATISTICS ====================

  getAIStatistics(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/admin/ai/stats').pipe(
      map(stats => ({
        ...stats,
        // Ensure defaults if backend returns nulls due to early dev stage
        sentimentBreakdown: stats.sentimentBreakdown || { positive: 0, neutral: 0, negative: 0 },
        generatedContentCount: stats.generatedContentCount || { quiz: 0, exercise: 0, summary: 0 }
      }))
    );
  }
}




