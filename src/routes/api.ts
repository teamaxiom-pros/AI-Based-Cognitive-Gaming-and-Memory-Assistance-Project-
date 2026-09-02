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

export const apiRouter = Router();

/**
 * Health check endpoint verifying Backend and Axiom AI service connectivity.
 */
apiRouter.get('/health', async (_req: Request, res: Response) => {
  const aiHealth = await checkAiHealth();
  res.json({
    status: 'ok',
    service: 'ner-dementia-care-backend',
    timestamp: new Date().toISOString(),
    aiService: aiHealth,
  });
});

/**
 * Initial Assessment submission endpoint.
 * Takes raw frontend task responses, adapts them to Axiom AI format,
 * calls the AI initial assessment engine, and formats the authoritative baseline.
 */
apiRouter.post('/assessment/initial', async (req: Request, res: Response) => {
  try {
    const { patientId = 'P001', taskResponses = [] } = req.body as {
      patientId?: string;
      taskResponses: FrontendTaskResponse[];
    };

    if (!Array.isArray(taskResponses) || taskResponses.length === 0) {
      res.status(400).json({
        success: false,
        error: 'taskResponses array is required and must not be empty.',
      });
      return;
    }

    const { aiInputs, orientationContext } = mapFrontendResponsesToAi(taskResponses);

    let aiBaselineResponse;
    let fallbackUsed = false;

    try {
      aiBaselineResponse = await getAiInitialAssessment(aiInputs);
    } catch (aiErr: any) {
      console.warn('[ApiRouter] Axiom AI call failed, using mathematical fallback:', aiErr.message);
      fallbackUsed = true;
      // High-fidelity fallback baseline matching Axiom AI formulas
      const fallbackBaseline: Record<string, any> = {};
      const domains = ['memory', 'attention', 'executive_function', 'recognition'];
      for (const d of domains) {
        const tasks = aiInputs.filter(t => t.domain === d);
        const avgAcc = tasks.length > 0 ? tasks.reduce((s, t) => s + t.accuracy, 0) / tasks.length : 0.75;
        const score = Math.round(avgAcc * 100);
        fallbackBaseline[d] = {
          score,
          level: score >= 80 ? 'Strong' : score >= 60 ? 'Moderate' : 'Needs Support',
          tasks_completed: tasks.length,
          task_scores: tasks.map(t => Math.round(t.accuracy * 100)),
        };
      }
      aiBaselineResponse = {
        success: true,
        action: 'initial_assessment' as const,
        baseline: fallbackBaseline,
        focus_domain: 'memory',
      };
    }

    const result = formatAiBaselineToAssessmentResult(
      patientId,
      aiBaselineResponse,
      taskResponses,
      orientationContext
    );

    saveAssessmentResult(result);

    res.json({
      success: true,
      fallbackUsed,
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
 * Recommendation endpoint for an existing patient.
 * Runs the Axiom AI recommendation pipeline (ML difficulty prediction + safety clamps + performance explanation).
 */
apiRouter.get('/recommendation/:patientId', async (req: Request, res: Response) => {
  try {
    let { patientId } = req.params;
    const { preferredActivity } = req.query as { preferredActivity?: string };

    // Standardize demo patient IDs to P001 if patient-asha-001 is provided
    const resolvedPatientId =
      patientId === 'patient-asha-001' || !patientId ? 'P001' : patientId;

    let aiRecommendation;
    let fallbackUsed = false;

    try {
      aiRecommendation = await getAiRecommendation(resolvedPatientId, preferredActivity);
    } catch (aiErr: any) {
      console.warn('[ApiRouter] Axiom AI recommendation failed, using fallback:', aiErr.message);
      fallbackUsed = true;
      aiRecommendation = {
        success: true,
        patient_id: resolvedPatientId,
        action: 'recommend' as const,
        focus_domain: 'memory',
        recommended_activity: 'card_match',
        recommended_difficulty: 2,
        performance: {
          accuracy_percent: 75.0,
          trend_percent: 0.0,
          status: 'moderate',
          trend_label: 'stable',
          current_difficulty: 2,
          message: 'The patient is performing at a steady moderate level.',
        },
      };
    }

    const gameMapping = mapAiActivityToGame(
      aiRecommendation.recommended_activity,
      aiRecommendation.recommended_difficulty
    );

    res.json({
      success: true,
      fallbackUsed,
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
apiRouter.post('/sessions/record', (req: Request, res: Response) => {
  try {
    const {
      patientId = 'P001',
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

    if (!gameId) {
      res.status(400).json({ success: false, error: 'gameId is required' });
      return;
    }

    const session: RecordedGameSession = {
      sessionId: `sess-${Date.now().toString(36)}`,
      patientId,
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

    recordCompletedGameSession(session);

    res.json({
      success: true,
      message: 'Session recorded successfully.',
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
 * Retrieve patient sessions history.
 */
apiRouter.get('/sessions/:patientId', (req: Request, res: Response) => {
  const { patientId } = req.params;
  const sessions = getGameSessionHistory(patientId);
  res.json({
    success: true,
    patientId,
    totalSessions: sessions.length,
    sessions,
  });
});

/**
 * Voice & Assistant query bridge endpoint.
 */
apiRouter.post('/assistant/query', async (req: Request, res: Response) => {
  try {
    const { query = '', patientId = 'P001' } = req.body;
    const q = query.toLowerCase().trim();

    // Intent recognition bridging
    if (q.includes('medicine') || q.includes('pill') || q.includes('দৱা') || q.includes('ঔষধ')) {
      res.json({
        success: true,
        intent: 'MEDICINE_QUERY',
        response:
          'Your next medicine is Donepezil 5mg scheduled for this afternoon with water.',
        actionType: 'navigate',
        actionTarget: '/medicines',
      });
      return;
    }

    if (q.includes('recommend') || q.includes('play') || q.includes('activity') || q.includes('কি খেলিম')) {
      const rec = await getAiRecommendation(patientId);
      const game = mapAiActivityToGame(rec.recommended_activity, rec.recommended_difficulty);
      res.json({
        success: true,
        intent: 'START_ACTIVITY',
        response: `Axiom AI recommends ${game.gameTitle} in ${rec.focus_domain} at Difficulty ${rec.recommended_difficulty}.`,
        actionType: 'navigate',
        actionTarget: game.route,
        gameMapping: game,
      });
      return;
    }

    if (q.includes('schedule') || q.includes('today') || q.includes('ৰুটিন')) {
      res.json({
        success: true,
        intent: 'TODAY_SCHEDULE',
        response:
          'You have 2 activities scheduled today: morning garden walk and cultural memory matching.',
        actionType: 'navigate',
        actionTarget: '/routine',
      });
      return;
    }

    res.json({
      success: true,
      intent: 'GENERAL',
      response: `Hello! I am your Axiom Memory Companion. You can ask me about your medicines, activities, or daily schedule.`,
      actionType: 'speak',
    });
  } catch (err: any) {
    res.json({
      success: false,
      response: 'I am here to support you. Please tell me how I can assist.',
    });
  }
});

/**
 * Get patient profile details.
 */
apiRouter.get('/patients/:patientId', (req: Request, res: Response) => {
  const { patientId } = req.params;
  const patient = getOrCreatePatient(patientId);
  const assessments = getAssessmentHistory(patientId);
  const sessions = getGameSessionHistory(patientId);

  res.json({
    success: true,
    patient,
    latestAssessment: assessments[0] || null,
    totalGameSessions: sessions.length,
  });
});
