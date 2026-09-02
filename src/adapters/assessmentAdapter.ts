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
}

export interface AssessmentResultOutput {
  sessionId: string;
  patientId: string;
  completedAt: string;
  overallScore: number;
  focusDomain: string;
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
  orientationContext: { timeAndDay?: any; region?: any };
} {
  const aiInputs: AdaptedAiTaskInput[] = [];
  const orientationContext: { timeAndDay?: any; region?: any } = {};

  for (const resp of responses) {
    const responseTimeSec = Math.max(
      0.5,
      Number(((resp.responseTimeMs || 3000) / 1000).toFixed(2))
    );
    const hintsUsed = Math.max(0, resp.hintsUsed || 0);
    const attempts = 1;

    switch (resp.taskId) {
      case 'task-orientation-1':
        orientationContext.timeAndDay = {
          answer: resp.patientAnswer,
          isCorrect: resp.isCorrect,
          responseTimeSec,
        };
        break;

      case 'task-orientation-2':
        orientationContext.region = {
          answer: resp.patientAnswer,
          isCorrect: resp.isCorrect,
          responseTimeSec,
        };
        break;

      case 'task-memory-encoding-3':
        aiInputs.push({
          task_id: 'MEM_01',
          domain: 'memory',
          accuracy: resp.isCorrect ? 1.0 : Math.max(0, Math.min(1.0, (resp.score || 0) / 100)),
          response_time: responseTimeSec,
          attempts,
          hints_used: hintsUsed,
        });
        break;

      case 'task-recall-7':
        aiInputs.push({
          task_id: 'MEM_02',
          domain: 'memory',
          accuracy: Math.max(0, Math.min(1.0, (resp.score || 0) / 100)),
          response_time: responseTimeSec,
          attempts,
          hints_used: hintsUsed,
        });
        break;

      case 'task-attention-4':
        aiInputs.push({
          task_id: 'ATT_01',
          domain: 'attention',
          accuracy: resp.isCorrect ? 1.0 : 0.0,
          response_time: responseTimeSec,
          attempts,
          hints_used: hintsUsed,
        });
        break;

      case 'task-sequencing-5':
        aiInputs.push({
          task_id: 'EXE_01',
          domain: 'executive_function',
          accuracy: resp.isCorrect ? 1.0 : 0.0,
          response_time: responseTimeSec,
          attempts,
          hints_used: hintsUsed,
        });
        break;

      case 'task-recognition-6':
        aiInputs.push({
          task_id: 'REC_01',
          domain: 'recognition',
          accuracy: resp.isCorrect ? 1.0 : 0.0,
          response_time: responseTimeSec,
          attempts,
          hints_used: hintsUsed,
        });
        break;

      default:
        // Handle generic or dynamic tasks cleanly
        if (resp.domain && resp.domain !== 'orientation') {
          const mappedDomain =
            resp.domain === 'sequencing'
              ? 'executive_function'
              : resp.domain === 'recall'
              ? 'memory'
              : resp.domain;

          aiInputs.push({
            task_id: resp.taskId || `TASK_${aiInputs.length + 1}`,
            domain: mappedDomain,
            accuracy: resp.isCorrect ? 1.0 : Math.max(0, Math.min(1.0, (resp.score || 0) / 100)),
            response_time: responseTimeSec,
            attempts,
            hints_used: hintsUsed,
          });
        }
        break;
    }
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
        : 4000;

    let status: DomainScoreOutput['status'] = 'Good';
    if (data.score >= 80) status = 'Strong';
    else if (data.score >= 60) status = 'Good';
    else if (data.score >= 40) status = 'Needs Practice';
    else status = 'Developing';

    let recommendation = `Recommended daily exercises in ${domain} to maintain cognitive health.`;
    if (domain === 'memory') {
      recommendation =
        data.score >= 80
          ? 'Strong memory recall. Continue visual heritage pairing games.'
          : 'Gentle cultural item pairing and heritage memory matching recommended.';
    } else if (domain === 'attention') {
      recommendation =
        data.score >= 80
          ? 'Selective visual focus is strong. Keep discovering details in garden scenes.'
          : 'Visual focus search in serene tea garden scenes to reinforce attention.';
    } else if (domain === 'executive_function') {
      recommendation =
        data.score >= 80
          ? 'Pattern recognition and sequence flow are active and accurate.'
          : 'Daily rhythm sequence building and category ordering exercises recommended.';
    } else if (domain === 'recognition') {
      recommendation =
        data.score >= 80
          ? 'Traditional motif and shape discrimination are clear and distinct.'
          : 'Familiar cultural silhouettes and handicraft recognition exercises.';
    }

    domainScores[domain] = {
      domain,
      score: Math.round(data.score),
      status,
      level: data.level,
      recommendation,
      taskCount: rawDomainTasks.length || data.tasks_completed,
      correctCount,
      averageResponseTimeMs: avgResponseTimeMs,
    };

    totalScoreSum += data.score;
    domainCount++;
  }

  // Include orientation domain for full frontend rendering
  const orientationTasks = rawResponses.filter(r => r.domain === 'orientation');
  if (orientationTasks.length > 0) {
    const correctCount = orientationTasks.filter(t => t.isCorrect).length;
    const orientationScore = Math.round((correctCount / orientationTasks.length) * 100);
    domainScores['orientation'] = {
      domain: 'orientation',
      score: orientationScore,
      status: orientationScore >= 80 ? 'Strong' : 'Needs Practice',
      level: orientationScore >= 80 ? 'Strong' : 'Needs Support',
      recommendation:
        orientationScore >= 80
          ? 'Orientation is sharp. Continue daily morning calendar & weather check-ins.'
          : 'Practice daily time and place orientation cues with morning tea reminders.',
      taskCount: orientationTasks.length,
      correctCount,
      averageResponseTimeMs: 3000,
    };
  }

  const overallScore =
    domainCount > 0 ? Math.round(totalScoreSum / domainCount) : 75;

  // Build authoritative AI recommendations based on focus_domain
  const recommendedActivities: string[] = [];
  if (focusDomain === 'memory') {
    recommendedActivities.push('memory-match', 'picture-recall', 'symbol-matching');
  } else if (focusDomain === 'attention') {
    recommendedActivities.push('attention-finder', 'odd-one-out');
  } else if (focusDomain === 'executive_function') {
    recommendedActivities.push('sequence-builder', 'category-sorting');
  } else if (focusDomain === 'recognition') {
    recommendedActivities.push('object-recognition', 'spatial-memory');
  } else {
    recommendedActivities.push('memory-match', 'attention-finder');
  }

  // Ensure 3-4 distinct activity cards for the UI carousel
  const secondaryActivities = ['memory-match', 'attention-finder', 'sequence-builder', 'object-recognition'];
  for (const act of secondaryActivities) {
    if (!recommendedActivities.includes(act)) {
      recommendedActivities.push(act);
    }
    if (recommendedActivities.length >= 4) break;
  }

  const aiSummary = `Axiom AI Cognitive Baseline: Overall score ${overallScore}%. Priority focus domain identified as ${focusDomain.replace('_', ' ').toUpperCase()} (${domainScores[focusDomain]?.level || 'Needs Support'}). Daily tailored activity plan generated.`;

  const clinicalNotes = `Patient baseline evaluated by Axiom AI engine. Focus domain: ${focusDomain}. Safe starting difficulty: ${overallScore >= 80 ? 3 : overallScore >= 60 ? 2 : 1}. Orientation: ${orientationContext?.timeAndDay?.isCorrect ? 'Intact' : 'Supported'}.`;

  return {
    sessionId: `asmt-${Date.now().toString(36)}`,
    patientId,
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    overallScore,
    focusDomain,
    domainScores,
    aiSummary,
    recommendedActivities,
    clinicalNotes,
    taskResponses: rawResponses,
    rawAiBaseline: baseline,
  };
}
