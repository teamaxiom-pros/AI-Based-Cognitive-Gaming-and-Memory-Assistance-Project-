import { GameCategory, DifficultyLabel } from '../types/gameTypes';
import { getGameProgress } from './gameProgressionService';

export interface AdaptiveSuggestion {
  suggestedLevel: number;
  difficultyLabel: DifficultyLabel;
  supportiveNote: string;
  hasExtraHints: boolean;
}

export function getAdaptiveDifficultySuggestion(gameId: GameCategory): AdaptiveSuggestion {
  const progress = getGameProgress(gameId);
  const currentLvl = progress.unlockedLevel;

  // Inspect recent level performance
  const recentScores = Object.entries(progress.levelScores)
    .sort(([a], [b]) => Number(b) - Number(a))
    .slice(0, 3)
    .map(([, v]) => v.accuracy);

  const avgRecent =
    recentScores.length > 0
      ? recentScores.reduce((sum, val) => sum + val, 0) / recentScores.length
      : 85;

  if (avgRecent >= 92) {
    return {
      suggestedLevel: currentLvl,
      difficultyLabel: currentLvl > 50 ? 'Challenging' : 'Moderate',
      supportiveNote: 'Your recent accuracy has been exceptional. Ready for the next progression step!',
      hasExtraHints: false,
    };
  } else if (avgRecent <= 60) {
    return {
      suggestedLevel: Math.max(1, currentLvl - 1),
      difficultyLabel: 'Gentle',
      supportiveNote: 'Take your time. Gentle hints and untimed practice are available.',
      hasExtraHints: true,
    };
  }

  return {
    suggestedLevel: currentLvl,
    difficultyLabel: currentLvl > 60 ? 'Challenging' : currentLvl > 20 ? 'Moderate' : 'Gentle',
    supportiveNote: 'Steady, comfortable practice pace.',
    hasExtraHints: false,
  };
}
