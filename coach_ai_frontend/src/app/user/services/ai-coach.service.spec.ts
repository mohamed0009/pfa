import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AiCoachService } from './ai-coach.service';
import { CoachRecommendation } from '../models/ai-coach.interfaces';

describe('AiCoachService', () => {
  let service: AiCoachService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AiCoachService]
    });

    service = TestBed.inject(AiCoachService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAiResponse', () => {
    it('should get AI response successfully', (done) => {
      const mockResponse = {
        response: 'This is a test response',
        predicted_difficulty: 'medium',
        confidence: 0.85,
        source: 'hybrid_ai_coach'
      };

      service.getAiResponse('What is React?', 'Some context').subscribe({
        next: (recommendation: CoachRecommendation) => {
          expect(recommendation).toBeTruthy();
          expect(recommendation.response).toBe('This is a test response');
          expect(recommendation.predictedDifficulty).toBe('medium');
          expect(recommendation.confidence).toBe(0.85);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8000/coach/hybrid');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.question).toBe('What is React?');
      expect(req.request.body.answer).toBe('Some context');
      req.flush(mockResponse);
    });

    it('should handle error gracefully', (done) => {
      service.getAiResponse('Test question').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8000/coach/hybrid');
      req.flush(
        { detail: 'Service unavailable' },
        { status: 503, statusText: 'Service Unavailable' }
      );
    });
  });

  describe('predictDifficulty', () => {
    it('should predict difficulty successfully', (done) => {
      const mockResponse: CoachRecommendation = {
        response: '',
        predictedDifficulty: 'hard',
        confidence: 0.9,
        source: 'hybrid_ai_coach'
      };

      service.predictDifficulty('Complex question', 'Some context').subscribe({
        next: (recommendation: CoachRecommendation) => {
          expect(recommendation).toBeTruthy();
          expect(recommendation.predictedDifficulty).toBe('hard');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8000/coach/predict');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle error when predicting difficulty', (done) => {
      service.predictDifficulty('Test').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8000/coach/predict');
      req.flush(
        { detail: 'Prediction failed' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('checkHealth', () => {
    it('should check AI service health successfully', (done) => {
      const mockHealth = {
        status: 'healthy',
        model: 'gpt-4',
        features: 10
      };

      service.checkHealth().subscribe({
        next: (health) => {
          expect(health).toBeTruthy();
          expect(health.status).toBe('healthy');
          expect(health.model).toBe('gpt-4');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8000/health');
      expect(req.request.method).toBe('GET');
      req.flush(mockHealth);
    });

    it('should handle health check error', (done) => {
      service.checkHealth().subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('Service IA non disponible');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8000/health');
      req.flush(
        { message: 'Service down' },
        { status: 503, statusText: 'Service Unavailable' }
      );
    });
  });
});

