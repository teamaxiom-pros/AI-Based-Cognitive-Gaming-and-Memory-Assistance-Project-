import { dbService } from '../services/supabaseBackend';
import { mapFrontendGameToAiActivity } from './gameAdapter';

export interface AiCompatibleSession {
  session_number: number;
  patient_id: string;
  domain: string;
  activity: string;
  difficulty: number;
  accuracy: number;
  response_time: number;
  attempts: number;
  hints_used: number;
  completion: number;
}

/**
 * Converts Supabase game session records into historical feature records compatible with Axiom AI.
 */
export function convertSupabaseSessionsToAi(
  sessions: any[],
  patientId: string
): AiCompatibleSession[] {
  if (!sessions || sessions.length === 0) return [];

  // Sort ascending by completion time for sequential analysis
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.completed_at || a.created_at).getTime() - new Date(b.completed_at || b.created_at).getTime()
  );

  return sorted.map((s, idx) => {
    const { activity, domain } = mapFrontendGameToAiActivity(s.game_id, s.domain);
    const accuracy = typeof s.accuracy === 'number' ? s.accuracy / (s.accuracy > 1 ? 100 : 1) : 0.8;
    const duration = typeof s.duration_seconds === 'number' ? s.duration_seconds : 10;
    const hints = typeof s.hints_used === 'number' ? s.hints_used : 0;

    return {
      session_number: idx + 1,
      patient_id: patientId,
      domain: domain || s.domain || 'memory',
      activity,
      difficulty: s.difficulty_tier || s.level || 1,
      accuracy,
      response_time: Math.max(1, duration / 10),
      attempts: 1,
      hints_used: hints,
      completion: accuracy >= 0.5 ? 1 : 0,
    };
  });
}

/**
 * Resolves the patient's performance snapshot and focus domain for Axiom AI.
 */
export async function resolvePatientAiContext(patientId: string) {
  const [patient, baseline, sessions] = await Promise.all([
    dbService.getPatientProfile(patientId),
    dbService.getLatestCognitiveBaseline(patientId),
    dbService.getGameSessions(patientId),
  ]);

  const aiSessions = convertSupabaseSessionsToAi(sessions, patientId);

  return {
    patient,
    baseline,
    gameSessions: sessions,
    aiSessions,
    hasSessions: aiSessions.length > 0,
  };
}
