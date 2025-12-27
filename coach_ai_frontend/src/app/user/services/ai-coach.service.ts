import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CoachRecommendation, HybridResponse, PredictionRequest } from '../models/ai-coach.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AiCoachService {
  private aiApiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  /**
   * Get AI response directly from FastAPI /coach/hybrid endpoint
   * This provides the full AI response with difficulty prediction and confidence
   */
  getAiResponse(question: string, context?: string): Observable<CoachRecommendation> {
    const request: PredictionRequest = {
      question: question,
      answer: context || '',
      source: 'web_app',
      difficulty_hint: 'unknown',
      rating: 4.5,
      views: 100,
      votes: 0,
    };

    return this.http.post<HybridResponse>(`${this.aiApiUrl}/coach/hybrid`, request).pipe(
      map((response: HybridResponse) => ({
        response: response.response || '',
        predictedDifficulty: response.predicted_difficulty || 'unknown',
        confidence: response.confidence || 0,
        source: response.source || 'hybrid_ai_coach',
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('Error calling AI service:', error);
        return throwError(() => new Error(
          error.error?.detail || error.message || 'Erreur de communication avec le service IA'
        ));
      })
    );
  }

  /**
   * Get only difficulty prediction without full response
   */
  predictDifficulty(question: string, context?: string): Observable<CoachRecommendation> {
    const request: PredictionRequest = {
      question: question,
      answer: context || '',
      source: 'web_app',
      difficulty_hint: 'unknown',
    };

    return this.http.post<CoachRecommendation>(`${this.aiApiUrl}/coach/predict`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error predicting difficulty:', error);
        return throwError(() => new Error(
          error.error?.detail || error.message || 'Erreur lors de la prédiction de difficulté'
        ));
      })
    );
  }

  /**
   * Check if AI service is available
   */
  checkHealth(): Observable<{ status: string; model: string; features: number }> {
    return this.http.get<{ status: string; model: string; features: number }>(
      `${this.aiApiUrl}/health`
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('AI service health check failed:', error);
        return throwError(() => new Error('Service IA non disponible'));
      })
    );
  }
}

