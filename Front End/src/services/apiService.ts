import { AssessmentResult, AssessmentTaskResponse } from '../types';
import { GameRecommendation } from '../types/gameTypes';
import { supabase } from './supabaseClient';

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
  database?: {
    provider: string;
    status: string;
  };
}

export interface BackendRecommendationResult {
  success: boolean;
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
  /**
   * Helper to retrieve active Supabase JWT access token.
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    try {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }
    } catch {}
    return headers;
  }

  /**
   * Health check to test Backend, Database, and Axiom AI connectivity.
   */
  async checkHealth(): Promise<BackendHealthStatus | null> {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        return (await res.json()) as BackendHealthStatus;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Submits raw assessment responses to the Backend / Axiom AI baseline engine.
   * Returns the authoritative AI baseline without silent fake fallback.
   */
  async submitInitialAssessment(
    patientId: string,
    taskResponses: AssessmentTaskResponse[]
  ): Promise<AssessmentResult> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${BACKEND_BASE_URL}/assessment/initial`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId: patientId || 'P001',
        taskResponses,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error || `Axiom AI Assessment service returned status ${response.status}`
      );
    }

    const data = await response.json();
    if (data.success && data.result) {
      console.log('[ApiService] Authoritative Axiom AI baseline received:', data.result);
      return data.result as AssessmentResult;
    }

    throw new Error(data.error || 'Failed to receive authoritative AI baseline.');
  }

  /**
   * Fetches personalized AI recommendation for a patient.
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

      const headers = await this.getAuthHeaders();
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers,
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
   * Records completed game session into Supabase.
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
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${BACKEND_BASE_URL}/sessions/record`, {
        method: 'POST',
        headers,
        body: JSON.stringify(sessionData),
      });
      return res.ok;
    } catch (err: any) {
      console.warn('[ApiService] Could not sync session to backend:', err.message);
      return false;
    }
  }

  /**
   * Queries the assistant in the context of the authenticated patient.
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
    medicine?: any;
  } | null> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${BACKEND_BASE_URL}/assistant/query`, {
        method: 'POST',
        headers,
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

  /**
   * Retrieves persistent Assistant chat history from Supabase.
   */
  async getAssistantHistory(patientId: string = 'P001') {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${BACKEND_BASE_URL}/assistant/history/${patientId}`, {
        method: 'GET',
        headers,
      });
      if (res.ok) {
        return await res.json();
      }
      return { success: false, messages: [] };
    } catch {
      return { success: false, messages: [] };
    }
  }

  /**
   * Links a patient to caregiver via secure invite code.
   */
  async linkCaregiverPatient(inviteCode: string, relationship?: string) {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${BACKEND_BASE_URL}/caregiver/link-patient`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inviteCode, relationship }),
    });
    return await res.json();
  }

  /**
   * Gets linked patients for caregiver.
   */
  async getCaregiverPatients() {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${BACKEND_BASE_URL}/caregiver/patients`, {
      method: 'GET',
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      return data.patients || [];
    }
    return [];
  }
}

export const apiService = new ApiService();
