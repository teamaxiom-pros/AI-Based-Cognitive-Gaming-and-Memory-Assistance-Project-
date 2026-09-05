export interface GameMappingInfo {
  aiActivity: string;
  gameId: string;
  gameTitle: string;
  domain: string;
  route: string;
  suggestedLevel: number;
  difficultyTier: number;
  difficultyLabel: 'Gentle' | 'Easy' | 'Moderate' | 'Challenging' | 'Advanced';
}

const AI_TO_FRONTEND_GAME_MAP: Record<
  string,
  {
    gameId: string;
    gameTitle: string;
    domain: string;
    route: string;
  }
> = {
  card_match: {
    gameId: 'memory-match',
    gameTitle: 'Assam Heritage Match',
    domain: 'memory',
    route: '/activities/memory-match',
  },
  story_recall: {
    gameId: 'picture-recall',
    gameTitle: 'Objects Tray Recall',
    domain: 'memory',
    route: '/activities/picture-recall',
  },
  item_recall: {
    gameId: 'picture-recall',
    gameTitle: 'Objects Tray Recall',
    domain: 'memory',
    route: '/activities/picture-recall',
  },
  target_tap: {
    gameId: 'attention-finder',
    gameTitle: 'Garden Target Search',
    domain: 'attention',
    route: '/activities/attention-finder',
  },
  spot_difference: {
    gameId: 'odd-one-out',
    gameTitle: 'Spot the Difference',
    domain: 'attention',
    route: '/activities/odd-one-out',
  },
  odd_one_out: {
    gameId: 'odd-one-out',
    gameTitle: 'Spot the Difference',
    domain: 'attention',
    route: '/activities/odd-one-out',
  },
  quick_tap: {
    gameId: 'attention-finder',
    gameTitle: 'Garden Target Search',
    domain: 'processing_speed',
    route: '/activities/attention-finder',
  },
  sorting_sprint: {
    gameId: 'category-sorting',
    gameTitle: 'Everyday Category Sort',
    domain: 'processing_speed',
    route: '/activities/category-sorting',
  },
  sequence_builder: {
    gameId: 'sequence-builder',
    gameTitle: 'Rhythm Sequence Builder',
    domain: 'executive_function',
    route: '/activities/sequence-builder',
  },
  rule_switch: {
    gameId: 'category-sorting',
    gameTitle: 'Everyday Category Sort',
    domain: 'executive_function',
    route: '/activities/category-sorting',
  },
  object_recognition: {
    gameId: 'object-recognition',
    gameTitle: 'Silhouette & Object Match',
    domain: 'recognition',
    route: '/activities/object-recognition',
  },
  familiar_image: {
    gameId: 'spatial-memory',
    gameTitle: 'Room & Location Memory',
    domain: 'recognition',
    route: '/activities/spatial-memory',
  },
};

const DIFFICULTY_LABELS: Record<
  number,
  'Gentle' | 'Easy' | 'Moderate' | 'Challenging' | 'Advanced'
> = {
  1: 'Gentle',
  2: 'Easy',
  3: 'Moderate',
  4: 'Challenging',
  5: 'Advanced',
};

/**
 * Resolves an AI recommended activity name and difficulty number into frontend-ready game information.
 */
export function mapAiActivityToGame(
  aiActivity: string,
  aiDifficulty: number = 1
): GameMappingInfo {
  const normalizedActivity = aiActivity ? aiActivity.toLowerCase().trim() : '';
  const mapping = AI_TO_FRONTEND_GAME_MAP[normalizedActivity];

  const clampedDifficulty = Math.max(1, Math.min(5, Math.round(aiDifficulty)));
  const difficultyLabel = DIFFICULTY_LABELS[clampedDifficulty] || 'Gentle';

  // Calculate a representative starting level within that tier (e.g. tier 1 -> lvl 1, tier 2 -> lvl 12, tier 3 -> lvl 22)
  const suggestedLevel = (clampedDifficulty - 1) * 10 + 1;

  if (mapping) {
    return {
      aiActivity: normalizedActivity,
      gameId: mapping.gameId,
      gameTitle: mapping.gameTitle,
      domain: mapping.domain,
      route: mapping.route,
      suggestedLevel,
      difficultyTier: clampedDifficulty,
      difficultyLabel,
    };
  }

  // Fallback for unmapped or custom activities
  console.warn(
    `[GameAdapter] Unknown AI activity "${aiActivity}". Falling back to default memory game.`
  );
  return {
    aiActivity: normalizedActivity || 'unknown',
    gameId: 'memory-match',
    gameTitle: 'Assam Heritage Match',
    domain: 'memory',
    route: '/activities/memory-match',
    suggestedLevel,
    difficultyTier: clampedDifficulty,
    difficultyLabel,
  };
}

const FRONTEND_GAME_TO_AI_ACTIVITY_MAP: Record<
  string,
  { activity: string; domain: string }
> = {
  'memory-match': { activity: 'card_match', domain: 'memory' },
  'picture-recall': { activity: 'story_recall', domain: 'memory' },
  'object-recall': { activity: 'item_recall', domain: 'memory' },
  'attention-finder': { activity: 'target_tap', domain: 'attention' },
  'attention-search': { activity: 'target_tap', domain: 'attention' },
  'odd-one-out': { activity: 'odd_one_out', domain: 'attention' },
  'sequence-builder': { activity: 'sequence_builder', domain: 'executive_function' },
  'pattern-sequence': { activity: 'sequence_builder', domain: 'executive_function' },
  'category-sorting': { activity: 'sorting_sprint', domain: 'processing_speed' },
  'object-recognition': { activity: 'object_recognition', domain: 'recognition' },
  'spatial-memory': { activity: 'familiar_image', domain: 'recognition' },
  'number-memory': { activity: 'quick_tap', domain: 'processing_speed' },
  'pattern-recall': { activity: 'sequence_builder', domain: 'executive_function' },
  'symbol-matching': { activity: 'card_match', domain: 'memory' },
  'word-recall': { activity: 'story_recall', domain: 'memory' },
};

/**
 * Maps a frontend game identifier to official AI activity name and cognitive domain.
 */
export function mapFrontendGameToAiActivity(
  gameId: string,
  fallbackDomain: string = 'memory'
): { activity: string; domain: string } {
  const normalized = (gameId || '').toLowerCase().trim();
  if (FRONTEND_GAME_TO_AI_ACTIVITY_MAP[normalized]) {
    return FRONTEND_GAME_TO_AI_ACTIVITY_MAP[normalized];
  }
  return {
    activity: normalized.replace(/-/g, '_'),
    domain: fallbackDomain,
  };
}

