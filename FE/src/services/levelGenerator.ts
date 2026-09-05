import {
  GameCategory,
  GameLevelConfig,
  DifficultyTier,
  DifficultyLabel,
  ComplexityType,
  VisualSimilarityLevel,
} from '../types/gameTypes';

// Extended, culturally grounded North Eastern Region & traditional item library with visual similarity clusters
export const CULTURAL_ITEMS = [
  // Traditional Prayer, Devotion & Sacred Symbols (Cluster: Sacred Heritage)
  { id: 'diya', name: 'Evening Diya', icon: '🪔', category: 'Tradition', subcategory: 'Prayer', visualGroup: 'prayer' },
  { id: 'lotus', name: 'Red Water Lotus', icon: '🌸', category: 'Flora', subcategory: 'Water Flower', visualGroup: 'flower' },
  { id: 'chakra', name: 'Dharma Wheel', icon: '☸', category: 'Tradition', subcategory: 'Spiritual', visualGroup: 'spiritual' },
  { id: 'peacock', name: 'Mayura Peacock', icon: '🦚', category: 'Wildlife', subcategory: 'Avian', visualGroup: 'bird' },
  { id: 'temple', name: 'Kamakhya Shrine', icon: '🛕', category: 'Tradition', subcategory: 'Architecture', visualGroup: 'spiritual' },
  { id: 'shankha', name: 'Sacred Shankha', icon: '🐚', category: 'Tradition', subcategory: 'Prayer', visualGroup: 'prayer' },
  { id: 'bell', name: 'Brass Temple Bell', icon: '🔔', category: 'Tradition', subcategory: 'Prayer', visualGroup: 'metal' },
  { id: 'lamp', name: 'Incense Dhuna', icon: '🕯️', category: 'Tradition', subcategory: 'Prayer', visualGroup: 'prayer' },
  { id: 'kalash', name: 'Clay Kalash Pot', icon: '🏺', category: 'Household', subcategory: 'Kitchenware', visualGroup: 'earthenware' },
  { id: 'banyan', name: 'Sacred Banyan', icon: '🌳', category: 'Flora', subcategory: 'Canopy', visualGroup: 'plant' },

  // Musical Instruments (Cluster: Bihu & Folk Instruments)
  { id: 'dhol', name: 'Bihu Dhol', icon: '🥁', category: 'Music', subcategory: 'Percussion', visualGroup: 'instrument' },
  { id: 'pepa', name: 'Buffalo Horn Pepa', icon: '🎺', category: 'Music', subcategory: 'Wind', visualGroup: 'instrument' },
  { id: 'flute', name: 'Bamboo Flute', icon: '🪈', category: 'Music', subcategory: 'Wind', visualGroup: 'instrument' },
  { id: 'tokari', name: 'Tokari Instrument', icon: '🪕', category: 'Music', subcategory: 'String', visualGroup: 'instrument' },
  { id: 'cymbals', name: 'Taal Cymbals', icon: '🔔', category: 'Music', subcategory: 'Percussion', visualGroup: 'instrument' },
  { id: 'gogona', name: 'Bamboo Gogona', icon: '🎼', category: 'Music', subcategory: 'Reed', visualGroup: 'instrument' },

  // Handlooms & Textiles (Cluster: Silk & Weaving)
  { id: 'japi', name: 'Assam Japi', icon: '👒', category: 'Handicraft', subcategory: 'Headwear', visualGroup: 'woven' },
  { id: 'gamosa', name: 'Gamosa Cloth', icon: '🧣', category: 'Handloom', subcategory: 'Textile', visualGroup: 'fabric' },
  { id: 'silk', name: 'Muga Silk Spool', icon: '🧵', category: 'Handloom', subcategory: 'Thread', visualGroup: 'fabric' },
  { id: 'loom', name: 'Handloom Shuttle', icon: '🪡', category: 'Handloom', subcategory: 'Weaving', visualGroup: 'fabric' },
  { id: 'mekhela', name: 'Mekhela Sador', icon: '👘', category: 'Handloom', subcategory: 'Attire', visualGroup: 'fabric' },
  { id: 'eri_shawl', name: 'Eri Silk Shawl', icon: '🥻', category: 'Handloom', subcategory: 'Attire', visualGroup: 'fabric' },

  // Flora & Flowers (Cluster: NER Flora)
  { id: 'water_lotus', name: 'Water Lily', icon: '🪷', category: 'Flora', subcategory: 'Water Flower', visualGroup: 'flower' },
  { id: 'kopou', name: 'Kopou Orchid', icon: '🌺', category: 'Flora', subcategory: 'Wild Orchid', visualGroup: 'flower' },
  { id: 'marigold', name: 'Golden Marigold', icon: '🌼', category: 'Flora', subcategory: 'Garden Flower', visualGroup: 'flower' },
  { id: 'bamboo', name: 'Bamboo Shoots', icon: '🎍', category: 'Flora', subcategory: 'Canopy', visualGroup: 'plant' },
  { id: 'fern', name: 'Dhekia Forest Fern', icon: '🌿', category: 'Flora', subcategory: 'Greens', visualGroup: 'plant' },

  // Fruits & Agriculture (Cluster: Fresh Harvest)
  { id: 'tea', name: 'Assam Tea Leaf', icon: '🍵', category: 'Beverage', subcategory: 'Tea Estate', visualGroup: 'plantation' },
  { id: 'mango', name: 'Sweet Mango', icon: '🥭', category: 'Fruit', subcategory: 'Orchard', visualGroup: 'fruit' },
  { id: 'banana', name: 'Bhim Banana', icon: '🍌', category: 'Fruit', subcategory: 'Harvest', visualGroup: 'fruit' },
  { id: 'orange', name: 'Khasi Mandarin', icon: '🍊', category: 'Fruit', subcategory: 'Harvest', visualGroup: 'fruit' },
  { id: 'betel', name: 'Fresh Betel Leaf', icon: '🍃', category: 'Tradition', subcategory: 'Paan', visualGroup: 'plant' },

  // Wildlife (Cluster: Kaziranga Sanctuary)
  { id: 'rhino', name: 'Kaziranga Rhino', icon: '🦏', category: 'Wildlife', subcategory: 'Herbivore', visualGroup: 'animal' },
  { id: 'elephant', name: 'Gentle Elephant', icon: '🐘', category: 'Wildlife', subcategory: 'Mammal', visualGroup: 'animal' },
  { id: 'bird', name: 'Kingfisher Bird', icon: '🐦', category: 'Wildlife', subcategory: 'Avian', visualGroup: 'bird' },
  { id: 'hornbill', name: 'Great Hornbill', icon: '🦅', category: 'Wildlife', subcategory: 'Avian', visualGroup: 'bird' },
  { id: 'deer', name: 'Swamp Deer', icon: '🦌', category: 'Wildlife', subcategory: 'Mammal', visualGroup: 'animal' },

  // Heritage & Household (Cluster: Assam Home & Veranda)
  { id: 'sun', name: 'Riverfront Sunrise', icon: '🌅', category: 'Nature', subcategory: 'Landscape', visualGroup: 'scenery' },
  { id: 'boat', name: 'Wooden River Boat', icon: '🛶', category: 'Nature', subcategory: 'Transport', visualGroup: 'vehicle' },
  { id: 'chhatra', name: 'Traditional Chhatra', icon: '☂️', category: 'Handicraft', subcategory: 'Utility', visualGroup: 'woven' },
  { id: 'bowl', name: 'Singing Bowl', icon: '🥣', category: 'Household', subcategory: 'Kitchenware', visualGroup: 'metal' },
];

/**
 * Normalized 0 -> 1 progression progress for smooth mathematical curve calculations.
 */
export function getDifficultyProgress(level: number): number {
  const bounded = Math.max(1, Math.min(100, level));
  return (bounded - 1) / 99; // 0.0 at Level 1, 1.0 at Level 100
}

/**
 * Maps level to 1 of 10 clinical difficulty tiers.
 */
export function getDifficultyTier(level: number): DifficultyTier {
  const bounded = Math.max(1, Math.min(100, level));
  return Math.ceil(bounded / 10) as DifficultyTier;
}

/**
 * Tier titles providing elderly-friendly context.
 */
export function getTierName(tier: DifficultyTier): string {
  switch (tier) {
    case 1:
      return 'Gentle Foundation';
    case 2:
      return 'Basic Foundations';
    case 3:
      return 'Moderate Practice';
    case 4:
      return 'Expanding Horizon';
    case 5:
      return 'Focus & Reasoning';
    case 6:
      return 'Working Memory Flow';
    case 7:
      return 'Spatial Agility';
    case 8:
      return 'Pattern Discernment';
    case 9:
      return 'Advanced Sequencing';
    case 10:
      return 'Centennial Mastery';
  }
}

/**
 * User-facing non-punitive difficulty labels.
 */
export function getDifficultyLabel(tier: DifficultyTier): DifficultyLabel {
  if (tier <= 2) return 'Gentle';
  if (tier <= 4) return 'Easy';
  if (tier <= 6) return 'Moderate';
  if (tier <= 8) return 'Challenging';
  if (tier === 9) return 'Advanced';
  return 'Mastery';
}

/**
 * Returns cognitive load score (1 to 10) matching level.
 */
export function calculateCognitiveLoad(level: number): number {
  const progress = getDifficultyProgress(level);
  return Math.min(10, Math.max(1, Math.round(1 + progress * 9)));
}

/**
 * Main Game-Specific Level Difficulty Engine.
 * Scales gameplay parameters strictly level-by-level across all 100 levels.
 */
export function calculateDifficulty(gameId: GameCategory, levelNumber: number): GameLevelConfig {
  const level = Math.max(1, Math.min(100, levelNumber));
  const progress = getDifficultyProgress(level);
  const tier = getDifficultyTier(level);
  const tierName = getTierName(tier);
  const difficultyLabel = getDifficultyLabel(tier);
  const cognitiveLoad = calculateCognitiveLoad(level);

  // Determine Complexity Type based on milestones
  let complexityType: ComplexityType = 'Direct';
  if (level >= 95) complexityType = 'Mastery-Challenge';
  else if (level >= 80) complexityType = 'Reverse-Sequence';
  else if (level >= 65) complexityType = 'Dual-Step-Rule';
  else if (level >= 50) complexityType = 'Delayed-Recall';
  else if (level >= 35) complexityType = 'Interference';
  else if (level >= 20) complexityType = 'Distractor-Loaded';

  // Determine Visual Similarity
  let visualSimilarity: VisualSimilarityLevel = 'Distinct';
  if (level >= 75) visualSimilarity = 'High-Similarity';
  else if (level >= 50) visualSimilarity = 'Subtle';
  else if (level >= 25) visualSimilarity = 'Moderate';

  // Base Scaffolding & Hints (Decays with level)
  const hintsAllowed = Math.max(0, Math.round(3.4 - progress * 2.8)); // 3 at L1 -> 2 at L25 -> 1 at L50 -> 0 at L90+
  const scaffoldingLevel = tier <= 2 ? 'High' : tier <= 5 ? 'Medium' : tier <= 8 ? 'Minimal' : 'None';

  // Game-specific quantitative parameters
  let targetCount = 2;
  let distractorCount = 0;
  let gridSize = 4;
  let numberOfChoices = 4;
  let sequenceLength = 3;
  let timeLimitSeconds = 90;
  let revealDurationMs = 8000;
  let delayBeforeRecallMs = 0;
  const specialRules: string[] = [];
  let isReverseOrder = false;

  switch (gameId) {
    // -------------------------------------------------------------
    // 1. MEMORY MATCH (Pairs scale: 2 pairs -> 22 pairs)
    // Level 1: 2 pairs (4 cards)
    // Level 10: 5 pairs (10 cards)
    // Level 25: 8 pairs (16 cards)
    // Level 50: 12 pairs (24 cards)
    // Level 75: 16 pairs (32 cards)
    // Level 100: 22 pairs (44 cards)
    // -------------------------------------------------------------
    case 'memory-match': {
      let pairs = 2;
      if (level >= 100) pairs = 22;
      else if (level >= 75) pairs = 16 + Math.floor(((level - 75) / 25) * 6);
      else if (level >= 50) pairs = 12 + Math.floor(((level - 50) / 25) * 4);
      else if (level >= 25) pairs = 8 + Math.floor(((level - 25) / 25) * 4);
      else if (level >= 10) pairs = 5 + Math.floor(((level - 10) / 15) * 3);
      else pairs = 2 + Math.floor(((level - 1) / 9) * 3);

      targetCount = Math.min(22, Math.max(2, pairs));
      gridSize = targetCount * 2;
      numberOfChoices = gridSize;
      timeLimitSeconds = Math.max(45, Math.round(90 - progress * 40));

      if (level >= 50) {
        specialRules.push('Visual similarity active: Similar handlooms & orchids included.');
      }
      if (level >= 75) {
        specialRules.push('High concentration: 32+ cards memory challenge.');
      }
      if (level === 100) {
        specialRules.push('Centennial Grand Memory: 44-card master retention.');
      }
      break;
    }

    // -------------------------------------------------------------
    // 2. PICTURE RECALL (Targets: 3 -> 16 pictures; Choices: 4 -> 24)
    // Level 1: 3 pictures (10s observe, 4 choices, 0s delay)
    // Level 10: 5 pictures (8.5s observe, 8 choices, 0s delay)
    // Level 25: 7 pictures (7.5s observe, 12 choices, 1.5s delay)
    // Level 50: 10 pictures (6.5s observe, 16 choices, 3s delay)
    // Level 75: 13 pictures (5.5s observe, 20 choices, 4s delay)
    // Level 100: 16 pictures (4.5s observe, 24 choices, 5s delay)
    // -------------------------------------------------------------
    case 'picture-recall': {
      let targets = 3;
      if (level >= 100) targets = 16;
      else if (level >= 75) targets = 13 + Math.floor(((level - 75) / 25) * 3);
      else if (level >= 50) targets = 10 + Math.floor(((level - 50) / 25) * 3);
      else if (level >= 25) targets = 7 + Math.floor(((level - 25) / 25) * 3);
      else if (level >= 10) targets = 5 + Math.floor(((level - 10) / 15) * 2);
      else targets = 3 + Math.floor(((level - 1) / 9) * 2);

      let distractors = 1;
      if (level >= 100) distractors = 8;
      else if (level >= 75) distractors = 7;
      else if (level >= 50) distractors = 6;
      else if (level >= 25) distractors = 5;
      else if (level >= 10) distractors = 3;
      else distractors = 1 + Math.floor(level / 5);

      targetCount = targets;
      distractorCount = distractors;
      numberOfChoices = targetCount + distractorCount;
      gridSize = numberOfChoices;

      revealDurationMs = Math.max(4500, Math.round(10000 - progress * 5500));
      delayBeforeRecallMs = level >= 20 ? Math.round(1000 + ((level - 20) / 80) * 4000) : 0;

      if (delayBeforeRecallMs > 0) {
        specialRules.push(`Delayed Retention: Hold items in mind during ${(delayBeforeRecallMs / 1000).toFixed(1)}s pause.`);
      }
      break;
    }

    // -------------------------------------------------------------
    // 3. SEQUENCE BUILDER (Steps: 3 -> 16 steps + Reverse Transformation)
    // Level 1: 3 items (3 palette choices)
    // Level 10: 5 items (4 palette choices)
    // Level 25: 7 items (5 palette choices)
    // Level 50: 10 items (6 palette choices)
    // Level 75: 13 items (7 palette choices)
    // Level 100: 16 items (8 palette choices) + Reverse Sequence
    // -------------------------------------------------------------
    case 'sequence-builder': {
      let steps = 3;
      if (level >= 100) steps = 16;
      else if (level >= 75) steps = 13 + Math.floor(((level - 75) / 25) * 3);
      else if (level >= 50) steps = 10 + Math.floor(((level - 50) / 25) * 3);
      else if (level >= 25) steps = 7 + Math.floor(((level - 25) / 25) * 3);
      else if (level >= 10) steps = 5 + Math.floor(((level - 10) / 15) * 2);
      else steps = 3 + Math.floor(((level - 1) / 9) * 2);

      sequenceLength = steps;
      targetCount = sequenceLength;
      gridSize = Math.min(8, Math.max(3, Math.round(3 + progress * 5))); // 3 to 8 choices
      numberOfChoices = gridSize;

      if (level >= 85) {
        isReverseOrder = level % 2 === 0 || level === 100;
        if (isReverseOrder) {
          specialRules.push('Reverse Working Memory: Tap the sequence in backwards order.');
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // 4. NUMBER MEMORY / DIGIT SPAN (Digits: 2 -> 9 digits)
    // Level 1: 2 digits (e.g. 27)
    // Level 10: 4 digits (e.g. 5824)
    // Level 25: 5 digits (e.g. 73916)
    // Level 50: 6 digits (e.g. 582741)
    // Level 75: 7 digits (e.g. 4819273)
    // Level 100: 9 digits + Reverse entry
    // -------------------------------------------------------------
    case 'number-memory': {
      let digits = 2;
      if (level >= 100) digits = 9;
      else if (level >= 75) digits = 7 + Math.floor(((level - 75) / 25) * 2);
      else if (level >= 50) digits = 6 + Math.floor(((level - 50) / 25) * 1);
      else if (level >= 25) digits = 5 + Math.floor(((level - 25) / 25) * 1);
      else if (level >= 10) digits = 4;
      else digits = 2 + Math.floor(((level - 1) / 9) * 2);

      targetCount = digits;
      gridSize = 10;
      numberOfChoices = 10;
      revealDurationMs = Math.max(3500, Math.round(4000 + targetCount * 450 - progress * 1500));
      delayBeforeRecallMs = level >= 30 ? Math.round(1500 + ((level - 30) / 70) * 2500) : 0;

      if (level >= 90) {
        isReverseOrder = level % 2 === 0 || level === 100;
        if (isReverseOrder) {
          specialRules.push('Reverse Digit Span: Enter the memorized digits in reverse order.');
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // 5. ATTENTION FINDER (Targets: 1 -> 14; Cells: 4 -> 48)
    // Level 1: 1 target in 4 cells
    // Level 10: 3 targets in 12 cells
    // Level 25: 4 targets in 20 cells
    // Level 50: 7 targets in 28 cells
    // Level 75: 10 targets in 36 cells
    // Level 100: 14 targets in 48 cells
    // -------------------------------------------------------------
    case 'attention-finder': {
      let targets = 1;
      let totalCells = 4;

      if (level >= 100) {
        targets = 14;
        totalCells = 48;
      } else if (level >= 75) {
        targets = 10 + Math.floor(((level - 75) / 25) * 4);
        totalCells = 36 + Math.floor(((level - 75) / 25) * 12);
      } else if (level >= 50) {
        targets = 7 + Math.floor(((level - 50) / 25) * 3);
        totalCells = 28 + Math.floor(((level - 50) / 25) * 8);
      } else if (level >= 25) {
        targets = 4 + Math.floor(((level - 25) / 25) * 3);
        totalCells = 20 + Math.floor(((level - 25) / 25) * 8);
      } else if (level >= 10) {
        targets = 3 + Math.floor(((level - 10) / 15) * 1);
        totalCells = 12 + Math.floor(((level - 10) / 15) * 8);
      } else {
        targets = 1 + Math.floor(((level - 1) / 9) * 2);
        totalCells = 4 + Math.floor(((level - 1) / 9) * 8);
      }

      targetCount = targets;
      distractorCount = Math.max(3, totalCells - targets);
      gridSize = targetCount + distractorCount;
      numberOfChoices = gridSize;

      if (level >= 50) {
        specialRules.push('Visual similarity: Flowers share subtle petal & color hues.');
      }
      break;
    }

    // -------------------------------------------------------------
    // 6. ODD ONE OUT (Choices: 4 -> 12 choices + Category Subtlety)
    // Level 1: 4 choices (obvious fruit vs drum)
    // Level 10: 6 choices (fruit vs horn)
    // Level 25: 8 choices (handlooms vs pot)
    // Level 50: 8 choices (wildlife vs transport)
    // Level 75: 10 choices (traditional vs modern)
    // Level 100: 12 choices (subtle motif outlier)
    // -------------------------------------------------------------
    case 'odd-one-out': {
      let choices = 4;
      if (level >= 100) choices = 12;
      else if (level >= 75) choices = 10 + Math.floor(((level - 75) / 25) * 2);
      else if (level >= 50) choices = 8 + Math.floor(((level - 50) / 25) * 2);
      else if (level >= 25) choices = 8;
      else if (level >= 10) choices = 6 + Math.floor(((level - 10) / 15) * 2);
      else choices = 4 + Math.floor(((level - 1) / 9) * 2);

      targetCount = 1;
      numberOfChoices = choices;
      distractorCount = numberOfChoices - 1;
      gridSize = numberOfChoices;

      if (level >= 75) {
        specialRules.push('Subtle Discrimination: Compare fine material and traditional motif details.');
      }
      break;
    }

    // -------------------------------------------------------------
    // 7. SPATIAL MEMORY (Positions: 2 -> 9; Grid: 3x3 -> 4x4)
    // Level 1: 2 positions in 3x3 grid
    // Level 10: 3 positions in 3x3 grid
    // Level 25: 4 positions in 3x3 grid
    // Level 50: 5 positions in 4x4 grid (16 cells)
    // Level 75: 7 positions in 4x4 grid
    // Level 100: 9 positions in 4x4 grid
    // -------------------------------------------------------------
    case 'spatial-memory': {
      let positions = 2;
      let grid = 9;

      if (level >= 100) {
        positions = 9;
        grid = 16;
      } else if (level >= 75) {
        positions = 7 + Math.floor(((level - 75) / 25) * 2);
        grid = 16;
      } else if (level >= 50) {
        positions = 5 + Math.floor(((level - 50) / 25) * 2);
        grid = 16;
      } else if (level >= 25) {
        positions = 4 + Math.floor(((level - 25) / 25) * 1);
        grid = 9;
      } else if (level >= 10) {
        positions = 3;
        grid = 9;
      } else {
        positions = 2 + Math.floor(((level - 1) / 9) * 1);
        grid = 9;
      }

      targetCount = positions;
      gridSize = grid;
      numberOfChoices = gridSize;
      revealDurationMs = Math.max(3500, Math.round(8000 - progress * 4000));
      delayBeforeRecallMs = level >= 25 ? Math.round(1500 + ((level - 25) / 75) * 2500) : 0;

      if (gridSize === 16) {
        specialRules.push('Expanded 4x4 Spatial Field: 16 veranda matrix tiles.');
      }
      break;
    }

    // -------------------------------------------------------------
    // 8. CATEGORY SORTING (Items: 3 -> 28 items across bins)
    // Level 1: 3 items
    // Level 10: 6 items
    // Level 25: 10 items
    // Level 50: 15 items
    // Level 75: 20 items
    // Level 100: 28 items
    // -------------------------------------------------------------
    case 'category-sorting': {
      let items = 3;
      if (level >= 100) items = 28;
      else if (level >= 75) items = 20 + Math.floor(((level - 75) / 25) * 8);
      else if (level >= 50) items = 15 + Math.floor(((level - 50) / 25) * 5);
      else if (level >= 25) items = 10 + Math.floor(((level - 25) / 25) * 5);
      else if (level >= 10) items = 6 + Math.floor(((level - 10) / 15) * 4);
      else items = 3 + Math.floor(((level - 1) / 9) * 3);

      targetCount = items;
      gridSize = targetCount;
      numberOfChoices = 2; // 2 Category Bins
      break;
    }

    // -------------------------------------------------------------
    // 9. PATTERN RECALL (Lit Tiles: 2 -> 11; Grid: 3x3 -> 4x4)
    // -------------------------------------------------------------
    case 'pattern-recall': {
      let litTiles = 2;
      let grid = 9;

      if (level >= 100) {
        litTiles = 11;
        grid = 16;
      } else if (level >= 75) {
        litTiles = 8 + Math.floor(((level - 75) / 25) * 3);
        grid = 16;
      } else if (level >= 50) {
        litTiles = 6 + Math.floor(((level - 50) / 25) * 2);
        grid = 16;
      } else if (level >= 25) {
        litTiles = 4 + Math.floor(((level - 25) / 25) * 2);
        grid = 9;
      } else if (level >= 10) {
        litTiles = 3 + Math.floor(((level - 10) / 15) * 1);
        grid = 9;
      } else {
        litTiles = 2 + Math.floor(((level - 1) / 9) * 1);
        grid = 9;
      }

      targetCount = litTiles;
      gridSize = grid;
      numberOfChoices = gridSize;
      revealDurationMs = Math.max(3000, Math.round(6000 - progress * 3000));
      delayBeforeRecallMs = level >= 30 ? Math.round(1500 + ((level - 30) / 70) * 2000) : 0;
      break;
    }

    // -------------------------------------------------------------
    // 10. WORD RECALL (Words: 3 -> 16 words)
    // -------------------------------------------------------------
    case 'word-recall': {
      let words = 3;
      if (level >= 100) words = 16;
      else if (level >= 75) words = 13 + Math.floor(((level - 75) / 25) * 3);
      else if (level >= 50) words = 10 + Math.floor(((level - 50) / 25) * 3);
      else if (level >= 25) words = 7 + Math.floor(((level - 25) / 25) * 3);
      else if (level >= 10) words = 5 + Math.floor(((level - 10) / 15) * 2);
      else words = 3 + Math.floor(((level - 1) / 9) * 2);

      targetCount = words;
      distractorCount = Math.min(8, Math.max(1, Math.round(1 + progress * 7)));
      numberOfChoices = targetCount + distractorCount;
      gridSize = numberOfChoices;
      revealDurationMs = Math.max(4500, Math.round(9000 - progress * 4000));
      delayBeforeRecallMs = level >= 25 ? Math.round(1500 + ((level - 25) / 75) * 3500) : 0;
      break;
    }

    // -------------------------------------------------------------
    // 11. CULTURAL SYMBOL MEMORY & RECALL (`symbol-matching`)
    // 3 Stages: MEMORIZE -> MEMORY DELAY -> RECALL + MULTI-MODE RECONSTRUCTION
    // Level 1-10: 3 symbols, 10s view, 2s delay, 5 choices
    // Level 11-20: 4 symbols, 8s view, 3s delay, 6 choices
    // Level 21-30: 5 symbols, 7s view, 4s delay, 8 choices
    // Level 31-40: 6 symbols, 6s view, 5s delay, 9 choices
    // Level 41-50: 7 symbols, 6s view, 6s delay, 10 choices
    // Level 51-60: 8 symbols, 5s view, 7s delay, 12 choices
    // Level 61-70: 9 symbols, 5s view, 8s delay, 14 choices + Positional Memory
    // Level 71-80: 10 symbols, 4s view, 9s delay, 15 choices + Relative Neighbor Memory
    // Level 81-90: 11-12 symbols, 4s view, 10s delay, 16 choices + Sequence Order Recall
    // Level 91-100: 12-15 symbols, 3.5s view, 10.5s delay, 18 choices + Master Memory Reconstruction
    // -------------------------------------------------------------
    case 'symbol-matching': {
      let symbols = 3;
      let viewSecs = 10;
      let delaySecs = 2;
      let choices = 5;

      if (level >= 91) {
        symbols = 12 + Math.floor(((level - 91) / 9) * 3); // 12 to 15
        viewSecs = 3.5;
        delaySecs = 10.5;
        choices = 18;
      } else if (level >= 81) {
        symbols = 11 + (level % 2); // 11 to 12
        viewSecs = 4;
        delaySecs = 10;
        choices = 16;
      } else if (level >= 71) {
        symbols = 10;
        viewSecs = 4;
        delaySecs = 9;
        choices = 15;
      } else if (level >= 61) {
        symbols = 9;
        viewSecs = 5;
        delaySecs = 8;
        choices = 14;
      } else if (level >= 51) {
        symbols = 8;
        viewSecs = 5;
        delaySecs = 7;
        choices = 12;
      } else if (level >= 41) {
        symbols = 7;
        viewSecs = 6;
        delaySecs = 6;
        choices = 10;
      } else if (level >= 31) {
        symbols = 6;
        viewSecs = 6;
        delaySecs = 5;
        choices = 9;
      } else if (level >= 21) {
        symbols = 5;
        viewSecs = 7;
        delaySecs = 4;
        choices = 8;
      } else if (level >= 11) {
        symbols = 4;
        viewSecs = 8;
        delaySecs = 3;
        choices = 6;
      } else {
        symbols = 3;
        viewSecs = 10;
        delaySecs = 2;
        choices = 5;
      }

      targetCount = symbols;
      numberOfChoices = choices;
      distractorCount = Math.max(1, numberOfChoices - targetCount);
      gridSize = numberOfChoices;
      revealDurationMs = Math.round(viewSecs * 1000);
      delayBeforeRecallMs = Math.round(delaySecs * 1000);

      if (level >= 91) {
        specialRules.push('Master Memory Reconstruction: Recall all symbols, reconstruct grid positions and missing items.');
      } else if (level >= 71) {
        specialRules.push('Dual Memory: Remember both the symbols and their relative position/neighbors.');
      } else if (level >= 61) {
        specialRules.push('Positional Memory Active: Memorize the exact position of each cultural symbol.');
      } else if (level >= 41) {
        specialRules.push('Fine Visual Discrimination: Subtle traditional motif differences included.');
      }
      break;
    }

    // -------------------------------------------------------------
    // 12. OBJECT RECOGNITION (Choices: 3 -> 12)
    // -------------------------------------------------------------
    case 'object-recognition':
    default: {
      let choices = 3;
      if (level >= 100) choices = 12;
      else if (level >= 75) choices = 10 + Math.floor(((level - 75) / 25) * 2);
      else if (level >= 50) choices = 8 + Math.floor(((level - 50) / 25) * 2);
      else if (level >= 25) choices = 6 + Math.floor(((level - 25) / 25) * 2);
      else if (level >= 10) choices = 4 + Math.floor(((level - 10) / 15) * 2);
      else choices = 3 + Math.floor(((level - 1) / 9) * 1);

      targetCount = 1;
      numberOfChoices = choices;
      distractorCount = numberOfChoices - 1;
      gridSize = numberOfChoices;

      if (level >= 50) {
        specialRules.push('Fine Visual Discrimination: Subtle traditional motif differences.');
      }
      break;
    }
  }

  // Create progressive pool of items
  const poolSize = Math.min(CULTURAL_ITEMS.length, Math.round(6 + progress * (CULTURAL_ITEMS.length - 6)));
  const itemPool = CULTURAL_ITEMS.slice(0, poolSize).map(i => i.id);

  const milestoneBadge =
    level === 100
      ? '🏆 Centennial Grand Mastery Milestone'
      : level === 75
      ? '🌟 Advanced Cognitive Milestone'
      : level === 50
      ? '🏅 Intermediate Milestone'
      : level === 25
      ? '⭐ Foundation Milestone'
      : undefined;

  const instructionsText =
    level === 1
      ? `Level 1 • ${tierName}: Welcome! Learn the exercise calmly with large cards and plenty of guidance.`
      : level === 100
      ? `Level 100 • Centennial Grand Mastery: Peak cognitive exercise celebrating your dedication and focus!`
      : `Level ${level} • ${tierName} (Load: ${cognitiveLoad}/10): ${
          isReverseOrder ? 'Reverse challenge active. ' : ''
        }Take all the time you need.`;

  return {
    level,
    tier,
    tierName,
    difficultyLabel,
    cognitiveLoad,
    complexityType,
    visualSimilarity,
    targetCount,
    gridSize,
    distractorCount,
    numberOfChoices,
    sequenceLength,
    timeLimitSeconds,
    revealDurationMs,
    delayBeforeRecallMs,
    hintsAllowed,
    scaffoldingLevel,
    itemPool,
    instructionsText,
    specialRules,
    milestoneBadge,
    isReverseOrder,
  };
}

/**
 * Backward compatibility alias for calculateDifficulty.
 */
export const generateLevelConfig = calculateDifficulty;
