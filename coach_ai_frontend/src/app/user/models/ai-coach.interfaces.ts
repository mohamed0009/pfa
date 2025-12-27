// ========================================
// AI Coach Interfaces
// ========================================

export interface CoachRecommendation {
  response: string;
  predictedDifficulty: string;
  confidence: number;
  probabilities?: number[];
  labels?: string[];
  source: string;
}

export interface PredictionRequest {
  question: string;
  answer?: string;
  subject?: string;
  topic?: string;
  source?: string;
  difficulty_hint?: string;
  rating?: number;
  views?: number;
  votes?: number;
  answers_count?: number;
  reputation?: number;
  year?: number;
  enrollment?: number;
}

export interface PredictionResponse {
  predicted_difficulty: string;
  confidence: number;
  probabilities: number[];
  labels: string[];
}

export interface HybridResponse {
  response: string;
  predicted_difficulty: string;
  confidence: number;
  source: string;
}

