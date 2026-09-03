import { AiBaselineResponse } from '../services/aiClient';

export interface FrontendTaskResponse {
  taskId: string;
  domain: string;
  taskTitle?: string;
  taskType?: string;
  question?: string;
  difficultyWeight?: number;
  expectedAnswer?: any;
  patientAnswer?: any;
  isCorrect?: boolean;
  score?: number;
  responseTimeMs?: number;
  hintsUsed?: number;
  skipped?: boolean;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface AdaptedAiTaskInput {
  task_id: string;
  domain: string;
  accuracy: number;
  response_time: number;
  attempts: number;
  hints_used: number;
}

export interface DomainScoreOutput {
  domain: string;
  score: number;
  status: 'Strong' | 'Good' | 'Needs Practice' | 'Developing';
  recommendation: string;
  taskCount: number;
  correctCount: number;
  averageResponseTimeMs: number;
  level: string;
  activityLevel: number; // 1 to 5
}

export interface AssessmentResultOutput {
  sessionId: string;
  patientId: string;
  completedAt: string;
  overallScore: number;
  focusDomain: string;
  recommendedActivity: string;
  recommendedDifficulty: number;
  domainScores: Record<string, DomainScoreOutput>;
  aiSummary: string;
  recommendedActivities: string[];
  clinicalNotes: string;
  taskResponses?: FrontendTaskResponse[];
  rawAiBaseline: Record<string, any>;
}

/**
 * Maps frontend assessment responses to the exact input format expected by Axiom AI.
 * Keeps orientation data as context, uses authentic timings and scores.
 */
export function mapFrontendResponsesToAi(
  responses: FrontendTaskResponse[]
): {
  aiInputs: AdaptedAiTaskInput[];
  orientationContext: { timeAndDay?: any; comfort?: any };
} {
  const aiInputs: AdaptedAiTaskInput[] = [];
  const orientationContext: { timeAndDay?: any; comfort?: any } = {};

  for (const resp of responses) {
    const responseTimeSec = Math.max(
      0.5,
      Number(((resp.responseTimeMs || 3000) / 1000).toFixed(2))
    );
    const hintsUsed = Math.max(0, resp.hintsUsed || 0);
    const attempts = 1;

    let mappedDomain = resp.domain;
    if (mappedDomain === 'sequencing') mappedDomain = 'executive_function';
    if (mappedDomain === 'recall') mappedDomain = 'memory';

    if (mappedDomain === 'orientation') {
      if (resp.taskId.includes('1') || resp.taskId.includes('day')) {
        orientationContext.timeAndDay = {
          answer: resp.patientAnswer,
          isCorrect: resp.isCorrect,
          responseTimeSec,
        };
      } else {
        orientationContext.comfort = {
          answer: resp.patientAnswer,
          responseTimeSec,
        };
      }
      continue;
    }

    let accuracy = 0;
    if (typeof resp.score === 'number') {
      accuracy = Math.max(0, Math.min(1.0, resp.score / 100));
    } else {
      accuracy = resp.isCorrect ? 1.0 : 0.0;
    }

    aiInputs.push({
      task_id: resp.taskId || `TASK_${aiInputs.length + 1}`,
      domain: mappedDomain,
      accuracy,
      response_time: responseTimeSec,
      attempts,
      hints_used: hintsUsed,
    });
  }

  return { aiInputs, orientationContext };
}

/**
 * Maps the authoritative Axiom AI baseline response back into the comprehensive frontend model.
 */
export function formatAiBaselineToAssessmentResult(
  patientId: string,
  aiResponse: AiBaselineResponse,
  rawResponses: FrontendTaskResponse[],
  orientationContext?: any
): AssessmentResultOutput {
  const baseline = aiResponse.baseline || {};
  const focusDomain = aiResponse.focus_domain || 'memory';
  const domainScores: Record<string, DomainScoreOutput> = {};

  let totalScoreSum = 0;
  let domainCount = 0;

  // Process domains calculated by AI
  for (const [domain, data] of Object.entries(baseline)) {
    const rawDomainTasks = rawResponses.filter(r => {
      if (domain === 'executive_function') return r.domain === 'sequencing' || r.domain === 'executive_function';
      if (domain === 'memory') return r.domain === 'memory' || r.domain === 'recall';
      return r.domain === domain;
    });

    const correctCount = rawDomainTasks.filter(t => t.isCorrect).length;
    const avgResponseTimeMs =
      rawDomainTasks.length > 0
        ? Math.round(
            rawDomainTasks.reduce((s, t) => s + (t.responseTimeMs || 0), 0) /
              rawDomainTasks.length
          )
        : 3500;

    let status: DomainScoreOutput['status'] = 'Good';
    let activityLevel = 2;

    if (data.score >= 80) {
      status = 'Strong';
      activityLevel = 3;
    } else if (data.score >= 60) {
      status = 'Good';
      activityLevel = 2;
    } else if (data.score >= 40) {
      status = 'Needs Practice';
      activityLevel = 1;
    } else {
      status = 'Developing';
      activityLevel = 1;
    }

    let recommendation = `Recommended daily exercises in ${domain} to maintain cognitive vitality.`;
    if (domain === 'memory') {
      recommendation =
        data.score >= 80
          ? 'Memory recall and visual retention are strong. Continue daily pairing activities.'
          : 'Gentle familiar item matching and recall practice recommended.';
    } else if (domain === 'attention') {
      recommendation =
        data.score >= 80
          ? 'Selective visual focus is sharp and distinct.'
          : 'Visual target search in calm garden scenes to reinforce attention.';
    } else if (domain === 'processing_speed') {
      recommendation =
        data.score >= 80
          ? 'Visual comparison and symbol response speeds are comfortable.'
          : 'Gentle timed shape matching to practice processing speed.';
    } else if (domain === 'executive_function') {
      recommendation =
        data.score >= 80
          ? 'Step planning and sequence logic are orderly and accurate.'
          : 'Daily step sequencing and category grouping exercises recommended.';
    } else if (domain === 'recognition') {
      recommendation =
        data.score >= 80
          ? 'Item discrimination and visual recognition are confident.'
          : 'Familiar object and silhouette recognition exercises.';
    }

    domainScores[domain] = {
      domain,
      score: Math.round(data.score),
      status,
      level: data.level,
      activityLevel,
      recommendation,
      taskCount: rawDomainTasks.length || data.tasks_completed,
      correctCount,
      averageResponseTimeMs: avgResponseTimeMs,
    };

    totalScoreSum += data.score;
    domainCount++;
  }

  // Include orientation domain context for full frontend rendering
  const orientationTasks = rawResponses.filter(r => r.domain === 'orientation');
  if (orientationTasks.length > 0) {
    const correctCount = orientationTasks.filter(t => t.isCorrect).length;
    const orientationScore = Math.round((correctCount / orientationTasks.length) * 100);
    domainScores['orientation'] = {
      domain: 'orientation',
      score: orientationScore,
      status: orientationScore >= 80 ? 'Strong' : 'Needs Practice',
      level: orientationScore >= 80 ? 'Strong' : 'Needs Support',
      activityLevel: orientationScore >= 80 ? 3 : 1,
      recommendation:
        orientationScore >= 80
          ? 'Orientation is comfortable. Continue regular daily check-ins.'
          : 'Daily morning calendar and time check-ins recommended.',
      taskCount: orientationTasks.length,
      correctCount,
      averageResponseTimeMs: 2500,
    };
  }

  const overallScore =
    domainCount > 0 ? Math.round(totalScoreSum / domainCount) : 75;

  // Calibrate primary recommended activity and difficulty level from focus domain
  let recommendedActivity = 'memory-match';
  let recommendedDifficulty = 1;

  if (focusDomain === 'memory') {
    recommendedActivity = 'memory-match';
    recommendedDifficulty = domainScores['memory']?.activityLevel || 1;
  } else if (focusDomain === 'attention') {
    recommendedActivity = 'attention-search';
    recommendedDifficulty = domainScores['attention']?.activityLevel || 1;
  } else if (focusDomain === 'processing_speed') {
    recommendedActivity = 'category-sorting';
    recommendedDifficulty = domainScores['processing_speed']?.activityLevel || 1;
  } else if (focusDomain === 'executive_function') {
    recommendedActivity = 'pattern-sequence';
    recommendedDifficulty = domainScores['executive_function']?.activityLevel || 1;
  } else if (focusDomain === 'recognition') {
    recommendedActivity = 'object-recognition';
    recommendedDifficulty = domainScores['recognition']?.activityLevel || 1;
  }

  const recommendedActivities: string[] = [recommendedActivity];
  const secondaryActivities = ['memory-match', 'attention-search', 'pattern-sequence', 'category-sorting', 'object-recognition'];
  for (const act of secondaryActivities) {
    if (!recommendedActivities.includes(act)) {
      recommendedActivities.push(act);
    }
    if (recommendedActivities.length >= 4) break;
  }

  const focusDomainName = focusDomain.replace('_', ' ').toUpperCase();
  const aiSummary = `Axiom AI Baseline established: Overall score ${overallScore}%. Current activity focus: ${focusDomainName} (Level ${recommendedDifficulty}). Tailored daily exercises selected.`;

  const clinicalNotes = `Axiom AI Cognitive Assessment completed. Overall baseline: ${overallScore}%. Priority focus: ${focusDomain}. Calibrated activity difficulty: Level ${recommendedDifficulty}. Non-diagnostic cognitive performance calibration.`;

  return {
    sessionId: `asmt-${Date.now().toString(36)}`,
    patientId,
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    overallScore,
    focusDomain,
    recommendedActivity,
    recommendedDifficulty,
    domainScores,
    aiSummary,
    recommendedActivities,
    clinicalNotes,
    taskResponses: rawResponses,
    rawAiBaseline: baseline,
  };
}
