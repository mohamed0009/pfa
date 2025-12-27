import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AiSupervisionService } from './ai-supervision.service';
import { AIConfiguration, AIInteraction, AIGeneratedContent, AIKnowledgeDocument } from '../models/admin.interfaces';

describe('AiSupervisionService', () => {
  let service: AiSupervisionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AiSupervisionService]
    });

    service = TestBed.inject(AiSupervisionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getConfiguration', () => {
    it('should fetch configuration successfully', (done) => {
      const mockConfig = {
        language: 'English',
        tone: 'professional',
        detailLevel: 'high',
        enableQuizGeneration: true,
        enableExerciseGeneration: true,
        enableSummaryGeneration: true,
        enablePersonalization: true,
        maxResponseLength: 1000
      };

      service.getConfiguration().subscribe({
        next: (config: AIConfiguration) => {
          expect(config).toBeTruthy();
          expect(config.language).toBe('English');
          expect(config.tone).toBe('professional');
          expect(config.maxResponseLength).toBe(1000);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/ai/config');
      expect(req.request.method).toBe('GET');
      req.flush(mockConfig);
    });

    it('should handle error and return default configuration', (done) => {
      service.getConfiguration().subscribe({
        next: (config: AIConfiguration) => {
          expect(config).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/ai/config');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('updateConfiguration', () => {
    it('should update configuration successfully', (done) => {
      const updates: Partial<AIConfiguration> = {
        language: 'English',
        maxResponseLength: 800
      };

      const mockResponse = {
        language: 'English',
        tone: 'friendly',
        detailLevel: 'moderate',
        enableQuizGeneration: true,
        enableExerciseGeneration: true,
        enableSummaryGeneration: true,
        enablePersonalization: true,
        maxResponseLength: 800
      };

      service.updateConfiguration(updates).subscribe({
        next: (config: AIConfiguration) => {
          expect(config).toBeTruthy();
          expect(config.language).toBe('English');
          expect(config.maxResponseLength).toBe(800);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/ai/config');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse);
    });

    it('should handle error and return updated local config', (done) => {
      const updates: Partial<AIConfiguration> = {
        language: 'English'
      };

      service.updateConfiguration(updates).subscribe({
        next: (config: AIConfiguration) => {
          expect(config).toBeTruthy();
          expect(config.language).toBe('English');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/ai/config');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getInteractions', () => {
    it('should fetch interactions successfully', (done) => {
      const mockInteractions = [
        {
          id: 'int1',
          userId: 'u1',
          userName: 'Test User',
          userRole: 'USER',
          timestamp: '2024-12-25T10:00:00Z',
          question: 'Test question?',
          response: 'Test response',
          category: 'General',
          sentiment: 'positive',
          flagged: false,
          responseTime: 200
        }
      ];

      service.getInteractions().subscribe({
        next: (interactions: AIInteraction[]) => {
          expect(interactions).toBeTruthy();
          expect(interactions.length).toBeGreaterThanOrEqual(0);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/ai/interactions');
      expect(req.request.method).toBe('GET');
      req.flush(mockInteractions);
    });

    it('should fetch flagged interactions only', (done) => {
      service.getInteractions({ flaggedOnly: true }).subscribe({
        next: (interactions: AIInteraction[]) => {
          expect(interactions).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/ai/interactions?flaggedOnly=true');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle error and return empty array', (done) => {
      service.getInteractions().subscribe({
        next: (interactions: AIInteraction[]) => {
          expect(interactions).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/ai/interactions');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getInteractionById', () => {
    it('should return interaction by id', (done) => {
      service.getInteractionById('int1').subscribe({
        next: (interaction) => {
          expect(interaction).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('flagInteraction', () => {
    it('should flag an interaction', (done) => {
      service.flagInteraction('int1', 'Inappropriate content').subscribe({
        next: (interaction: AIInteraction) => {
          expect(interaction).toBeTruthy();
          expect(interaction.flagged).toBeTrue();
          expect(interaction.flagReason).toBe('Inappropriate content');
          done();
        }
      });
    });
  });

  describe('unflagInteraction', () => {
    it('should unflag an interaction', (done) => {
      service.unflagInteraction('int1').subscribe({
        next: (interaction: AIInteraction) => {
          expect(interaction).toBeTruthy();
          expect(interaction.flagged).toBeFalse();
          done();
        }
      });
    });
  });

  describe('getGeneratedContent', () => {
    it('should fetch all generated content', (done) => {
      service.getGeneratedContent().subscribe({
        next: (content: AIGeneratedContent[]) => {
          expect(content).toBeTruthy();
          expect(Array.isArray(content)).toBeTrue();
          done();
        }
      });
    });

    it('should fetch content by type', (done) => {
      service.getGeneratedContent('quiz').subscribe({
        next: (content: AIGeneratedContent[]) => {
          expect(content).toBeTruthy();
          content.forEach(c => expect(c.type).toBe('quiz'));
          done();
        }
      });
    });
  });

  describe('getGeneratedContentById', () => {
    it('should return content by id', (done) => {
      service.getGeneratedContentById('gen1').subscribe({
        next: (content) => {
          expect(content).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('archiveGeneratedContent', () => {
    it('should archive content successfully', (done) => {
      service.archiveGeneratedContent('gen1').subscribe({
        next: (result: boolean) => {
          expect(result).toBeTrue();
          done();
        }
      });
    });
  });

  describe('rateGeneratedContent', () => {
    it('should rate content successfully', (done) => {
      service.rateGeneratedContent('gen1', 5).subscribe({
        next: (content: AIGeneratedContent) => {
          expect(content).toBeTruthy();
          expect(content.rating).toBe(5);
          done();
        }
      });
    });
  });

  describe('getKnowledgeDocuments', () => {
    it('should return all documents', (done) => {
      service.getKnowledgeDocuments().subscribe({
        next: (documents: AIKnowledgeDocument[]) => {
          expect(documents).toBeTruthy();
          expect(Array.isArray(documents)).toBeTrue();
          done();
        }
      });
    });
  });

  describe('uploadKnowledgeDocument', () => {
    it('should upload a document successfully', (done) => {
      const document: Partial<AIKnowledgeDocument> = {
        title: 'Test Document',
        category: 'Test',
        fileType: 'pdf',
        fileSize: 1000000
      };

      service.uploadKnowledgeDocument(document).subscribe({
        next: (doc: AIKnowledgeDocument) => {
          expect(doc).toBeTruthy();
          expect(doc.title).toBe('Test Document');
          expect(doc.status).toBe('processing');
          done();
        }
      });
    });
  });

  describe('deleteKnowledgeDocument', () => {
    it('should delete document successfully', (done) => {
      service.deleteKnowledgeDocument('doc1').subscribe({
        next: (result: boolean) => {
          expect(result).toBeTrue();
          done();
        }
      });
    });

    it('should return false if document not found', (done) => {
      service.deleteKnowledgeDocument('nonexistent').subscribe({
        next: (result: boolean) => {
          expect(result).toBeFalse();
          done();
        }
      });
    });
  });

  describe('getAIStatistics', () => {
    it('should fetch statistics successfully', (done) => {
      const mockStats = {
        totalInteractions: 100,
        averageResponseTime: 250,
        flaggedInteractions: 5,
        sentimentBreakdown: { positive: 60, neutral: 30, negative: 10 },
        generatedContentCount: { quiz: 20, exercise: 15, summary: 10 },
        averageContentRating: 4.5,
        knowledgeBaseSize: 50,
        indexedDocuments: 45
      };

      service.getAIStatistics().subscribe({
        next: (stats) => {
          expect(stats).toBeTruthy();
          expect(stats.totalInteractions).toBe(100);
          expect(stats.averageResponseTime).toBe(250);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/ai/stats');
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });

    it('should handle error and return default stats', (done) => {
      service.getAIStatistics().subscribe({
        next: (stats) => {
          expect(stats).toBeTruthy();
          expect(stats.totalInteractions).toBe(0);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8081/api/admin/ai/stats');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });
});
