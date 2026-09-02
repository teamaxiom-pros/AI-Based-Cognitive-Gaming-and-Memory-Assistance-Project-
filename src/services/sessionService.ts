import fs from 'fs';
import path from 'path';
import { AssessmentResultOutput } from '../adapters/assessmentAdapter';

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
  latestAssessment?: AssessmentResultOutput;
}

// In-memory persistent stores for fast SIH prototype responsiveness
const patientStore: Map<string, PatientProfileRecord> = new Map();
const assessmentStore: Map<string, AssessmentResultOutput[]> = new Map();
const gameSessionStore: Map<string, RecordedGameSession[]> = new Map();

// Initialize default demo patient Asha Sharma (P001)
const defaultPatient: PatientProfileRecord = {
  id: 'P001',
  name: 'Asha Sharma',
  age: 68,
  gender: 'Female',
  location: 'Guwahati, Assam (NER)',
  language: 'en',
  cognitiveBaseline: 'Mild Cognitive Support',
  focusDomain: 'memory',
};
patientStore.set('P001', defaultPatient);
patientStore.set('patient-asha-001', { ...defaultPatient, id: 'patient-asha-001' });

import { mapFrontendGameToAiActivity } from '../adapters/gameAdapter';

// Resolve path to AI dataset
const CSV_FILE_PATH = fs.existsSync(path.resolve(process.cwd(), 'AI/data/patient_sessions.csv'))
  ? path.resolve(process.cwd(), 'AI/data/patient_sessions.csv')
  : path.resolve(__dirname, '../../AI/data/patient_sessions.csv');

/**
 * Gets or creates a patient profile.
 */
export function getOrCreatePatient(patientId: string, name?: string): PatientProfileRecord {
  const existing = patientStore.get(patientId);
  if (existing) return existing;

  const newPatient: PatientProfileRecord = {
    id: patientId,
    name: name || `Patient ${patientId}`,
    age: 68,
    gender: 'Prefer not to say',
    location: 'Guwahati, Assam (NER)',
    language: 'en',
  };
  patientStore.set(patientId, newPatient);
  return newPatient;
}

/**
 * Saves a completed assessment result for a patient.
 */
export function saveAssessmentResult(result: AssessmentResultOutput): void {
  const patient = getOrCreatePatient(result.patientId);
  patient.focusDomain = result.focusDomain;
  patient.cognitiveBaseline = `Axiom Score: ${result.overallScore}% (${result.focusDomain})`;
  patient.latestAssessment = result;

  const list = assessmentStore.get(result.patientId) || [];
  list.unshift(result);
  assessmentStore.set(result.patientId, list);
}

/**
 * Retrieves assessment history for a patient.
 */
export function getAssessmentHistory(patientId: string): AssessmentResultOutput[] {
  return assessmentStore.get(patientId) || [];
}

/**
 * Records a game session in memory and appends to AI/data/patient_sessions.csv.
 */
export function recordCompletedGameSession(session: RecordedGameSession): void {
  const list = gameSessionStore.get(session.patientId) || [];
  list.unshift(session);
  gameSessionStore.set(session.patientId, list);

  // Map to AI activity and domain
  const { activity: aiActivity, domain: aiDomain } = mapFrontendGameToAiActivity(
    session.gameId,
    session.domain
  );

  // Attempt to append session to AI patient_sessions.csv for continuous ML learning
  try {
    if (fs.existsSync(CSV_FILE_PATH)) {
      const accuracyNormalized = Math.max(0, Math.min(1, session.accuracy / 100));
      const responseTimeSec = Math.max(1, session.durationSeconds);
      const sessionNumber = list.length + 2; // Progressive session index

      const csvLine = [
        session.patientId,
        session.sessionId.slice(0, 8),
        sessionNumber,
        aiDomain,
        aiActivity,
        session.difficultyTier || 1,
        accuracyNormalized.toFixed(3),
        responseTimeSec.toFixed(2),
        1,
        session.hintsUsed || 0,
        1,
        'happy',
        accuracyNormalized.toFixed(3),
        responseTimeSec.toFixed(2),
        accuracyNormalized.toFixed(3),
        responseTimeSec.toFixed(2),
        '0.0',
        session.difficultyTier || 1,
        new Date().toISOString(),
      ].join(',');

      fs.appendFileSync(CSV_FILE_PATH, `\n${csvLine}`, 'utf8');
      console.log(`[SessionService] Appended session for ${session.patientId} (${aiActivity} in ${aiDomain}) to ${CSV_FILE_PATH}`);
    }
  } catch (err: any) {
    console.warn('[SessionService] Could not append to CSV:', err.message);
  }
}

/**
 * Gets recent game session logs for a patient.
 */
export function getGameSessionHistory(patientId: string): RecordedGameSession[] {
  return gameSessionStore.get(patientId) || [];
}
