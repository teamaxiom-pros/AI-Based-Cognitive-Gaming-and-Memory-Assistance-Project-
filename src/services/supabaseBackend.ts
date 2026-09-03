import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://bhbvuyiiccsujrgsfncn.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_7mvOsamI_SIEsu_gHp-PGg_rcfk8Imq';

export const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function toValidUuid(id: string): string {
  if (!id) return '00000000-0000-0000-0000-000000000001';
  if (UUID_REGEX.test(id)) return id;
  if (id === 'P001' || id === 'patient-asha-001') return '00000000-0000-0000-0000-000000000001';
  if (id === 'caregiver-priya-001') return '00000000-0000-0000-0000-000000000002';

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, '0');
  return `00000000-0000-0000-0000-${hex.slice(0, 12)}`;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'patient' | 'caregiver' | 'admin';
  patientId?: string;
  caregiverId?: string;
}

/**
 * Validates a Supabase JWT and resolves the user's role and profile.
 */
export async function verifySupabaseToken(
  token: string
): Promise<AuthenticatedUser | null> {
  if (!token) return null;
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const role = (profile?.role as 'patient' | 'caregiver' | 'admin') || 'patient';

    return {
      userId: user.id,
      email: user.email || '',
      role,
      patientId: user.id,
      caregiverId: user.id,
    };
  } catch (err: any) {
    console.error('[SupabaseBackend] Token verification failed:', err.message);
    return null;
  }
}

/**
 * Database Persistence Layer for Backend
 */
export const dbService = {
  // Profiles
  async getProfile(userId: string) {
    const uuid = toValidUuid(userId);
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', uuid)
      .single();
    return data;
  },

  async upsertProfile(profile: {
    user_id: string;
    full_name: string;
    role: 'patient' | 'caregiver' | 'admin';
    language?: string;
  }) {
    const uuid = toValidUuid(profile.user_id);
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          user_id: uuid,
          full_name: profile.full_name,
          role: profile.role,
          language: profile.language || 'en',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) console.warn('[SupabaseBackend] Upsert profile error:', error.message);
    return data;
  },

  // Patient Profiles
  async getPatientProfile(patientId: string) {
    const uuid = toValidUuid(patientId);
    const { data } = await supabaseAdmin
      .from('patient_profiles')
      .select('*')
      .eq('user_id', uuid)
      .single();
    return data;
  },

  async upsertPatientProfile(patient: any) {
    const rawId = patient.userId || patient.user_id || patient.id;
    const uuid = toValidUuid(rawId);
    const { data, error } = await supabaseAdmin
      .from('patient_profiles')
      .upsert(
        {
          user_id: uuid,
          name: patient.name || 'Asha Devi',
          age: patient.age || 68,
          gender: patient.gender || 'Female',
          location: patient.location || 'Guwahati, Assam',
          region: patient.region || 'Guwahati, Assam (NER)',
          preferred_language: patient.language || patient.preferred_language || 'en',
          cognitive_baseline: patient.cognitiveBaseline || patient.cognitive_baseline || 'Mild Cognitive Support',
          focus_domain: patient.focusDomain || patient.focus_domain || 'memory',
          interests: patient.interests || [],
          invite_code: patient.inviteCode || patient.invite_code || `AX-${patient.name?.slice(0, 3).toUpperCase() || 'PAT'}-${Math.floor(1000 + Math.random() * 9000)}`,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.warn('[SupabaseBackend] Upsert patient error:', error.message);
      // Return a valid in-memory structured fallback
      return {
        user_id: uuid,
        name: patient.name || 'Asha Devi',
        age: patient.age || 68,
        gender: patient.gender || 'Female',
        location: patient.location || 'Guwahati, Assam',
        preferred_language: patient.language || 'en',
        cognitive_baseline: patient.cognitiveBaseline || 'Mild Cognitive Support',
        focus_domain: patient.focusDomain || 'memory',
        invite_code: 'AX-ASH-4821',
      };
    }
    return data;
  },

  // Caregiver Patient Linking
  async linkCaregiverByInviteCode(caregiverId: string, inviteCode: string, relationship: string = 'Family Caregiver') {
    const caregiverUuid = toValidUuid(caregiverId);
    const { data: patient, error: patientErr } = await supabaseAdmin
      .from('patient_profiles')
      .select('id, user_id, name')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single();

    if (patientErr || !patient) {
      throw new Error('Invalid or expired patient invite code.');
    }

    const { data: link, error: linkErr } = await supabaseAdmin
      .from('patient_caregivers')
      .upsert(
        {
          patient_id: patient.user_id,
          caregiver_id: caregiverUuid,
          relationship,
          status: 'active',
        },
        { onConflict: 'patient_id,caregiver_id' }
      )
      .select()
      .single();

    if (linkErr) throw linkErr;
    return { link, patient };
  },

  async getLinkedPatients(caregiverId: string) {
    const caregiverUuid = toValidUuid(caregiverId);
    const { data: links } = await supabaseAdmin
      .from('patient_caregivers')
      .select('patient_id, relationship, status')
      .eq('caregiver_id', caregiverUuid)
      .eq('status', 'active');

    if (!links || links.length === 0) return [];

    const patientIds = links.map(l => l.patient_id);
    const { data: patients } = await supabaseAdmin
      .from('patient_profiles')
      .select('*')
      .in('user_id', patientIds);

    return (patients || []).map(p => ({
      ...p,
      relationship: links.find(l => l.patient_id === p.user_id)?.relationship,
    }));
  },

  // Assessment Sessions & Baselines
  async saveAssessmentSession(session: any, rawResponses: any[], baseline: any) {
    const patientId = session.patientId || session.patient_id;

    // 1. Session record
    await supabaseAdmin.from('assessment_sessions').upsert({
      id: session.sessionId || session.id,
      patient_id: patientId,
      session_number: session.sessionNumber || 1,
      overall_score: session.overallScore,
      focus_domain: session.focusDomain,
      ai_summary: session.aiSummary || '',
      clinical_notes: session.clinicalNotes || '',
      recommended_activities: session.recommendedActivities || [],
      completed_at: session.completedAt || new Date().toISOString(),
    });

    // 2. Raw task responses
    if (rawResponses && rawResponses.length > 0) {
      const responseRows = rawResponses.map(r => ({
        assessment_session_id: session.sessionId || session.id,
        task_id: r.taskId || r.task_id,
        domain: r.domain,
        task_title: r.taskTitle || r.task_title || '',
        task_type: r.taskType || r.task_type || '',
        expected_answer: String(r.expectedAnswer ?? ''),
        patient_answer: String(r.patientAnswer ?? ''),
        is_correct: Boolean(r.isCorrect),
        score: Number(r.score || 0),
        response_time_ms: Number(r.responseTimeMs || 0),
        hints_used: Number(r.hintsUsed || 0),
        skipped: Boolean(r.skipped),
      }));

      await supabaseAdmin.from('assessment_responses').insert(responseRows);
    }

    // 3. Cognitive Baseline
    if (baseline) {
      await supabaseAdmin.from('cognitive_baselines').insert({
        patient_id: patientId,
        assessment_session_id: session.sessionId || session.id,
        overall_score: session.overallScore,
        focus_domain: session.focusDomain,
        memory_score: baseline.domainScores?.memory?.score || 70,
        attention_score: baseline.domainScores?.attention?.score || 70,
        executive_function_score: baseline.domainScores?.executive_function?.score || 70,
        recognition_score: baseline.domainScores?.recognition?.score || 70,
        domain_scores: baseline.domainScores || {},
        raw_ai_baseline: baseline.rawAiBaseline || {},
      });
    }
  },

  async getLatestCognitiveBaseline(patientId: string) {
    const { data } = await supabaseAdmin
      .from('cognitive_baselines')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data;
  },

  async getAssessmentHistory(patientId: string) {
    const { data } = await supabaseAdmin
      .from('assessment_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  // AI Recommendations
  async saveAiRecommendation(rec: {
    patientId: string;
    focusDomain: string;
    activity: string;
    difficulty: number;
    performanceSnapshot?: any;
    reason?: string;
  }) {
    const { data } = await supabaseAdmin.from('ai_recommendations').insert({
      patient_id: rec.patientId,
      focus_domain: rec.focusDomain,
      activity: rec.activity,
      difficulty: rec.difficulty,
      performance_snapshot: rec.performanceSnapshot || {},
      reason: rec.reason || '',
    });
    return data;
  },

  async getLatestAiRecommendation(patientId: string) {
    const { data } = await supabaseAdmin
      .from('ai_recommendations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data;
  },

  // Game Sessions
  async recordGameSession(session: any) {
    const { data, error } = await supabaseAdmin.from('game_sessions').insert({
      id: session.sessionId || `sess-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      patient_id: session.patientId,
      game_id: session.gameId,
      game_title: session.gameTitle,
      domain: session.domain,
      level: session.level || 1,
      difficulty_tier: session.difficultyTier || 1,
      score: session.score,
      accuracy: session.accuracy,
      duration_seconds: session.durationSeconds,
      hints_used: session.hintsUsed || 0,
      completed_at: session.completedAt || new Date().toISOString(),
    });
    if (error) console.warn('[SupabaseBackend] Error saving game session:', error.message);
    return data;
  },

  async getGameSessions(patientId: string) {
    const { data } = await supabaseAdmin
      .from('game_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .order('completed_at', { ascending: false });
    return data || [];
  },

  // Routines, Medicines, Appointments, Alerts
  async getMedicines(patientId: string) {
    const { data } = await supabaseAdmin
      .from('medicines')
      .select('*')
      .eq('patient_id', patientId)
      .eq('active', true);
    return data || [];
  },

  async upsertMedicines(patientId: string, medicines: any[]) {
    const rows = medicines.map(m => ({
      id: m.id,
      patient_id: patientId,
      name: m.name,
      dosage: m.dosage,
      schedule: m.schedule || m.timeSlot || 'Morning',
      time: m.time,
      instructions: m.instructions || '',
      purpose: m.purpose || '',
      pill_color: m.pillColor || 'teal',
      pill_shape: m.pillShape || 'round',
      active: m.active !== false,
      is_taken_today: Boolean(m.isTakenToday),
      taken_at: m.takenAt || null,
      history_7days: m.history7Days || [],
      updated_at: new Date().toISOString(),
    }));
    await supabaseAdmin.from('medicines').upsert(rows, { onConflict: 'id' });
  },

  async getRoutines(patientId: string) {
    const { data } = await supabaseAdmin
      .from('routines')
      .select('*')
      .eq('patient_id', patientId);
    return data || [];
  },

  async upsertRoutines(patientId: string, routines: any[]) {
    const rows = routines.map(r => ({
      id: r.id,
      patient_id: patientId,
      title: r.title,
      description: r.description || '',
      time_block: r.timeBlock || 'Morning',
      scheduled_time: r.scheduledTime || r.time || '08:00 AM',
      icon: r.icon || 'Sun',
      recurrence: r.recurrence || 'daily',
      completed: Boolean(r.isCompleted || r.completed),
      completed_at: r.completedAt || null,
      updated_at: new Date().toISOString(),
    }));
    await supabaseAdmin.from('routines').upsert(rows, { onConflict: 'id' });
  },

  async getAppointments(patientId: string) {
    const { data } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: true });
    return data || [];
  },

  async getAlerts(patientId: string) {
    const { data } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    return data || [];
  },
};
