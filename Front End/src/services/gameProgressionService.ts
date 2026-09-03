import {
  GameCategory,
  GameProgressState,
  GameResultRecord,
  CognitiveDomainProgress,
} from '../types/gameTypes';
import { gamesLibrary } from '../data/gamesLibraryData';
import { CognitiveDomain } from '../types';
import { calculateDifficulty, getDifficultyTier, getDifficultyLabel, calculateCognitiveLoad } from './levelGenerator';
import { apiService } from './apiService';

const STORAGE_KEY = 'axiom_game_progress_v2';
const RESULTS_KEY = 'axiom_game_results_log_v2';

export const initialGamesProgress: Record<GameCategory, GameProgressState> = {
  'memory-match': {
    gameId: 'memory-match',
    unlockedLevel: 28,
    currentLevel: 27,
    highestCompletedLevel: 27,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 18, completedAt: '2026-08-25', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
      10: { stars: 3, score: 95, accuracy: 95, bestTimeSeconds: 24, completedAt: '2026-08-28', hintsUsed: 0, cognitiveLoad: 2, difficultyLabel: 'Gentle' },
      20: { stars: 3, score: 92, accuracy: 92, bestTimeSeconds: 32, completedAt: '2026-08-30', hintsUsed: 1, cognitiveLoad: 3, difficultyLabel: 'Easy' },
      27: { stars: 3, score: 88, accuracy: 88, bestTimeSeconds: 42, completedAt: '2026-09-01', hintsUsed: 1, cognitiveLoad: 4, difficultyLabel: 'Moderate' },
    },
    totalPlays: 34,
    overallAccuracy: 91,
  },
  'picture-recall': {
    gameId: 'picture-recall',
    unlockedLevel: 19,
    currentLevel: 18,
    highestCompletedLevel: 18,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 12, completedAt: '2026-08-26', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
      10: { stars: 3, score: 90, accuracy: 90, bestTimeSeconds: 16, completedAt: '2026-08-29', hintsUsed: 0, cognitiveLoad: 2, difficultyLabel: 'Gentle' },
      18: { stars: 3, score: 85, accuracy: 85, bestTimeSeconds: 22, completedAt: '2026-09-01', hintsUsed: 1, cognitiveLoad: 3, difficultyLabel: 'Easy' },
    },
    totalPlays: 22,
    overallAccuracy: 88,
  },
  'sequence-builder': {
    gameId: 'sequence-builder',
    unlockedLevel: 13,
    currentLevel: 12,
    highestCompletedLevel: 12,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 15, completedAt: '2026-08-27', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
      10: { stars: 2, score: 75, accuracy: 75, bestTimeSeconds: 28, completedAt: '2026-08-31', hintsUsed: 1, cognitiveLoad: 2, difficultyLabel: 'Gentle' },
      12: { stars: 2, score: 78, accuracy: 78, bestTimeSeconds: 30, completedAt: '2026-09-01', hintsUsed: 1, cognitiveLoad: 2, difficultyLabel: 'Easy' },
    },
    totalPlays: 16,
    overallAccuracy: 79,
  },
  'attention-finder': {
    gameId: 'attention-finder',
    unlockedLevel: 15,
    currentLevel: 14,
    highestCompletedLevel: 14,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 14, completedAt: '2026-08-26', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
      10: { stars: 3, score: 92, accuracy: 92, bestTimeSeconds: 20, completedAt: '2026-08-30', hintsUsed: 0, cognitiveLoad: 2, difficultyLabel: 'Gentle' },
      14: { stars: 3, score: 90, accuracy: 90, bestTimeSeconds: 25, completedAt: '2026-09-01', hintsUsed: 0, cognitiveLoad: 2, difficultyLabel: 'Easy' },
    },
    totalPlays: 18,
    overallAccuracy: 93,
  },
  'object-recognition': {
    gameId: 'object-recognition',
    unlockedLevel: 10,
    currentLevel: 9,
    highestCompletedLevel: 9,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 10, completedAt: '2026-08-28', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
    },
    totalPlays: 11,
    overallAccuracy: 92,
  },
  'number-memory': {
    gameId: 'number-memory',
    unlockedLevel: 8,
    currentLevel: 7,
    highestCompletedLevel: 7,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 15, completedAt: '2026-08-29', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
    },
    totalPlays: 9,
    overallAccuracy: 84,
  },
  'pattern-recall': {
    gameId: 'pattern-recall',
    unlockedLevel: 7,
    currentLevel: 6,
    highestCompletedLevel: 6,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 14, completedAt: '2026-08-29', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
    },
    totalPlays: 8,
    overallAccuracy: 86,
  },
  'odd-one-out': {
    gameId: 'odd-one-out',
    unlockedLevel: 11,
    currentLevel: 10,
    highestCompletedLevel: 10,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 12, completedAt: '2026-08-28', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
    },
    totalPlays: 12,
    overallAccuracy: 94,
  },
  'word-recall': {
    gameId: 'word-recall',
    unlockedLevel: 6,
    currentLevel: 5,
    highestCompletedLevel: 5,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 16, completedAt: '2026-08-29', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
    },
    totalPlays: 7,
    overallAccuracy: 88,
  },
  'spatial-memory': {
    gameId: 'spatial-memory',
    unlockedLevel: 5,
    currentLevel: 4,
    highestCompletedLevel: 4,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 15, completedAt: '2026-08-30', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
    },
    totalPlays: 6,
    overallAccuracy: 85,
  },
  'category-sorting': {
    gameId: 'category-sorting',
    unlockedLevel: 9,
    currentLevel: 8,
    highestCompletedLevel: 8,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 14, completedAt: '2026-08-28', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
    },
    totalPlays: 10,
    overallAccuracy: 90,
  },
  'symbol-matching': {
    gameId: 'symbol-matching',
    unlockedLevel: 6,
    currentLevel: 5,
    highestCompletedLevel: 5,
    levelScores: {
      1: { stars: 3, score: 100, accuracy: 100, bestTimeSeconds: 11, completedAt: '2026-08-30', hintsUsed: 0, cognitiveLoad: 1, difficultyLabel: 'Gentle' },
    },
    totalPlays: 7,
    overallAccuracy: 93,
  },
};

export function loadAllGamesProgress(): Record<GameCategory, GameProgressState> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialGamesProgress, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Could not load game progress, using initial state:', e);
  }
  return initialGamesProgress;
}

export function saveAllGamesProgress(state: Record<GameCategory, GameProgressState>): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (e) {
    console.warn('Could not persist game progress:', e);
  }
}

export function getGameProgress(gameId: GameCategory): GameProgressState {
  const all = loadAllGamesProgress();
  return (
    all[gameId] || {
      gameId,
      unlockedLevel: 1,
      currentLevel: 1,
      highestCompletedLevel: 0,
      levelScores: {},
      totalPlays: 0,
      overallAccuracy: 100,
    }
  );
}

export function isLevelUnlocked(gameId: GameCategory, level: number): boolean {
  if (level <= 1) return true;
  const progress = getGameProgress(gameId);
  return level <= progress.unlockedLevel;
}

export function recordLevelCompletion(
  patientId: string,
  gameId: GameCategory,
  level: number,
  accuracy: number,
  durationSeconds: number,
  hintsUsed: number
): GameResultRecord {
  const all = loadAllGamesProgress();
  const current = all[gameId] || {
    gameId,
    unlockedLevel: 1,
    currentLevel: 1,
    highestCompletedLevel: 0,
    levelScores: {},
    totalPlays: 0,
    overallAccuracy: 100,
  };

  const gameDef = gamesLibrary.find(g => g.id === gameId);
  const levelCfg = calculateDifficulty(gameId, level);
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
  const score = Math.round(accuracy);
  const now = new Date().toISOString();

  // Update level score entry
  const existingScore = current.levelScores[level];
  current.levelScores[level] = {
    stars: Math.max(stars, existingScore?.stars || 0),
    score: Math.max(score, existingScore?.score || 0),
    accuracy: Math.max(accuracy, existingScore?.accuracy || 0),
    bestTimeSeconds: existingScore ? Math.min(durationSeconds, existingScore.bestTimeSeconds) : durationSeconds,
    completedAt: now,
    hintsUsed,
    cognitiveLoad: levelCfg.cognitiveLoad,
    difficultyLabel: levelCfg.difficultyLabel,
  };

  // Level unlock progression (Unlock next level up to 100)
  if (level >= current.unlockedLevel && level < 100) {
    current.unlockedLevel = level + 1;
  }
  current.currentLevel = Math.min(100, level + 1);
  current.highestCompletedLevel = Math.max(current.highestCompletedLevel, level);
  current.totalPlays += 1;

  // Recompute overall accuracy
  const scoreValues = Object.values(current.levelScores).map(s => s.accuracy);
  current.overallAccuracy = Math.round(
    scoreValues.reduce((acc, curr) => acc + curr, 0) / scoreValues.length
  );

  all[gameId] = current;
  saveAllGamesProgress(all);

  const resultRecord: GameResultRecord = {
    id: `result-${Date.now()}`,
    patientId,
    gameId,
    gameTitle: gameDef?.title || 'Cognitive Activity',
    category: gameDef?.category || 'memory',
    level,
    score,
    accuracy,
    stars,
    attempts: 1,
    durationSeconds,
    hintsUsed,
    difficultyLabel: levelCfg.difficultyLabel,
    cognitiveLoad: levelCfg.cognitiveLoad,
    completedAt: now,
    isLevelMilestone: level === 100 || level % 25 === 0,
  };

  // Save to local results log
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingLogs = JSON.parse(window.localStorage.getItem(RESULTS_KEY) || '[]');
      existingLogs.unshift(resultRecord);
      window.localStorage.setItem(RESULTS_KEY, JSON.stringify(existingLogs.slice(0, 100)));
    }
  } catch (e) {
    console.warn('Could not save result record log:', e);
  }

  // Sync session result asynchronously to Backend and Axiom AI session tracker
  apiService
    .recordGameSession({
      patientId: patientId || 'P001',
      gameId,
      gameTitle: resultRecord.gameTitle,
      domain: resultRecord.category,
      level,
      difficultyTier: getDifficultyTier(level),
      score,
      accuracy,
      durationSeconds,
      hintsUsed,
    })
    .catch(err => console.warn('[GameProgression] Session sync to backend skipped:', err));

  return resultRecord;
}

export function loadGameResultsLog(): GameResultRecord[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(RESULTS_KEY);
      return raw ? JSON.parse(raw) : [];
    }
  } catch (e) {
    console.warn('Could not load result record log:', e);
  }
  return [];
}

export function calculateDomainProgress(): Record<CognitiveDomain, CognitiveDomainProgress> {
  const allProgress = loadAllGamesProgress();

  const domainMap: Record<CognitiveDomain, { games: GameCategory[]; name: string }> = {
    memory: { games: ['memory-match', 'number-memory', 'pattern-recall'], name: 'Visual & Working Memory' },
    recall: { games: ['picture-recall', 'word-recall'], name: 'Short-term Recall' },
    attention: { games: ['attention-finder', 'odd-one-out'], name: 'Selective Attention' },
    recognition: { games: ['object-recognition', 'symbol-matching', 'spatial-memory'], name: 'Visual Recognition' },
    sequencing: { games: ['sequence-builder', 'category-sorting'], name: 'Temporal Sequencing' },
    orientation: { games: ['spatial-memory'], name: 'Spatial Orientation' },
    executive_function: { games: ['sequence-builder', 'category-sorting'], name: 'Executive Function' },
    processing_speed: { games: ['attention-finder', 'number-memory'], name: 'Processing Speed' },
  };

  const results: Partial<Record<CognitiveDomain, CognitiveDomainProgress>> = {};

  (Object.keys(domainMap) as CognitiveDomain[]).forEach(domain => {
    const info = domainMap[domain];
    const gamesInDomain = info.games.map(id => allProgress[id]).filter(Boolean);

    const totalCompleted = gamesInDomain.reduce((sum, g) => sum + g.highestCompletedLevel, 0);
    const avgAccuracy = Math.round(
      gamesInDomain.reduce((sum, g) => sum + g.overallAccuracy, 0) / (gamesInDomain.length || 1)
    );

    const avgCognitiveLoad = Math.round(
      gamesInDomain.reduce((sum, g) => {
        const lvl = g.highestCompletedLevel || 1;
        return sum + calculateCognitiveLoad(lvl);
      }, 0) / (gamesInDomain.length || 1)
    );

    const statusLabel =
      avgAccuracy >= 88 ? 'Strong' : avgAccuracy >= 70 ? 'Steady Practice' : 'Developing';

    results[domain] = {
      domain,
      domainName: info.name,
      accuracyScore: avgAccuracy,
      completedLevelsTotal: totalCompleted,
      targetWeeklySessions: 4,
      statusLabel,
      recommendedGameIds: info.games,
      averageCognitiveLoad: avgCognitiveLoad,
    };
  });

  return results as Record<CognitiveDomain, CognitiveDomainProgress>;
}
