import fs from 'fs';
import path from 'path';
import { AssessmentResultOutput } from '../adapters/assessmentAdapter';
import { dbService } from './supabaseBackend';
import { mapFrontendGameToAiActivity } from '../adapters/gameAdapter';

export interface RecordedGameSession {
  sessionId: string;
  patientId: string;
  gameId: string;
  gameTitle: string;
  domain: string;
  level: number;
  difficultyTier: number;
  score: number;
  accuracy: number;
  durationSeconds: number;
  hintsUsed: number;
  completedAt: string;
}

export interface PatientProfileRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  language: string;
  cognitiveBaseline?: string;
  focusDomain?: string;
  inviteCode?: string;
  latestAssessment?: AssessmentResultOutput;
}

// Path to local AI dataset
const CSV_FILE_PATH = fs.existsSync(path.resolve(process.cwd(), 'AI/data/patient_sessions.csv'))
  ? path.resolve(process.cwd(), 'AI/data/patient_sessions.csv')
  : path.resolve(__dirname, '../../AI/data/patient_sessions.csv');

/**
 * Gets or creates a patient profile in Supabase.
 */
export async function getOrCreatePatient(
  patientId: string,
  name?: string
): Promise<PatientProfileRecord> {
  const existing = await dbService.getPatientProfile(patientId);
  if (existing) {
    return {
      id: existing.user_id || existing.id,
      name: existing.name,
      age: existing.age,
      gender: existing.gender,
      location: existing.location,
      language: existing.preferred_language,
      cognitiveBaseline: existing.cognitive_baseline,
      focusDomain: existing.focus_domain,
      inviteCode: existing.invite_code,
    };
  }

  const newPatient = await dbService.upsertPatientProfile({
    userId: patientId,
    name: name || `Patient ${patientId.slice(0, 6)}`,
    age: 68,
    gender: 'Prefer not to say',
    location: 'Guwahati, Assam (NER)',
    language: 'en',
  });

  return {
    id: newPatient?.user_id || newPatient?.id || patientId,
    name: newPatient?.name || name || 'Asha Devi',
    age: newPatient?.age || 68,
    gender: newPatient?.gender || 'Female',
    location: newPatient?.location || 'Guwahati, Assam (NER)',
    language: newPatient?.preferred_language || 'en',
    cognitiveBaseline: newPatient?.cognitive_baseline || 'Mild Cognitive Support',
    focusDomain: newPatient?.focus_domain || 'memory',
    inviteCode: newPatient?.invite_code || 'AX-ASH-4821',
  };
}

/**
 * Saves a completed assessment result for a patient into Supabase.
 */
export async function saveAssessmentResult(result: AssessmentResultOutput): Promise<void> {
  // 1. Update patient profile
  await dbService.upsertPatientProfile({
    userId: result.patientId,
    name: result.patientId === 'P001' ? 'Asha Devi' : undefined,
    focusDomain: result.focusDomain,
    cognitiveBaseline: `Axiom Score: ${result.overallScore}% (${result.focusDomain})`,
  });

  // 2. Persist to Supabase assessment_sessions, assessment_responses, and cognitive_baselines
  await dbService.saveAssessmentSession(
    {
      sessionId: result.sessionId,
      patientId: result.patientId,
      overallScore: result.overallScore,
      focusDomain: result.focusDomain,
      aiSummary: result.aiSummary,
      clinicalNotes: result.clinicalNotes,
      recommendedActivities: result.recommendedActivities,
      completedAt: result.completedAt,
    },
    result.taskResponses || [],
    {
      domainScores: result.domainScores,
      rawAiBaseline: result.rawAiBaseline,
    }
  );
}

/**
 * Retrieves assessment history for a patient from Supabase.
 */
export async function getAssessmentHistory(patientId: string): Promise<any[]> {
  return dbService.getAssessmentHistory(patientId);
}

/**
 * Records a game session into Supabase and optionally syncs with AI dataset.
 */
export async function recordCompletedGameSession(session: RecordedGameSession): Promise<void> {
  // 1. Persist to Supabase game_sessions table
  await dbService.recordGameSession({
    sessionId: session.sessionId,
    patientId: session.patientId,
    gameId: session.gameId,
    gameTitle: session.gameTitle,
    domain: session.domain,
    level: session.level,
    difficultyTier: session.difficultyTier,
    score: session.score,
    accuracy: session.accuracy,
    durationSeconds: session.durationSeconds,
    hintsUsed: session.hintsUsed,
    completedAt: session.completedAt,
  });

  // 2. Append to local CSV dataset if present
  try {
    if (fs.existsSync(CSV_FILE_PATH)) {
      const { activity: aiActivity, domain: aiDomain } = mapFrontendGameToAiActivity(
        session.gameId,
        session.domain
      );
      const accuracyNormalized = Math.max(0, Math.min(1, session.accuracy / 100));
      const responseTimeSec = Math.max(1, session.durationSeconds);

      const csvLine = [
        session.patientId,
        session.sessionId.slice(0, 8),
        Math.floor(Date.now() / 1000) % 1000,
        aiDomain,
        aiActivity,
        session.difficultyTier || 1,
        accuracyNormalized.toFixed(3),
        responseTimeSec.toFixed(2),
        1,
        session.hintsUsed || 0,
        1,
        'neutral',
        accuracyNormalized.toFixed(3),
        responseTimeSec.toFixed(2),
        accuracyNormalized.toFixed(3),
        responseTimeSec.toFixed(2),
        '0.0',
        session.difficultyTier || 1,
        new Date().toISOString(),
      ].join(',');

      fs.appendFileSync(CSV_FILE_PATH, `\n${csvLine}`, 'utf8');
    }
  } catch (err: any) {
    console.warn('[SessionService] Could not append to CSV:', err.message);
  }
}

/**
 * Gets recent game session logs for a patient from Supabase.
 */
export async function getGameSessionHistory(patientId: string): Promise<any[]> {
  return dbService.getGameSessions(patientId);
}
