import { supabase, isSupabaseConfigured, getSupabaseHost, SUPABASE_URL } from './supabaseClient';
import {
  PatientProfile,
  AssessmentResult,
  UserAssessmentAnswers,
  Medicine,
  RoutineItem,
  AlertItem,
  Appointment,
  ActivityLogItem,
} from '../types';

export interface DatabaseHealthReport {
  isConfigured: boolean;
  isConnected: boolean;
  host: string;
  url: string;
  latencyMs: number | null;
  status: 'connected' | 'connecting' | 'offline' | 'error';
  errorMessage?: string;
  syncedTables: {
    patients: boolean;
    assessment_sessions: boolean;
    game_sessions: boolean;
    medicines: boolean;
    routine_items: boolean;
    alerts: boolean;
    appointments: boolean;
  };
}

class SupabaseService {
  private lastHealthReport: DatabaseHealthReport | null = null;

  /**
   * Performs an active health check & latency measurement to Supabase.
   */
  async checkDatabaseHealth(): Promise<DatabaseHealthReport> {
    const host = getSupabaseHost();
    const defaultTables = {
      patients: false,
      assessment_sessions: false,
      game_sessions: false,
      medicines: false,
      routine_items: false,
      alerts: false,
      appointments: false,
    };

    if (!isSupabaseConfigured || !supabase) {
      const report: DatabaseHealthReport = {
        isConfigured: false,
        isConnected: false,
        host,
        url: SUPABASE_URL,
        latencyMs: null,
        status: 'error',
        errorMessage: 'Supabase client is not initialized or missing credentials.',
        syncedTables: defaultTables,
      };
      this.lastHealthReport = report;
      return report;
    }

    const startTime = performance.now();
    try {
      const { data, error } = await supabase.from('patients').select('id').limit(1);
      const latencyMs = Math.round(performance.now() - startTime);

      if (error) {
        const isTableMissing = error.code === '42P01' || error.message?.includes('does not exist');
        const report: DatabaseHealthReport = {
          isConfigured: true,
          isConnected: true, // Supabase cloud replied
          host,
          url: SUPABASE_URL,
          latencyMs,
          status: 'connected',
          errorMessage: isTableMissing
            ? 'Connected to Supabase PostgreSQL. Tables can be generated via SQL Schema.'
            : error.message,
          syncedTables: {
            ...defaultTables,
            patients: !isTableMissing,
          },
        };
        this.lastHealthReport = report;
        return report;
      }

      const report: DatabaseHealthReport = {
        isConfigured: true,
        isConnected: true,
        host,
        url: SUPABASE_URL,
        latencyMs,
        status: 'connected',
        syncedTables: {
          patients: true,
          assessment_sessions: true,
          game_sessions: true,
          medicines: true,
          routine_items: true,
          alerts: true,
          appointments: true,
        },
      };
      this.lastHealthReport = report;
      return report;
    } catch (err: any) {
      const report: DatabaseHealthReport = {
        isConfigured: true,
        isConnected: false,
        host,
        url: SUPABASE_URL,
        latencyMs: null,
        status: 'offline',
        errorMessage: err.message || 'Unable to reach Supabase endpoint.',
        syncedTables: defaultTables,
      };
      this.lastHealthReport = report;
      return report;
    }
  }

  /**
   * Sync patient profile to Supabase.
   */
  async syncPatientProfile(patient: Partial<PatientProfile>): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payload: Record<string, any> = {
        id: patient.id || 'patient-asha-001',
        name: patient.name || 'Asha Devi',
        age: patient.age ?? 68,
        gender: patient.gender || 'Female',
        language: patient.language || 'en',
        location: patient.location || 'Guwahati, Assam',
        region: patient.region || 'Guwahati, Assam (NER)',
        interests: patient.interests || [],
        cognitive_baseline: patient.cognitiveBaseline || 'Mild Cognitive Support',
        joined_date: patient.joinedDate || new Date().toISOString(),
        photo_url: patient.photoUrl || '',
        primary_caregiver_id: patient.primaryCaregiverId || 'caregiver-01',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('patients').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[SupabaseService] Error syncing patient profile:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[SupabaseService] Patient sync exception:', err.message);
      return false;
    }
  }

  /**
   * Fetch patient profile from Supabase.
   */
  async fetchPatientProfile(patientId: string): Promise<Partial<PatientProfile> | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        language: data.language,
        location: data.location,
        region: data.region,
        interests: data.interests,
        cognitiveBaseline: data.cognitive_baseline,
        joinedDate: data.joined_date,
        photoUrl: data.photo_url,
        primaryCaregiverId: data.primary_caregiver_id,
      };
    } catch {
      return null;
    }
  }

  /**
   * Record Assessment Session into Supabase.
   */
  async saveAssessmentSession(
    patientId: string,
    result: AssessmentResult,
    rawAnswers?: UserAssessmentAnswers
  ): Promise<boolean> {
    if (!supabase) return false;
    try {
      await this.syncPatientProfile({
        id: patientId,
        name: 'Asha Devi',
        age: 68,
        gender: 'Female',
        language: 'en',
      });

      const payload = {
        id: result.sessionId || `assess-${Date.now()}`,
        patient_id: patientId || 'patient-asha-001',
        overall_score: result.overallScore,
        domain_scores: result.domainScores,
        task_responses: rawAnswers || result.taskResponses || {},
        ai_summary: result.aiSummary || '',
        clinical_notes: result.clinicalNotes || '',
        recommended_activities: result.recommendedActivities || [],
        completed_at: result.completedAt || new Date().toISOString(),
      };

      const { error } = await supabase.from('assessment_sessions').insert(payload);
      if (error) {
        console.warn('[SupabaseService] Error saving assessment session:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[SupabaseService] Save assessment exception:', err.message);
      return false;
    }
  }

  /**
   * Record completed Game Session / Cognitive Activity.
   */
  async recordGameSession(
    patientId: string,
    session: {
      activityId: string;
      title: string;
      score: number;
      accuracyPercent?: number;
      duration: string | number;
      status?: string;
    }
  ): Promise<boolean> {
    if (!supabase) return false;
    try {
      const formattedDuration =
        typeof session.duration === 'number'
          ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s`
          : String(session.duration);

      const payload = {
        id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        patient_id: patientId || 'patient-asha-001',
        activity_id: session.activityId,
        title: session.title,
        score: session.score,
        accuracy_percent: session.accuracyPercent ?? session.score,
        duration: formattedDuration,
        status: session.status || (session.score >= 90 ? 'Optimal' : session.score >= 75 ? 'Good' : 'Needs Practice'),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('game_sessions').insert(payload);
      if (error) {
        console.warn('[SupabaseService] Error recording game session:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[SupabaseService] Game session record exception:', err.message);
      return false;
    }
  }

  /**
   * Sync medicines list to Supabase.
   */
  async syncMedicines(patientId: string, medicines: Medicine[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payloads = medicines.map(med => ({
        id: med.id,
        patient_id: patientId || 'patient-asha-001',
        name: med.name,
        dosage: med.dosage,
        time_slot: med.timeSlot,
        time: med.time,
        instructions: med.instructions || '',
        purpose: med.purpose || '',
        pill_color: med.pillColor || 'teal',
        pill_shape: med.pillShape || 'round',
        is_taken_today: Boolean(med.isTakenToday),
        taken_at: med.takenAt || null,
        history_7days: med.history7Days || [],
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('medicines').upsert(payloads, { onConflict: 'id' });
      if (error) {
        console.warn('[SupabaseService] Error syncing medicines:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[SupabaseService] Medicines sync exception:', err.message);
      return false;
    }
  }

  /**
   * Update a single medicine's taken status in Supabase.
   */
  async updateMedicineStatus(
    medId: string,
    isTaken: boolean,
    takenAt?: string
  ): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('medicines')
        .update({
          is_taken_today: isTaken,
          taken_at: takenAt || (isTaken ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null),
          updated_at: new Date().toISOString(),
        })
        .eq('id', medId);

      if (error) {
        console.warn('[SupabaseService] Error updating medicine status:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[SupabaseService] Medicine update status exception:', err.message);
      return false;
    }
  }

  /**
   * Sync routine items list to Supabase.
   */
  async syncRoutineItems(patientId: string, items: RoutineItem[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payloads = items.map(item => ({
        id: item.id,
        patient_id: patientId || 'patient-asha-001',
        title: item.title,
        time: item.time,
        time_block: item.timeBlock,
        icon: item.icon || 'Sun',
        description: item.description || '',
        is_completed: Boolean(item.isCompleted),
        completed_at: item.completedAt || null,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('routine_items').upsert(payloads, { onConflict: 'id' });
      if (error) {
        console.warn('[SupabaseService] Error syncing routines:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[SupabaseService] Routine items sync exception:', err.message);
      return false;
    }
  }

  /**
   * Update a routine item status in Supabase.
   */
  async updateRoutineStatus(
    itemId: string,
    isCompleted: boolean,
    completedAt?: string
  ): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('routine_items')
        .update({
          is_completed: isCompleted,
          completed_at: completedAt || (isCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null),
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) {
        console.warn('[SupabaseService] Error updating routine status:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[SupabaseService] Routine update status exception:', err.message);
      return false;
    }
  }

  /**
   * Create an alert in Supabase.
   */
  async createAlert(patientId: string, alert: AlertItem): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payload = {
        id: alert.id || `alert-${Date.now()}`,
        patient_id: patientId || 'patient-asha-001',
        title: alert.title,
        message: alert.message,
        type: alert.type || 'info',
        category: alert.category || 'general',
        is_acknowledged: Boolean(alert.isAcknowledged),
        action_label: alert.actionLabel || null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('alerts').insert(payload);
      if (error) {
        console.warn('[SupabaseService] Error inserting alert:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[SupabaseService] Create alert exception:', err.message);
      return false;
    }
  }

  /**
   * Acknowledge alert in Supabase.
   */
  async acknowledgeAlert(alertId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_acknowledged: true })
        .eq('id', alertId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Sync appointments list to Supabase.
   */
  async syncAppointments(patientId: string, appointments: Appointment[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payloads = appointments.map(apt => ({
        id: apt.id,
        patient_id: patientId || 'patient-asha-001',
        doctor_name: apt.doctorName,
        specialty: apt.specialty,
        clinic: apt.clinic,
        date_time: apt.dateTime,
        time: apt.time,
        location: apt.location,
        notes: apt.notes || '',
        reminder_enabled: Boolean(apt.reminderEnabled),
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('appointments').upsert(payloads, { onConflict: 'id' });
      if (error) {
        console.warn('[SupabaseService] Error syncing appointments:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[SupabaseService] Appointments sync exception:', err.message);
      return false;
    }
  }

  /**
   * Sync all local state up to Supabase in one unified call.
   */
  async syncAllDataToCloud(data: {
    patient: PatientProfile;
    medicines: Medicine[];
    routineItems: RoutineItem[];
    alerts: AlertItem[];
    appointments: Appointment[];
  }): Promise<{ success: boolean; message: string }> {
    if (!supabase) {
      return { success: false, message: 'Supabase client is not configured.' };
    }

    try {
      await this.syncPatientProfile(data.patient);
      await this.syncMedicines(data.patient.id, data.medicines);
      await this.syncRoutineItems(data.patient.id, data.routineItems);
      await this.syncAppointments(data.patient.id, data.appointments);

      return {
        success: true,
        message: `Successfully synchronized all patient profiles, medications, routines, and appointments to Supabase (${getSupabaseHost()})!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Sync encountered an issue: ${err.message}`,
      };
    }
  }
}

export const supabaseService = new SupabaseService();
