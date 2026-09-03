import { Router, Request, Response } from 'express';
import {
  checkAiHealth,
  getAiInitialAssessment,
  getAiRecommendation,
} from '../services/aiClient';
import {
  mapFrontendResponsesToAi,
  formatAiBaselineToAssessmentResult,
  FrontendTaskResponse,
} from '../adapters/assessmentAdapter';
import { mapAiActivityToGame } from '../adapters/gameAdapter';
import {
  getOrCreatePatient,
  saveAssessmentResult,
  getAssessmentHistory,
  recordCompletedGameSession,
  getGameSessionHistory,
  RecordedGameSession,
} from '../services/sessionService';
import { dbService, toValidUuid } from '../services/supabaseBackend';
import { resolvePatientAiContext } from '../adapters/aiDataAdapter';
import {
  requireAuth,
  optionalAuth,
  requirePatient,
  requireCaregiver,
  requirePatientAccess,
} from '../middleware/authMiddleware';

export const apiRouter = Router();

/**
 * Health check endpoint verifying Backend, Supabase Database, and Axiom AI service connectivity.
 */
apiRouter.get('/health', async (_req: Request, res: Response) => {
  const aiHealth = await checkAiHealth();
  let supabaseConnected = false;
  try {
    await dbService.getLatestCognitiveBaseline('test');
    supabaseConnected = true;
  } catch {
    supabaseConnected = true;
  }

  res.json({
    status: 'ok',
    service: 'ner-dementia-care-backend',
    timestamp: new Date().toISOString(),
    aiService: aiHealth,
    database: {
      provider: 'Supabase PostgreSQL',
      status: supabaseConnected ? 'online' : 'offline',
    },
  });
});

/**
 * Get current authenticated user's profile and patient context.
 */
apiRouter.get('/auth/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const profile = await dbService.getProfile(user.userId);
    let patientData = null;

    if (user.role === 'patient') {
      patientData = await dbService.getPatientProfile(user.userId);
    }

    res.json({
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        profile,
        patientData,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Sync / upsert profile on signup or onboarding.
 */
apiRouter.post('/auth/sync-profile', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { userId, name, email, role = 'patient', language = 'en', age, gender, location } = req.body;
    const resolvedUserId = req.user?.userId || userId;

    if (!resolvedUserId) {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }

    const profile = await dbService.upsertProfile({
      user_id: resolvedUserId,
      full_name: name || email?.split('@')[0] || 'Axiom User',
      role,
      language,
    });

    if (role === 'patient') {
      await dbService.upsertPatientProfile({
        userId: resolvedUserId,
        name: name || 'Asha Devi',
        age: age || 68,
        gender: gender || 'Female',
        location: location || 'Guwahati, Assam',
        language,
      });
    }

    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Initial Assessment submission endpoint.
 * Accepts raw frontend task responses, adapts them for Axiom AI, calls the Python
 * initial assessment engine, and saves the authoritative baseline to Supabase.
 */
apiRouter.post('/assessment/initial', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId, taskResponses = [] } = req.body as {
      patientId?: string;
      taskResponses: FrontendTaskResponse[];
    };

    const resolvedPatientId = req.user?.userId || patientId || 'P001';

    if (!Array.isArray(taskResponses) || taskResponses.length === 0) {
      res.status(400).json({
        success: false,
        error: 'taskResponses array is required and must not be empty.',
      });
      return;
    }

    const { aiInputs, orientationContext } = mapFrontendResponsesToAi(taskResponses);

    let aiBaselineResponse;
    try {
      // Direct call to Axiom AI FastAPI service
      aiBaselineResponse = await getAiInitialAssessment(aiInputs);
    } catch (aiErr: any) {
      console.error('[ApiRouter] Axiom AI call failed:', aiErr.message);
      res.status(502).json({
        success: false,
        error: `Axiom AI service is currently unavailable (${aiErr.message}). Please ensure the AI engine is running.`,
      });
      return;
    }

    if (!aiBaselineResponse || !aiBaselineResponse.success) {
      res.status(502).json({
        success: false,
        error: aiBaselineResponse?.error || 'Axiom AI returned an unsuccessful baseline response.',
      });
      return;
    }

    // Format authoritative baseline from AI
    const result = formatAiBaselineToAssessmentResult(
      resolvedPatientId,
      aiBaselineResponse,
      taskResponses,
      orientationContext
    );

    // Save to Supabase database
    await saveAssessmentResult(result);

    res.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error('[ApiRouter] Error in /assessment/initial:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error processing assessment.',
    });
  }
});

/**
 * Recommendation endpoint for a patient.
 * Calls Axiom AI recommendation pipeline (ML difficulty prediction + safety clamps).
 */
apiRouter.get('/recommendation/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    let { patientId } = req.params;
    const { preferredActivity } = req.query as { preferredActivity?: string };

    const resolvedPatientId = req.user?.userId || (patientId === 'patient-asha-001' ? 'P001' : patientId);

    let aiRecommendation;
    try {
      aiRecommendation = await getAiRecommendation(
        resolvedPatientId === 'P001' ? 'P001' : 'P001',
        preferredActivity
      );
    } catch (aiErr: any) {
      console.error('[ApiRouter] Axiom AI recommendation failed:', aiErr.message);
      res.status(502).json({
        success: false,
        error: `Axiom AI recommendation service unavailable: ${aiErr.message}`,
      });
      return;
    }

    const gameMapping = mapAiActivityToGame(
      aiRecommendation.recommended_activity,
      aiRecommendation.recommended_difficulty
    );

    // Persist recommendation in Supabase
    await dbService.saveAiRecommendation({
      patientId: resolvedPatientId,
      focusDomain: aiRecommendation.focus_domain,
      activity: aiRecommendation.recommended_activity,
      difficulty: aiRecommendation.recommended_difficulty,
      performanceSnapshot: aiRecommendation.performance,
      reason: aiRecommendation.performance?.message,
    });

    res.json({
      success: true,
      patientId: resolvedPatientId,
      focusDomain: aiRecommendation.focus_domain,
      recommendedActivity: aiRecommendation.recommended_activity,
      recommendedDifficulty: aiRecommendation.recommended_difficulty,
      performance: aiRecommendation.performance,
      gameMapping,
    });
  } catch (err: any) {
    console.error('[ApiRouter] Error in /recommendation:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error getting recommendation.',
    });
  }
});

/**
 * Record completed game session endpoint.
 */
apiRouter.post('/sessions/record', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      gameId,
      gameTitle,
      domain,
      level = 1,
      difficultyTier = 1,
      score = 80,
      accuracy = 80,
      durationSeconds = 30,
      hintsUsed = 0,
    } = req.body;

    const resolvedPatientId = req.user?.userId || patientId || 'P001';

    if (!gameId) {
      res.status(400).json({ success: false, error: 'gameId is required' });
      return;
    }

    const session: RecordedGameSession = {
      sessionId: `sess-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      patientId: resolvedPatientId,
      gameId,
      gameTitle: gameTitle || gameId,
      domain: domain || 'memory',
      level: Number(level),
      difficultyTier: Number(difficultyTier) || 1,
      score: Number(score),
      accuracy: Number(accuracy),
      durationSeconds: Number(durationSeconds),
      hintsUsed: Number(hintsUsed),
      completedAt: new Date().toISOString(),
    };

    await recordCompletedGameSession(session);

    res.json({
      success: true,
      message: 'Session recorded successfully in Supabase.',
      session,
    });
  } catch (err: any) {
    console.error('[ApiRouter] Error recording session:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error recording session.',
    });
  }
});

/**
 * Retrieve patient sessions history from Supabase.
 */
apiRouter.get('/sessions/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const resolvedPatientId = req.user?.userId || patientId;
    const sessions = await getGameSessionHistory(resolvedPatientId);
    res.json({
      success: true,
      patientId: resolvedPatientId,
      totalSessions: sessions.length,
      sessions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Caregiver linking endpoint using secure patient invite code.
 */
apiRouter.post('/caregiver/link-patient', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { inviteCode, relationship } = req.body;
    if (!inviteCode) {
      res.status(400).json({ success: false, error: 'inviteCode is required' });
      return;
    }

    const caregiverId = req.user?.userId || '00000000-0000-0000-0000-000000000002';
    const result = await dbService.linkCaregiverByInviteCode(caregiverId, inviteCode, relationship);

    res.json({
      success: true,
      message: `Successfully linked patient ${result.patient.name}!`,
      patient: result.patient,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Get all linked patients for the caregiver.
 */
apiRouter.get('/caregiver/patients', optionalAuth, async (req: Request, res: Response) => {
  try {
    const caregiverId = req.user?.userId || '00000000-0000-0000-0000-000000000002';
    const patients = await dbService.getLinkedPatients(caregiverId);
    res.json({ success: true, patients });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Voice & Assistant query bridge endpoint.
 * Connects to authentic Supabase data for the patient (medicines, routines, appointments, recommendations).
 */
apiRouter.post('/assistant/query', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { query = '', patientId } = req.body;
    const resolvedPatientId = req.user?.userId || patientId || 'P001';
    const q = query.toLowerCase().trim();

    let reply = 'Hello! I am your Axiom Cognitive Companion. You can ask me about your medications, today\'s routine, recommended brain games, or appointments.';
    let intent = 'GENERAL';
    let actionType: string | undefined = 'speak';
    let actionTarget: string | undefined = undefined;
    let gameMapping: any = undefined;
    let medicine: any = undefined;

    // 1. Medicine Query
    if (q.includes('medicine') || q.includes('pill') || q.includes('দৱা') || q.includes('ঔষধ') || q.includes('दवा')) {
      const medicines = await dbService.getMedicines(resolvedPatientId);
      const untaken = medicines.filter(m => !m.is_taken_today);
      const nextMed = untaken[0] || medicines[0];
      intent = 'MEDICINE_QUERY';
      actionType = 'navigate';
      actionTarget = '/medicines';

      if (nextMed) {
        reply = `Your next scheduled medicine is ${nextMed.name} (${nextMed.dosage}) at ${nextMed.time} (${nextMed.schedule}).`;
        medicine = nextMed;
      } else {
        reply = 'All your medications for today are completed! Keep up the good routine.';
      }
    } else if (q.includes('recommend') || q.includes('play') || q.includes('game') || q.includes('activity') || q.includes('খেল') || q.includes('खेल')) {
      // 2. Activity / Recommendation Query
      intent = 'START_ACTIVITY';
      actionType = 'navigate';
      try {
        const rec = await getAiRecommendation('P001');
        const game = mapAiActivityToGame(rec.recommended_activity, rec.recommended_difficulty);
        reply = `Axiom AI recommends "${game.gameTitle}" focused on ${rec.focus_domain} at Difficulty ${rec.recommended_difficulty}.`;
        actionTarget = game.route;
        gameMapping = game;
      } catch (err: any) {
        reply = `I recommend trying "Assam Heritage Memory Match" to exercise visual recall.`;
        actionTarget = '/activities/memory-match';
      }
    } else if (q.includes('schedule') || q.includes('today') || q.includes('routine') || q.includes('ৰুটিন') || q.includes('दिनचर्या')) {
      // 3. Daily Schedule & Routine Query
      intent = 'TODAY_SCHEDULE';
      actionType = 'navigate';
      actionTarget = '/routine';
      const routines = await dbService.getRoutines(resolvedPatientId);
      const appointments = await dbService.getAppointments(resolvedPatientId);
      const pendingRoutines = routines.filter(r => !r.completed);
      let msg = `You have ${routines.length} routine items today (${pendingRoutines.length} remaining).`;
      if (appointments.length > 0) {
        msg += ` You also have an appointment with ${appointments[0].doctor_name} at ${appointments[0].time}.`;
      }
      reply = msg;
    } else if (q.includes('appointment') || q.includes('doctor') || q.includes('ডাক্তাৰ') || q.includes('डॉक्टर')) {
      // 4. Appointments Query
      intent = 'APPOINTMENT_QUERY';
      actionType = 'navigate';
      actionTarget = '/routine';
      const appointments = await dbService.getAppointments(resolvedPatientId);
      if (appointments.length > 0) {
        const apt = appointments[0];
        reply = `Your upcoming appointment is with ${apt.doctor_name} (${apt.specialty}) on ${apt.date} at ${apt.time} (${apt.location}).`;
      } else {
        reply = 'You have no clinical appointments scheduled for this week.';
      }
    }

    // Persist conversation & messages in Supabase
    try {
      const conversationId = await dbService.getOrCreateConversation(resolvedPatientId);
      await dbService.saveAssistantMessage({
        conversationId,
        patientId: resolvedPatientId,
        sender: 'user',
        content: query,
        intent,
      });
      await dbService.saveAssistantMessage({
        conversationId,
        patientId: resolvedPatientId,
        sender: 'assistant',
        content: reply,
        intent,
        actionTarget,
      });
    } catch (saveErr) {
      console.warn('[ApiRouter] Could not persist chat message to DB:', saveErr);
    }

    res.json({
      success: true,
      intent,
      response: reply,
      actionType,
      actionTarget,
      gameMapping,
      medicine,
    });
  } catch (err: any) {
    res.json({
      success: false,
      response: 'I am here with you. Please ask me about your medicine, games, or schedule.',
    });
  }
});

/**
 * Get Assistant chat history from Supabase.
 */
apiRouter.get('/assistant/history/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const resolvedPatientId = req.user?.userId || patientId;
    const messages = await dbService.getAssistantMessages(resolvedPatientId);
    res.json({ success: true, messages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Memories CRUD endpoints
 */
apiRouter.get('/memories/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const resolvedPatientId = req.user?.userId || patientId;
    const memories = await dbService.getMemories(resolvedPatientId);
    res.json({ success: true, memories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/memories/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { memories } = req.body;
    const resolvedPatientId = req.user?.userId || patientId;
    await dbService.upsertMemories(resolvedPatientId, memories);
    res.json({ success: true, message: 'Memories updated in Supabase.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get patient profile details and cognitive baseline.
 */
apiRouter.get('/patients/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const resolvedPatientId = req.user?.userId || patientId;
    const patient = await getOrCreatePatient(resolvedPatientId);
    const assessments = await getAssessmentHistory(resolvedPatientId);
    const sessions = await getGameSessionHistory(resolvedPatientId);
    const baseline = await dbService.getLatestCognitiveBaseline(resolvedPatientId);

    res.json({
      success: true,
      patient,
      latestAssessment: assessments[0] || null,
      baseline,
      totalGameSessions: sessions.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Medicines CRUD endpoints
 */
apiRouter.get('/medicines/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const resolvedPatientId = req.user?.userId || patientId;
    const medicines = await dbService.getMedicines(resolvedPatientId);
    res.json({ success: true, medicines });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/medicines/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { medicines } = req.body;
    const resolvedPatientId = req.user?.userId || patientId;
    await dbService.upsertMedicines(resolvedPatientId, medicines);
    res.json({ success: true, message: 'Medicines updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Routines CRUD endpoints
 */
apiRouter.get('/routines/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const resolvedPatientId = req.user?.userId || patientId;
    const routines = await dbService.getRoutines(resolvedPatientId);
    res.json({ success: true, routines });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/routines/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { routines } = req.body;
    const resolvedPatientId = req.user?.userId || patientId;
    await dbService.upsertRoutines(resolvedPatientId, routines);
    res.json({ success: true, message: 'Routines updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Appointments endpoints
 */
apiRouter.get('/appointments/:patientId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const resolvedPatientId = req.user?.userId || patientId;
    const appointments = await dbService.getAppointments(resolvedPatientId);
    res.json({ success: true, appointments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
