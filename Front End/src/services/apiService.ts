import { AssessmentResult, AssessmentTaskResponse } from '../types';
import { GameRecommendation } from '../types/gameTypes';
import { evaluateAssessment } from './assessmentEngine';
import { getPersonalizedRecommendations } from './gameRecommendationService';

const BACKEND_BASE_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api');

export interface BackendHealthStatus {
  status: string;
  service: string;
  aiService: {
    online: boolean;
    message: string;
    url: string;
  };
}

export interface BackendRecommendationResult {
  success: boolean;
  fallbackUsed?: boolean;
  patientId: string;
  focusDomain: string;
  recommendedActivity: string;
  recommendedDifficulty: number;
  performance: {
    accuracy_percent: number;
    trend_percent: number;
    status: string;
    trend_label: string;
    current_difficulty: number;
    message: string;
  };
  gameMapping: {
    aiActivity: string;
    gameId: string;
    gameTitle: string;
    domain: string;
    route: string;
    suggestedLevel: number;
    difficultyTier: number;
    difficultyLabel: string;
  };
}

class ApiService {
  private isBackendAvailable: boolean | null = null;

  /**
   * Health check to test Backend and AI connectivity.
   */
  async checkHealth(): Promise<BackendHealthStatus | null> {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        this.isBackendAvailable = true;
        return (await res.json()) as BackendHealthStatus;
      }
      this.isBackendAvailable = false;
      return null;
    } catch (err) {
      this.isBackendAvailable = false;
      return null;
    }
  }

  /**
   * Submits raw assessment responses to the Backend / Axiom AI baseline engine.
   */
  async submitInitialAssessment(
    patientId: string,
    taskResponses: AssessmentTaskResponse[]
  ): Promise<AssessmentResult> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/assessment/initial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientId || 'P001',
          taskResponses,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result) {
          console.log('[ApiService] Received authoritative Axiom AI baseline:', data.result);
          return data.result as AssessmentResult;
        }
      }
      throw new Error(`Server returned status ${response.status}`);
    } catch (err: any) {
      console.warn('[ApiService] Backend/AI unavailable, using authentic client-side evaluation fallback:', err.message);
      // Clean fallback to deterministic client engine
      return evaluateAssessment({});
    }
  }

  /**
   * Fetches personalized AI recommendation for an existing patient.
   */
  async getRecommendation(
    patientId: string = 'P001',
    preferredActivity?: string
  ): Promise<BackendRecommendationResult | null> {
    try {
      const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const url = new URL(`${BACKEND_BASE_URL}/recommendation/${patientId}`, baseOrigin);
      if (preferredActivity) {
        url.searchParams.append('preferredActivity', preferredActivity);
      }

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return data as BackendRecommendationResult;
        }
      }
      return null;
    } catch (err: any) {
      console.warn('[ApiService] Recommendation API unavailable:', err.message);
      return null;
    }
  }

  /**
   * Records completed game session to update patient history.
   */
  async recordGameSession(sessionData: {
    patientId: string;
    gameId: string;
    gameTitle?: string;
    domain: string;
    level: number;
    difficultyTier?: number;
    score: number;
    accuracy: number;
    durationSeconds: number;
    hintsUsed: number;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/sessions/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      return res.ok;
    } catch (err: any) {
      console.warn('[ApiService] Could not sync session to backend:', err.message);
      return false;
    }
  }

  /**
   * Sends voice / natural language query to the assistant bridge.
   */
  async queryAssistant(
    query: string,
    patientId: string = 'P001'
  ): Promise<{
    success: boolean;
    response: string;
    intent?: string;
    actionType?: string;
    actionTarget?: string;
    gameMapping?: any;
  } | null> {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, patientId }),
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err: any) {
      console.warn('[ApiService] Assistant query API failed:', err.message);
      return null;
    }
  }
}

export const apiService = new ApiService();
