import { CognitiveDomain } from './index';

export type GameCategory =
  | 'memory-match'
  | 'picture-recall'
  | 'sequence-builder'
  | 'object-recognition'
  | 'number-memory'
  | 'pattern-recall'
  | 'attention-finder'
  | 'odd-one-out'
  | 'word-recall'
  | 'spatial-memory'
  | 'category-sorting'
  | 'symbol-matching';

export type DifficultyTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type DifficultyLabel =
  | 'Gentle'
  | 'Easy'
  | 'Moderate'
  | 'Challenging'
  | 'Advanced'
  | 'Mastery';

export type ComplexityType =
  | 'Direct'
  | 'Distractor-Loaded'
  | 'Interference'
  | 'Multi-Target'
  | 'Delayed-Recall'
  | 'Reverse-Sequence'
  | 'Category-Subtle'
  | 'Dual-Step-Rule'
  | 'Mastery-Challenge';

export type VisualSimilarityLevel =
  | 'Distinct'
  | 'Moderate'
  | 'Subtle'
  | 'High-Similarity';

export interface GameLevelConfig {
  level: number;
  tier: DifficultyTier;
  tierName: string;
  difficultyLabel: DifficultyLabel;
  cognitiveLoad: number; // 1 to 10
  complexityType: ComplexityType;
  visualSimilarity: VisualSimilarityLevel;

  // Quantitative gameplay parameters
  targetCount: number;
  gridSize: number;
  distractorCount: number;
  numberOfChoices: number;
  sequenceLength: number;

  // Temporal parameters (in seconds / ms)
  timeLimitSeconds?: number;
  revealDurationMs?: number;
  delayBeforeRecallMs?: number;

  // Assistance
  hintsAllowed: number;
  scaffoldingLevel: 'High' | 'Medium' | 'Minimal' | 'None';

  // Content & Rules
  itemPool: string[];
  instructionsText: string;
  specialRules?: string[];
  milestoneBadge?: string;
  isReverseOrder?: boolean;
}

export interface GameDefinition {
  id: GameCategory;
  title: string;
  category: CognitiveDomain;
  skillLabel: string;
  shortDescription: string;
  detailedInstructions: string;
  audioInstruction: string;
  icon: string;
  themeColor: string;
  accentColor: string;
  culturalNERTheme?: string;
  totalLevels: number; // 100
}

export interface GameProgressState {
  gameId: GameCategory;
  unlockedLevel: number; // 1 to 100
  currentLevel: number;
  highestCompletedLevel: number;
  levelScores: Record<
    number,
    {
      stars: number; // 1, 2, or 3
      score: number; // 0 to 100
      accuracy: number;
      bestTimeSeconds: number;
      completedAt: string;
      hintsUsed: number;
      cognitiveLoad: number;
      difficultyLabel: DifficultyLabel;
    }
  >;
  totalPlays: number;
  overallAccuracy: number;
}

export interface GameResultRecord {
  id: string;
  patientId: string;
  gameId: GameCategory;
  gameTitle: string;
  category: CognitiveDomain;
  level: number;
  score: number;
  accuracy: number;
  stars: number;
  attempts: number;
  durationSeconds: number;
  hintsUsed: number;
  difficultyLabel: DifficultyLabel;
  cognitiveLoad: number;
  completedAt: string;
  isLevelMilestone?: boolean;
}

export interface CognitiveDomainProgress {
  domain: CognitiveDomain;
  domainName: string;
  accuracyScore: number; // 0 - 100%
  completedLevelsTotal: number;
  targetWeeklySessions: number;
  statusLabel: 'Strong' | 'Steady Practice' | 'Developing';
  recommendedGameIds: GameCategory[];
  averageCognitiveLoad: number;
}

export interface GameRecommendation {
  gameId: GameCategory;
  reason: string;
  priority: 'High' | 'Recommended' | 'Explore';
  targetDomain: CognitiveDomain;
  suggestedLevel?: number;
}
