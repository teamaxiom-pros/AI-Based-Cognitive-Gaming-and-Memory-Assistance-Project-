import dotenv from 'dotenv';
dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_TIMEOUT_MS = parseInt(process.env.AI_SERVICE_TIMEOUT_MS || '15000', 10);

export interface AiProcessRequest {
  action: 'initial_assessment' | 'recommend';
  assessment_results?: Array<{
    task_id: string;
    domain: string;
    accuracy: number;
    response_time: number;
    attempts: number;
    hints_used?: number;
    hints?: number;
  }>;
  patient_id?: string;
  preferred_activity?: string | null;
}

export interface AiBaselineResponse {
  success: boolean;
  action: 'initial_assessment';
  baseline: Record<
    string,
    {
      score: number;
      level: string;
      tasks_completed: number;
      task_scores: number[];
    }
  >;
  focus_domain: string;
  error?: string;
}

export interface AiRecommendationResponse {
  success: boolean;
  patient_id: string;
  action: 'recommend';
  focus_domain: string;
  recommended_activity: string;
  recommended_difficulty: number;
  performance: {
    accuracy_percent: number;
    trend_percent: number;
    status: string;
    trend_label: string;
    current_difficulty: number;
    message: string;
  };
  error?: string;
}

/**
 * Checks if the Axiom AI service is reachable.
 */
export async function checkAiHealth(): Promise<{
  online: boolean;
  message: string;
  url: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${AI_SERVICE_URL}/`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as any;
      return {
        online: true,
        message: data.message || 'Axiom AI Service is online',
        url: AI_SERVICE_URL,
      };
    }
    return {
      online: false,
      message: `AI service returned HTTP ${response.status}`,
      url: AI_SERVICE_URL,
    };
  } catch (err: any) {
    return {
      online: false,
      message: `AI service unavailable at ${AI_SERVICE_URL}: ${err.message || 'connection failed'}`,
      url: AI_SERVICE_URL,
    };
  }
}

/**
 * Sends a structured request to the Axiom AI process endpoint.
 */
export async function sendAiRequest<T = any>(
  payload: AiProcessRequest
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/ai/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Axiom AI service error (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data = (await response.json()) as T;
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Axiom AI service timed out after ${AI_TIMEOUT_MS}ms`);
    }
    throw err;
  }
}

/**
 * Calls the Axiom AI initial assessment engine to build a baseline.
 */
export async function getAiInitialAssessment(
  results: AiProcessRequest['assessment_results']
): Promise<AiBaselineResponse> {
  return sendAiRequest<AiBaselineResponse>({
    action: 'initial_assessment',
    assessment_results: results,
  });
}

/**
 * Calls the Axiom AI recommendation engine for an existing patient.
 */
export async function getAiRecommendation(
  patientId: string,
  preferredActivity?: string | null
): Promise<AiRecommendationResponse> {
  return sendAiRequest<AiRecommendationResponse>({
    action: 'recommend',
    patient_id: patientId,
    preferred_activity: preferredActivity || undefined,
  });
}
