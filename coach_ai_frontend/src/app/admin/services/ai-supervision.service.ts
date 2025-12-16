import { Injectable } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
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

  private interactions: AIInteraction[] = [
    {
      id: 'int1',
      userId: 'u1',
      userName: 'Sophie Martin',
      userRole: 'Apprenant',
      timestamp: new Date('2024-12-13T10:30:00'),
      question: 'Comment fonctionne le React useEffect hook?',
      response: 'Le hook useEffect permet d\'exécuter des effets de bord dans les composants React fonctionnels. Il s\'exécute après chaque rendu par défaut, et vous pouvez contrôler quand il s\'exécute en utilisant un tableau de dépendances...',
      category: 'React',
      sentiment: 'positive',
      flagged: false,
      responseTime: 245
    },
    {
      id: 'int2',
      userId: 'u2',
      userName: 'Marc Dubois',
      userRole: 'Apprenant',
      timestamp: new Date('2024-12-13T11:15:00'),
      question: 'Quelle est la différence entre var, let et const en JavaScript?',
      response: 'En JavaScript, var est l\'ancien moyen de déclarer des variables avec une portée de fonction. let et const ont été introduits en ES6 avec une portée de bloc. const est utilisé pour les valeurs qui ne changeront pas...',
      category: 'JavaScript',
      sentiment: 'neutral',
      flagged: false,
      responseTime: 198
    },
    {
      id: 'int3',
      userId: 'u3',
      userName: 'Amina Khalil',
      userRole: 'Formateur',
      timestamp: new Date('2024-12-13T14:20:00'),
      question: 'Comment générer un quiz adaptatif pour mes étudiants?',
      response: 'Je peux générer un quiz adaptatif en fonction du niveau de vos étudiants. Indiquez-moi le sujet, le niveau de difficulté souhaité et le nombre de questions...',
      category: 'Pédagogie',
      sentiment: 'positive',
      flagged: false,
      responseTime: 312
    }
  ];

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

  constructor() {}

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
    let filtered = [...this.interactions];

    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter(i => i.userId === filters.userId);
      }
      if (filters.startDate) {
        filtered = filtered.filter(i => i.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(i => i.timestamp <= filters.endDate!);
      }
      if (filters.flaggedOnly) {
        filtered = filtered.filter(i => i.flagged);
      }
    }

    return of(filtered).pipe(delay(300));
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
    return of({
      totalInteractions: this.interactions.length,
      averageResponseTime: Math.round(
        this.interactions.reduce((sum, i) => sum + i.responseTime, 0) / this.interactions.length
      ),
      flaggedInteractions: this.interactions.filter(i => i.flagged).length,
      sentimentBreakdown: {
        positive: this.interactions.filter(i => i.sentiment === 'positive').length,
        neutral: this.interactions.filter(i => i.sentiment === 'neutral').length,
        negative: this.interactions.filter(i => i.sentiment === 'negative').length
      },
      generatedContentCount: {
        quiz: this.generatedContent.filter(c => c.type === 'quiz').length,
        exercise: this.generatedContent.filter(c => c.type === 'exercise').length,
        summary: this.generatedContent.filter(c => c.type === 'summary').length
      },
      averageContentRating: this.generatedContent
        .filter(c => c.rating)
        .reduce((sum, c) => sum + (c.rating || 0), 0) / 
        this.generatedContent.filter(c => c.rating).length,
      knowledgeBaseSize: this.knowledgeDocuments.length,
      indexedDocuments: this.knowledgeDocuments.filter(d => d.indexed).length
    }).pipe(delay(300));
  }
}




