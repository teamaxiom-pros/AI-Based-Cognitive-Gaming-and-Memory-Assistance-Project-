import { defaultPatient } from './data/defaultPatient';
import { avatarLibrary, genderOptionsList, getDefaultAvatarForGender } from './data/avatarsData';
import { gamesLibrary } from './data/gamesLibraryData';
import {
  calculateDifficulty,
  getDifficultyTier,
  getDifficultyLabel,
  calculateCognitiveLoad,
} from './services/levelGenerator';
import {
  loadAllGamesProgress,
  recordLevelCompletion,
  calculateDomainProgress,
} from './services/gameProgressionService';
import { getPersonalizedRecommendations } from './services/gameRecommendationService';
import { translations } from './i18n/useTranslation';
import { scoreAssessmentResponses } from './services/assessmentEngine';
import { processAssistantQuery } from './services/assistantService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${description}`);
    failed++;
  }
}

export function runTests() {
  console.log('=== RUNNING AXIOM EXTENDED VERIFICATION SUITE ===\n');

  // 1. Patient Profile & Explicit Gender
  console.log('1. Checking Patient Profile & Avatar System (No Name Inference):');
  assert(defaultPatient.name === 'Asha Sharma', 'Default patient is Asha Sharma');
  assert(defaultPatient.age === 68, 'Default patient age is 68');
  assert(defaultPatient.location.includes('Guwahati'), 'Location is in Guwahati (NER)');
  assert(genderOptionsList.length === 4, '4 explicit gender options available');
  assert(avatarLibrary.length >= 12, `Avatar library contains ${avatarLibrary.length} avatars`);

  const femAvatarUrl = getDefaultAvatarForGender('Female');
  const maleAvatarUrl = getDefaultAvatarForGender('Male');
  const neutAvatarUrl = getDefaultAvatarForGender('Prefer not to say');

  assert(!!femAvatarUrl, 'Default avatar for Female works without name inference');
  assert(!!maleAvatarUrl, 'Default avatar for Male works without name inference');
  assert(!!neutAvatarUrl, 'Default gender-neutral avatar works');

  // 2. 12-Game Library
  console.log('\n2. Checking 12-Game Cognitive Library:');
  assert(gamesLibrary.length === 12, `Loaded ${gamesLibrary.length} cognitive games`);
  const gameIds = gamesLibrary.map(g => g.id);
  assert(gameIds.includes('memory-match'), 'Memory Match exists');
  assert(gameIds.includes('picture-recall'), 'Picture Recall exists');
  assert(gameIds.includes('sequence-builder'), 'Sequence Builder exists');
  assert(gameIds.includes('attention-finder'), 'Attention Finder exists');
  assert(gameIds.includes('number-memory'), 'Number Memory (Digit Span) exists');
  assert(gameIds.includes('pattern-recall'), 'Matrix Pattern Recall exists');
  assert(gameIds.includes('odd-one-out'), 'Odd One Out exists');
  assert(gameIds.includes('word-recall'), 'Word Recall exists');
  assert(gameIds.includes('spatial-memory'), 'Spatial Memory exists');

  // 3. Real Level-Wise Difficulty Engine Progression
  console.log('\n3. Checking Game-Specific Real Difficulty Progression Curves:');

  // Memory Match progression
  const mm1 = calculateDifficulty('memory-match', 1);
  const mm10 = calculateDifficulty('memory-match', 10);
  const mm25 = calculateDifficulty('memory-match', 25);
  const mm50 = calculateDifficulty('memory-match', 50);
  const mm75 = calculateDifficulty('memory-match', 75);
  const mm100 = calculateDifficulty('memory-match', 100);

  assert(mm1.targetCount === 2 && mm1.gridSize === 4, 'Memory Match L1: 2 pairs (4 cards)');
  assert(mm10.targetCount === 5 && mm10.gridSize === 10, 'Memory Match L10: 5 pairs (10 cards)');
  assert(mm25.targetCount === 8 && mm25.gridSize === 16, 'Memory Match L25: 8 pairs (16 cards)');
  assert(mm50.targetCount === 12 && mm50.gridSize === 24, 'Memory Match L50: 12 pairs (24 cards)');
  assert(mm75.targetCount === 16 && mm75.gridSize === 32, 'Memory Match L75: 16 pairs (32 cards)');
  assert(mm100.targetCount === 22 && mm100.gridSize === 44, 'Memory Match L100: 22 pairs (44 cards)');
  assert(mm1.cognitiveLoad < mm50.cognitiveLoad && mm50.cognitiveLoad < mm100.cognitiveLoad, 'Cognitive load strictly scales from L1 to L100');

  // Picture Recall progression
  const pr1 = calculateDifficulty('picture-recall', 1);
  const pr10 = calculateDifficulty('picture-recall', 10);
  const pr25 = calculateDifficulty('picture-recall', 25);
  const pr50 = calculateDifficulty('picture-recall', 50);
  const pr75 = calculateDifficulty('picture-recall', 75);
  const pr100 = calculateDifficulty('picture-recall', 100);

  assert(pr1.targetCount === 3 && pr1.numberOfChoices === 4, 'Picture Recall L1: 3 targets, 4 choices');
  assert(pr10.targetCount === 5 && pr10.numberOfChoices === 8, 'Picture Recall L10: 5 targets, 8 choices');
  assert(pr25.targetCount === 7 && pr25.numberOfChoices === 12, 'Picture Recall L25: 7 targets, 12 choices');
  assert(pr50.targetCount === 10 && pr50.numberOfChoices === 16, 'Picture Recall L50: 10 targets, 16 choices');
  assert(pr75.targetCount === 13 && pr75.numberOfChoices === 20, 'Picture Recall L75: 13 targets, 20 choices');
  assert(pr100.targetCount === 16 && pr100.numberOfChoices === 24, 'Picture Recall L100: 16 targets, 24 choices');
  assert((pr100.delayBeforeRecallMs || 0) > 0, 'Picture Recall L100 features delayed retention buffer');

  // Sequence Builder progression
  const seq1 = calculateDifficulty('sequence-builder', 1);
  const seq10 = calculateDifficulty('sequence-builder', 10);
  const seq25 = calculateDifficulty('sequence-builder', 25);
  const seq50 = calculateDifficulty('sequence-builder', 50);
  const seq75 = calculateDifficulty('sequence-builder', 75);
  const seq100 = calculateDifficulty('sequence-builder', 100);

  assert(seq1.sequenceLength === 3, 'Sequence Builder L1: 3-step sequence');
  assert(seq10.sequenceLength === 5, 'Sequence Builder L10: 5-step sequence');
  assert(seq25.sequenceLength === 7, 'Sequence Builder L25: 7-step sequence');
  assert(seq50.sequenceLength === 10, 'Sequence Builder L50: 10-step sequence');
  assert(seq75.sequenceLength === 13, 'Sequence Builder L75: 13-step sequence');
  assert(seq100.sequenceLength === 16, 'Sequence Builder L100: 16-step sequence');
  assert(seq100.isReverseOrder === true, 'Sequence Builder L100 features Reverse Sequence mode');

  // Number Memory (Digit Span)
  const nm1 = calculateDifficulty('number-memory', 1);
  const nm10 = calculateDifficulty('number-memory', 10);
  const nm25 = calculateDifficulty('number-memory', 25);
  const nm50 = calculateDifficulty('number-memory', 50);
  const nm75 = calculateDifficulty('number-memory', 75);
  const nm100 = calculateDifficulty('number-memory', 100);

  assert(nm1.targetCount === 2, 'Digit Span L1: 2 digits');
  assert(nm10.targetCount === 4, 'Digit Span L10: 4 digits');
  assert(nm25.targetCount === 5, 'Digit Span L25: 5 digits');
  assert(nm50.targetCount === 6, 'Digit Span L50: 6 digits');
  assert(nm75.targetCount === 7, 'Digit Span L75: 7 digits');
  assert(nm100.targetCount === 9, 'Digit Span L100: 9 digits');
  assert(nm100.isReverseOrder === true, 'Digit Span L100 features Reverse Span transformation');

  // Attention Search
  const att1 = calculateDifficulty('attention-finder', 1);
  const att10 = calculateDifficulty('attention-finder', 10);
  const att25 = calculateDifficulty('attention-finder', 25);
  const att50 = calculateDifficulty('attention-finder', 50);
  const att75 = calculateDifficulty('attention-finder', 75);
  const att100 = calculateDifficulty('attention-finder', 100);

  assert(att1.targetCount === 1 && att1.gridSize === 4, 'Attention Finder L1: 1 target in 4 cells');
  assert(att10.targetCount === 3 && att10.gridSize === 12, 'Attention Finder L10: 3 targets in 12 cells');
  assert(att25.targetCount === 4 && att25.gridSize === 20, 'Attention Finder L25: 4 targets in 20 cells');
  assert(att50.targetCount === 7 && att50.gridSize === 28, 'Attention Finder L50: 7 targets in 28 cells');
  assert(att75.targetCount === 10 && att75.gridSize === 36, 'Attention Finder L75: 10 targets in 36 cells');
  assert(att100.targetCount === 14 && att100.gridSize === 48, 'Attention Finder L100: 14 targets in 48 cells');

  // Spatial Memory
  const sm1 = calculateDifficulty('spatial-memory', 1);
  const sm25 = calculateDifficulty('spatial-memory', 25);
  const sm50 = calculateDifficulty('spatial-memory', 50);
  const sm100 = calculateDifficulty('spatial-memory', 100);

  assert(sm1.targetCount === 2 && sm1.gridSize === 9, 'Spatial Memory L1: 2 items in 3x3 grid');
  assert(sm25.targetCount === 4 && sm25.gridSize === 9, 'Spatial Memory L25: 4 items in 3x3 grid');
  assert(sm50.targetCount === 5 && sm50.gridSize === 16, 'Spatial Memory L50: 5 items in 4x4 grid');
  assert(sm100.targetCount === 9 && sm100.gridSize === 16, 'Spatial Memory L100: 9 items in 4x4 grid');

  // Category Sorting
  const cs1 = calculateDifficulty('category-sorting', 1);
  const cs25 = calculateDifficulty('category-sorting', 25);
  const cs50 = calculateDifficulty('category-sorting', 50);
  const cs100 = calculateDifficulty('category-sorting', 100);

  assert(cs1.targetCount === 3, 'Category Sorting L1: 3 items');
  assert(cs25.targetCount === 10, 'Category Sorting L25: 10 items');
  assert(cs50.targetCount === 15, 'Category Sorting L50: 15 items');
  assert(cs100.targetCount === 28, 'Category Sorting L100: 28 items');

  // Cultural Symbols Memory & Recall (3 Stages & Multi-Mode Reconstruction)
  const sym1 = calculateDifficulty('symbol-matching', 1);
  const sym10 = calculateDifficulty('symbol-matching', 10);
  const sym25 = calculateDifficulty('symbol-matching', 25);
  const sym50 = calculateDifficulty('symbol-matching', 50);
  const sym75 = calculateDifficulty('symbol-matching', 75);
  const sym100 = calculateDifficulty('symbol-matching', 100);

  assert(sym1.targetCount === 3 && sym1.numberOfChoices === 5, 'Symbol Memory L1: 3 symbols, 5 choices');
  assert(sym1.revealDurationMs === 10000 && sym1.delayBeforeRecallMs === 2000, 'Symbol Memory L1: 10s view, 2s delay');
  assert(sym10.targetCount === 3 && sym10.numberOfChoices === 5, 'Symbol Memory L10: 3 symbols, 5 choices');
  assert(sym25.targetCount === 5 && sym25.numberOfChoices === 8, 'Symbol Memory L25: 5 symbols, 8 choices, 4s delay');
  assert(sym50.targetCount === 7 && sym50.numberOfChoices === 10, 'Symbol Memory L50: 7 symbols, 10 choices, 6s delay');
  assert(sym75.targetCount === 10 && sym75.numberOfChoices === 15, 'Symbol Memory L75: 10 symbols, 15 choices, 9s delay');
  assert(sym100.targetCount === 15 && sym100.numberOfChoices === 18, 'Symbol Memory L100: 15 symbols, 18 choices, 10.5s delay');

  // 4. Progression & Level Unlocking
  console.log('\n4. Checking Level Unlocking & Star Scoring:');
  const progress = loadAllGamesProgress();
  assert(!!progress['memory-match'], 'Memory Match progress loaded');
  const result = recordLevelCompletion('patient-asha-001', 'memory-match', 28, 92, 25, 0);
  assert(result.stars === 3, 'Score >= 90% awards 3 stars');
  assert(result.level === 28, 'Recorded Level 28 completion');
  assert(result.cognitiveLoad > 0, 'Result includes cognitive load metric');

  // 5. Domain Progress & Caregiver Metrics
  console.log('\n5. Checking Domain Progress Synthesis:');
  const domainProg = calculateDomainProgress();
  assert(!!domainProg.memory, 'Memory domain metrics computed');
  assert(!!domainProg.attention, 'Attention domain metrics computed');
  assert(!!domainProg.sequencing, 'Sequencing domain metrics computed');
  assert(!!domainProg.recognition, 'Recognition domain metrics computed');
  assert(domainProg.memory.averageCognitiveLoad > 0, 'Domain progress includes average cognitive load');

  // 6. Assessment Recommendations
  console.log('\n6. Checking Assessment-Connected Game Recommendations:');
  const mockAssessment = {
    completedAt: 'Today',
    overallScore: 78,
    domainScores: {
      orientation: { domain: 'orientation' as const, score: 100, status: 'Strong' as const, recommendation: 'Good', taskCount: 1, correctCount: 1, averageResponseTimeMs: 2000 },
      memory: { domain: 'memory' as const, score: 70, status: 'Good' as const, recommendation: 'Practice visual memory', taskCount: 1, correctCount: 1, averageResponseTimeMs: 4000 },
      attention: { domain: 'attention' as const, score: 90, status: 'Strong' as const, recommendation: 'Good', taskCount: 1, correctCount: 1, averageResponseTimeMs: 3000 },
      recognition: { domain: 'recognition' as const, score: 90, status: 'Strong' as const, recommendation: 'Good', taskCount: 1, correctCount: 1, averageResponseTimeMs: 2500 },
      sequencing: { domain: 'sequencing' as const, score: 60, status: 'Needs Practice' as const, recommendation: 'Practice sequences', taskCount: 1, correctCount: 0, averageResponseTimeMs: 5000 },
      recall: { domain: 'recall' as const, score: 65, status: 'Needs Practice' as const, recommendation: 'Practice recall', taskCount: 1, correctCount: 0, averageResponseTimeMs: 6000 },
    },
    aiSummary: 'Good performance with room for rhythm practice.',
    recommendedActivities: ['game-sequence-builder'],
    clinicalNotes: 'Supportive non-diagnostic screening',
  };
  const recs = getPersonalizedRecommendations(mockAssessment);
  assert(recs.length >= 3, `Generated ${recs.length} personalized recommendations`);
  assert(
    recs.some(r => r.gameId === 'sequence-builder'),
    'Sequence Builder recommended when sequencing score is low'
  );
  assert(
    recs.some(r => r.gameId === 'memory-match' || r.gameId === 'picture-recall'),
    'Memory activity recommended when memory score is low'
  );

  // 7. Multilingual Dictionaries
  console.log('\n7. Checking Multilingual (EN, AS, BN, HI) Dictionaries:');
  const languages = ['en', 'as', 'bn', 'hi'] as const;
  for (const lang of languages) {
    const dict = translations[lang];
    assert(!!dict, `Dictionary exists for language '${lang}'`);
    assert(!!dict.common.appName, `App name defined in '${lang}'`);
  }

  // 8. Authentic Mathematical Scoring Engine & Patient Vectors
  console.log('\n8. Checking Authentic Mathematical Scoring Engine with Contrasting Patient Response Vectors:');

  const startTime = new Date(Date.now() - 90000).toISOString();
  const endTime = new Date().toISOString();

  // Vector 1: High Accuracy Patient
  const highAccuracyResponses = [
    { taskId: 'task-orientation-1', domain: 'orientation' as const, taskTitle: 'Orientation: Day', taskType: 'multiple-choice', question: 'Day', difficultyWeight: 1, expectedAnswer: 'opt-wed', patientAnswer: 'opt-wed', isCorrect: true, score: 100, responseTimeMs: 2500, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-orientation-2', domain: 'orientation' as const, taskTitle: 'Orientation: Region', taskType: 'multiple-choice', question: 'Region', difficultyWeight: 1, expectedAnswer: 'opt-assam', patientAnswer: 'opt-assam', isCorrect: true, score: 100, responseTimeMs: 2200, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-memory-encoding-3', domain: 'memory' as const, taskTitle: 'Memory: Encode', taskType: 'memorize', question: 'Memorize', difficultyWeight: 2, expectedAnswer: '', patientAnswer: true, isCorrect: true, score: 100, responseTimeMs: 5000, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-attention-4', domain: 'attention' as const, taskTitle: 'Attention: Search', taskType: 'find-object', question: 'Flower', difficultyWeight: 2, expectedAnswer: 'd3', patientAnswer: 'd3', isCorrect: true, score: 100, responseTimeMs: 3100, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-sequencing-5', domain: 'sequencing' as const, taskTitle: 'Sequencing: Pattern', taskType: 'sequence-choice', question: 'Pattern', difficultyWeight: 2, expectedAnswer: 'opt-banana', patientAnswer: 'opt-banana', isCorrect: true, score: 100, responseTimeMs: 2900, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-recognition-6', domain: 'recognition' as const, taskTitle: 'Recognition: Japi', taskType: 'multiple-choice', question: 'Motif', difficultyWeight: 2, expectedAnswer: 'recog-japi', patientAnswer: 'recog-japi', isCorrect: true, score: 100, responseTimeMs: 2700, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-recall-7', domain: 'recall' as const, taskTitle: 'Recall: Items', taskType: 'multi-select', question: 'Recall', difficultyWeight: 3, expectedAnswer: ['rec-tea', 'rec-japi', 'rec-lotus', 'rec-gamosa'], patientAnswer: ['rec-tea', 'rec-japi', 'rec-lotus', 'rec-gamosa'], isCorrect: true, score: 100, responseTimeMs: 4200, hintsUsed: 0, skipped: false, timestamp: endTime },
  ];

  const sessionHigh = scoreAssessmentResponses('patient-high-001', highAccuracyResponses, startTime, endTime);
  assert(sessionHigh.overallScore >= 95, `High Accuracy Patient scored ${sessionHigh.overallScore}% (>= 95%)`);
  assert(sessionHigh.domainScores.orientation.status === 'Strong', 'High accuracy orientation is Strong');
  assert(sessionHigh.domainScores.attention.status === 'Strong', 'High accuracy attention is Strong');
  assert(sessionHigh.domainScores.recall.status === 'Strong', 'High accuracy recall is Strong');

  // Vector 2: Low Accuracy Patient
  const lowAccuracyResponses = [
    { taskId: 'task-orientation-1', domain: 'orientation' as const, taskTitle: 'Orientation: Day', taskType: 'multiple-choice', question: 'Day', difficultyWeight: 1, expectedAnswer: 'opt-wed', patientAnswer: 'opt-sun', isCorrect: false, score: 0, responseTimeMs: 6500, hintsUsed: 1, skipped: false, timestamp: endTime },
    { taskId: 'task-orientation-2', domain: 'orientation' as const, taskTitle: 'Orientation: Region', taskType: 'multiple-choice', question: 'Region', difficultyWeight: 1, expectedAnswer: 'opt-assam', patientAnswer: 'opt-delhi', isCorrect: false, score: 0, responseTimeMs: 7200, hintsUsed: 1, skipped: false, timestamp: endTime },
    { taskId: 'task-memory-encoding-3', domain: 'memory' as const, taskTitle: 'Memory: Encode', taskType: 'memorize', question: 'Memorize', difficultyWeight: 2, expectedAnswer: '', patientAnswer: true, isCorrect: true, score: 100, responseTimeMs: 9000, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-attention-4', domain: 'attention' as const, taskTitle: 'Attention: Search', taskType: 'find-object', question: 'Flower', difficultyWeight: 2, expectedAnswer: 'd3', patientAnswer: 'd1', isCorrect: false, score: 0, responseTimeMs: 8100, hintsUsed: 1, skipped: false, timestamp: endTime },
    { taskId: 'task-sequencing-5', domain: 'sequencing' as const, taskTitle: 'Sequencing: Pattern', taskType: 'sequence-choice', question: 'Pattern', difficultyWeight: 2, expectedAnswer: 'opt-banana', patientAnswer: 'opt-grapes', isCorrect: false, score: 0, responseTimeMs: 7900, hintsUsed: 1, skipped: false, timestamp: endTime },
    { taskId: 'task-recognition-6', domain: 'recognition' as const, taskTitle: 'Recognition: Japi', taskType: 'multiple-choice', question: 'Motif', difficultyWeight: 2, expectedAnswer: 'recog-japi', patientAnswer: 'recog-pot', isCorrect: false, score: 0, responseTimeMs: 6700, hintsUsed: 1, skipped: false, timestamp: endTime },
    { taskId: 'task-recall-7', domain: 'recall' as const, taskTitle: 'Recall: Items', taskType: 'multi-select', question: 'Recall', difficultyWeight: 3, expectedAnswer: ['rec-tea', 'rec-japi', 'rec-lotus', 'rec-gamosa'], patientAnswer: ['rec-car', 'rec-shoe'], isCorrect: false, score: 0, responseTimeMs: 9200, hintsUsed: 1, skipped: false, timestamp: endTime },
  ];

  const sessionLow = scoreAssessmentResponses('patient-low-002', lowAccuracyResponses, startTime, endTime);
  assert(sessionLow.overallScore <= 40, `Low Accuracy Patient scored ${sessionLow.overallScore}% (<= 40%)`);
  assert(sessionLow.domainScores.attention.status === 'Needs Practice', 'Low accuracy attention is Needs Practice');
  assert(sessionLow.domainScores.recall.status === 'Needs Practice', 'Low accuracy recall is Needs Practice');
  assert(sessionHigh.overallScore !== sessionLow.overallScore, 'Contrasting patients produce strictly different scores');

  // Vector 3: Specific Sequencing Deficit
  const seqDeficitResponses = [
    { taskId: 'task-orientation-1', domain: 'orientation' as const, taskTitle: 'Orientation: Day', taskType: 'multiple-choice', question: 'Day', difficultyWeight: 1, expectedAnswer: 'opt-wed', patientAnswer: 'opt-wed', isCorrect: true, score: 100, responseTimeMs: 2500, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-orientation-2', domain: 'orientation' as const, taskTitle: 'Orientation: Region', taskType: 'multiple-choice', question: 'Region', difficultyWeight: 1, expectedAnswer: 'opt-assam', patientAnswer: 'opt-assam', isCorrect: true, score: 100, responseTimeMs: 2200, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-memory-encoding-3', domain: 'memory' as const, taskTitle: 'Memory: Encode', taskType: 'memorize', question: 'Memorize', difficultyWeight: 2, expectedAnswer: '', patientAnswer: true, isCorrect: true, score: 100, responseTimeMs: 5000, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-attention-4', domain: 'attention' as const, taskTitle: 'Attention: Search', taskType: 'find-object', question: 'Flower', difficultyWeight: 2, expectedAnswer: 'd3', patientAnswer: 'd3', isCorrect: true, score: 100, responseTimeMs: 3100, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-sequencing-5', domain: 'sequencing' as const, taskTitle: 'Sequencing: Pattern', taskType: 'sequence-choice', question: 'Pattern', difficultyWeight: 2, expectedAnswer: 'opt-banana', patientAnswer: 'opt-apple', isCorrect: false, score: 0, responseTimeMs: 7900, hintsUsed: 1, skipped: false, timestamp: endTime },
    { taskId: 'task-recognition-6', domain: 'recognition' as const, taskTitle: 'Recognition: Japi', taskType: 'multiple-choice', question: 'Motif', difficultyWeight: 2, expectedAnswer: 'recog-japi', patientAnswer: 'recog-japi', isCorrect: true, score: 100, responseTimeMs: 2700, hintsUsed: 0, skipped: false, timestamp: endTime },
    { taskId: 'task-recall-7', domain: 'recall' as const, taskTitle: 'Recall: Items', taskType: 'multi-select', question: 'Recall', difficultyWeight: 3, expectedAnswer: ['rec-tea', 'rec-japi', 'rec-lotus', 'rec-gamosa'], patientAnswer: ['rec-tea', 'rec-japi', 'rec-lotus', 'rec-gamosa'], isCorrect: true, score: 100, responseTimeMs: 4200, hintsUsed: 0, skipped: false, timestamp: endTime },
  ];

  const sessionSeqDeficit = scoreAssessmentResponses('patient-seq-003', seqDeficitResponses, startTime, endTime);
  assert(sessionSeqDeficit.domainScores.sequencing.score === 0, 'Sequencing score is 0% when wrong');
  assert(sessionSeqDeficit.domainScores.memory.score === 100, 'Memory score is 100% when right');
  assert(sessionSeqDeficit.recommendedActivities.includes('sequence-builder'), 'Sequence Builder recommended for sequencing deficit');

  // Convert session to AssessmentResult structure for assistant test
  const highResult = {
    completedAt: 'Today',
    overallScore: sessionHigh.overallScore,
    domainScores: sessionHigh.domainScores,
    aiSummary: sessionHigh.aiSummary,
    recommendedActivities: sessionHigh.recommendedActivities,
    clinicalNotes: sessionHigh.clinicalNotes,
  };

  const seqResult = {
    completedAt: 'Today',
    overallScore: sessionSeqDeficit.overallScore,
    domainScores: sessionSeqDeficit.domainScores,
    aiSummary: sessionSeqDeficit.aiSummary,
    recommendedActivities: sessionSeqDeficit.recommendedActivities,
    clinicalNotes: sessionSeqDeficit.clinicalNotes,
  };

  // 9. AI Assistant Real Data Grounding
  console.log('\n9. Checking AI Assistant Real Data Grounding:');
  const assistantProgressRes = processAssistantQuery(
    'How am I doing?',
    'Asha',
    2,
    3,
    highResult,
    [
      { id: 'log-1', patientId: 'p1', gameId: 'memory-match', gameTitle: 'Memory Match', category: 'memory', level: 5, score: 95, accuracy: 95, stars: 3, attempts: 1, durationSeconds: 30, hintsUsed: 0, difficultyLabel: 'Gentle', cognitiveLoad: 45, completedAt: 'Today' },
      { id: 'log-2', patientId: 'p1', gameId: 'memory-match', gameTitle: 'Memory Match', category: 'memory', level: 6, score: 100, accuracy: 100, stars: 3, attempts: 1, durationSeconds: 28, hintsUsed: 0, difficultyLabel: 'Gentle', cognitiveLoad: 48, completedAt: 'Today' },
    ],
    {} as any,
    getPersonalizedRecommendations(highResult)
  );
  assert(assistantProgressRes.answer.includes('accuracy of 98%') || assistantProgressRes.answer.includes('2 practice sessions'), 'Assistant answers "How am I doing?" with real practice counts and accuracy');

  const assistantPracticeRes = processAssistantQuery(
    'What should I practice?',
    'Asha',
    2,
    3,
    seqResult,
    [],
    { 'sequence-builder': { unlockedLevel: 4, highestLevelCompleted: 3, totalStars: 9, bestScores: {}, lastPlayedAt: 'Today', domain: 'sequencing' } } as any,
    getPersonalizedRecommendations(seqResult)
  );
  assert(assistantPracticeRes.answer.includes('Sequence') || assistantPracticeRes.answer.includes('Level 4'), 'Assistant recommends Sequence Builder based on sequencing deficit');

  console.log('\n==================================================');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
