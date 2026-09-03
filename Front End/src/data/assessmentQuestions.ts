import { AssessmentQuestion } from '../types';

/**
 * Returns the name of the current day of the week dynamically.
 */
function getCurrentDayInfo(): { today: string; options: { id: string; label: string; icon: string; isCorrect: boolean }[] } {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const icons = ['☀️', '☕', '🌱', '📅', '🌿', '🌙', '🌸'];
  const todayIdx = new Date().getDay();
  const todayName = days[todayIdx];

  // Pick 3 distractor days
  const otherIndices = [1, 2, 3, 4, 5, 6, 0].filter(i => i !== todayIdx).slice(0, 3);
  const options = [
    { id: `opt-${todayName.toLowerCase()}`, label: todayName, icon: icons[todayIdx], isCorrect: true },
    ...otherIndices.map(i => ({
      id: `opt-${days[i].toLowerCase()}`,
      label: days[i],
      icon: icons[i],
      isCorrect: false,
    })),
  ].sort(() => 0.5 - Math.random());

  return { today: todayName, options };
}

const dayInfo = getCurrentDayInfo();

export const assessmentTasks: AssessmentQuestion[] = [
  // ==========================================
  // 1. PHASE 0: WELCOME & GENTLE ORIENTATION
  // ==========================================
  {
    id: 'task-orientation-1',
    domain: 'orientation',
    taskTitle: 'Orientation: Today Check-in',
    instruction: 'Which day of the week is it today?',
    audioPromptText: 'Welcome! Let us start gently. Which day of the week is it today?',
    difficultyWeight: 1, // Easy
    type: 'multiple-choice',
    expectedOptionId: dayInfo.options.find(o => o.isCorrect)?.id,
    options: dayInfo.options,
    hint: 'Think about today morning and what day of the week it is.',
  },

  // ==========================================
  // 2. PHASE 1: MEMORY ENCODING
  // ==========================================
  {
    id: 'task-memory-encoding-2',
    domain: 'memory',
    taskTitle: 'Memory: Observe & Remember 4 Items',
    instruction: 'Look carefully at these 4 items. Take your time to observe them. You will recall them later.',
    audioPromptText: 'Look carefully at these four familiar items: Tea Cup, Japi Hat, Red Lotus, and Gamosa Cloth. Take your time to remember them.',
    difficultyWeight: 2, // Moderate
    type: 'memorize',
    memorizeItems: [
      { name: 'Tea Cup', icon: '🍵', description: 'Fresh morning warm tea' },
      { name: 'Japi Hat', icon: '👒', description: 'Traditional woven sun hat' },
      { name: 'Red Lotus', icon: '🌸', description: 'Serene pond blossom' },
      { name: 'Gamosa Cloth', icon: '🧣', description: 'Handcrafted woven cloth' },
    ],
    hint: 'Repeat the items softly to yourself: Tea Cup, Japi, Lotus, Gamosa.',
  },

  // ==========================================
  // 3. PHASE 2: VISUAL ATTENTION TARGET SEARCH
  // ==========================================
  {
    id: 'task-attention-3',
    domain: 'attention',
    taskTitle: 'Attention: Visual Target Search',
    instruction: 'Find and tap the bright Red Hibiscus flower among the garden items.',
    audioPromptText: 'Look at the garden items and tap on the bright red hibiscus flower.',
    difficultyWeight: 2, // Moderate
    type: 'find-object',
    targetItem: 'Red Hibiscus',
    expectedOptionId: 'att-target',
    distractors: [
      { id: 'att-d1', name: 'Green Leaf', icon: '🍃', isTarget: false },
      { id: 'att-d2', name: 'Yellow Daisy', icon: '🌼', isTarget: false },
      { id: 'att-target', name: 'Red Hibiscus', icon: '🌺', isTarget: true },
      { id: 'att-d3', name: 'Garden Tree', icon: '🌳', isTarget: false },
      { id: 'att-d4', name: 'White Blossom', icon: '💮', isTarget: false },
      { id: 'att-d5', name: 'Bamboo Shoot', icon: '🎋', isTarget: false },
    ],
    hint: 'Look for the flower with vibrant red petals in the middle.',
  },

  // ==========================================
  // 4. PHASE 3: TIMED PROCESSING SPEED
  // ==========================================
  {
    id: 'task-processing-4',
    domain: 'processing_speed',
    taskTitle: 'Processing Speed: Rapid Symbol Match',
    instruction: 'Look at the key shape in the circle. Tap the matching shape below as quickly as you can.',
    audioPromptText: 'Look at the blue diamond shape in the circle, then tap the matching blue diamond below.',
    difficultyWeight: 1, // Easy/Speed
    type: 'multiple-choice',
    expectedOptionId: 'spd-target',
    options: [
      { id: 'spd-target', label: 'Blue Diamond', icon: '🔷', isCorrect: true },
      { id: 'spd-d1', label: 'Orange Diamond', icon: '🔶', isCorrect: false },
      { id: 'spd-d2', label: 'Red Triangle', icon: '🔺', isCorrect: false },
      { id: 'spd-d3', label: 'Green Circle', icon: '🟢', isCorrect: false },
    ],
    hint: 'Match the blue diamond shape with 4 equal sides.',
  },

  // ==========================================
  // 5. PHASE 4: EXECUTIVE FUNCTION & PLANNING
  // ==========================================
  {
    id: 'task-executive-5',
    domain: 'executive_function',
    taskTitle: 'Executive Function: Morning Step Order',
    instruction: 'Arrange these 4 everyday morning steps in logical order from first to last.',
    audioPromptText: 'What is the natural order of a morning routine? Tap the steps in order from morning wakeup to taking medicine.',
    difficultyWeight: 2, // Moderate
    type: 'step-order',
    sequenceItems: [
      { name: 'Wake up in the morning', icon: '☀️' },
      { name: 'Brush teeth & wash face', icon: '🪥' },
      { name: 'Have breakfast & tea', icon: '🥣' },
      { name: 'Take morning medicines', icon: '💊' },
    ],
    hint: 'Start with waking up, followed by washing, eating breakfast, and taking medicine.',
  },

  // ==========================================
  // 6. PHASE 5: RECOGNITION (OLD VS NEW)
  // ==========================================
  {
    id: 'task-recognition-6',
    domain: 'recognition',
    taskTitle: 'Recognition: Identify Seen Item',
    instruction: 'Which of these 4 objects was shown in the memory activity at the start?',
    audioPromptText: 'Look at these four items. Which one was shown to you earlier in the memory check-in?',
    difficultyWeight: 2, // Moderate
    type: 'multiple-choice',
    expectedOptionId: 'recog-tea',
    options: [
      { id: 'recog-tea', label: 'Tea Cup', icon: '🍵', isCorrect: true },
      { id: 'recog-clock', label: 'Wall Clock', icon: '⏰', isCorrect: false },
      { id: 'recog-phone', label: 'Telephone', icon: '☎️', isCorrect: false },
      { id: 'recog-bag', label: 'Travel Bag', icon: '🎒', isCorrect: false },
    ],
    hint: 'Think back to the first four items you observed.',
  },

  // ==========================================
  // 7. PHASE 6: WORKING MEMORY REPRODUCTION
  // ==========================================
  {
    id: 'task-working-memory-7',
    domain: 'memory',
    taskTitle: 'Working Memory: 3-Symbol Pattern',
    instruction: 'Remember this 3-symbol sequence, then tap them in the same order.',
    audioPromptText: 'Remember this pattern: Apple, Blue Square, Star. Tap them in the same order.',
    difficultyWeight: 2, // Moderate
    type: 'sequence-choice',
    expectedOptionId: 'wm-star',
    sequenceItems: [
      { name: 'Apple', icon: '🍎' },
      { name: 'Blue Square', icon: '🟦' },
      { name: 'Star', icon: '⭐' },
    ],
    options: [
      { id: 'wm-apple', label: 'Apple', icon: '🍎', isCorrect: true },
      { id: 'wm-square', label: 'Blue Square', icon: '🟦', isCorrect: true },
      { id: 'wm-star', label: 'Star', icon: '⭐', isCorrect: true },
      { id: 'wm-banana', label: 'Banana', icon: '🍌', isCorrect: false },
      { id: 'wm-diamond', label: 'Diamond', icon: '🔶', isCorrect: false },
      { id: 'wm-moon', label: 'Moon', icon: '🌙', isCorrect: false },
    ],
    hint: 'Apple first, then Blue Square, then Star.',
  },

  // ==========================================
  // 8. PHASE 7: SECONDARY VISUAL ATTENTION (ODD ONE OUT)
  // ==========================================
  {
    id: 'task-attention-8',
    domain: 'attention',
    taskTitle: 'Attention: Odd One Out',
    instruction: 'Find the item that is different from the other three.',
    audioPromptText: 'Look at the four items below and tap on the one that is different.',
    difficultyWeight: 2, // Moderate
    type: 'multiple-choice',
    expectedOptionId: 'odd-target',
    options: [
      { id: 'odd-d1', label: 'Yellow Sunflower', icon: '🌻', isCorrect: false },
      { id: 'odd-d2', label: 'Yellow Sunflower', icon: '🌻', isCorrect: false },
      { id: 'odd-target', label: 'Blue Butterfly', icon: '🦋', isCorrect: true },
      { id: 'odd-d3', label: 'Yellow Sunflower', icon: '🌻', isCorrect: false },
    ],
    hint: 'Three are yellow flowers, one is a blue butterfly.',
  },

  // ==========================================
  // 9. PHASE 8: SECONDARY PROCESSING SPEED
  // ==========================================
  {
    id: 'task-processing-9',
    domain: 'processing_speed',
    taskTitle: 'Processing Speed: Rapid Number Comparison',
    instruction: 'Which number is larger? Tap the higher number.',
    audioPromptText: 'Between 28 and 64, which number is larger? Tap the larger number.',
    difficultyWeight: 1, // Speed
    type: 'multiple-choice',
    expectedOptionId: 'spd-64',
    options: [
      { id: 'spd-28', label: '28', icon: '🔢', isCorrect: false },
      { id: 'spd-64', label: '64', icon: '✨', isCorrect: true },
    ],
    hint: '64 is greater than 28.',
  },

  // ==========================================
  // 10. PHASE 9: DELAYED RECALL (CRITICAL MEMORY)
  // ==========================================
  {
    id: 'task-recall-10',
    domain: 'memory',
    taskTitle: 'Delayed Recall: Recall All 4 Items',
    instruction: 'Select all 4 items that were shown at the beginning of the check-in.',
    audioPromptText: 'Do you remember the four items from earlier? Tap all four items you saw: Tea Cup, Japi, Lotus, and Gamosa.',
    difficultyWeight: 3, // Hard / Core recall
    type: 'multi-select',
    options: [
      { id: 'rec-tea', label: 'Tea Cup', icon: '🍵', isCorrect: true },
      { id: 'rec-car', label: 'Motor Car', icon: '🚗', isCorrect: false },
      { id: 'rec-japi', label: 'Japi Hat', icon: '👒', isCorrect: true },
      { id: 'rec-shoe', label: 'Walking Shoes', icon: '👟', isCorrect: false },
      { id: 'rec-lotus', label: 'Red Lotus', icon: '🌸', isCorrect: true },
      { id: 'rec-book', label: 'Reading Book', icon: '📖', isCorrect: false },
      { id: 'rec-gamosa', label: 'Gamosa Cloth', icon: '🧣', isCorrect: true },
      { id: 'rec-clock', label: 'Alarm Clock', icon: '⏰', isCorrect: false },
    ],
    correctAnswers: ['rec-tea', 'rec-japi', 'rec-lotus', 'rec-gamosa'],
    hint: 'Recall the 4 items: Tea Cup, Japi Hat, Red Lotus, and Gamosa Cloth.',
  },

  // ==========================================
  // 11. PHASE 10: EXECUTIVE FUNCTION & CATEGORY RULE
  // ==========================================
  {
    id: 'task-executive-11',
    domain: 'executive_function',
    taskTitle: 'Executive Function: Category Rule',
    instruction: 'Rule: "Healthy Fresh Fruits". Which item belongs to this category?',
    audioPromptText: 'Look for the item that belongs to the category: Fresh Healthy Fruits.',
    difficultyWeight: 2, // Moderate
    type: 'multiple-choice',
    expectedOptionId: 'cat-apple',
    options: [
      { id: 'cat-apple', label: 'Fresh Apple', icon: '🍎', isCorrect: true },
      { id: 'cat-hammer', label: 'Iron Hammer', icon: '🔨', isCorrect: false },
      { id: 'cat-pen', label: 'Writing Pen', icon: '🖊️', isCorrect: false },
      { id: 'cat-shirt', label: 'Cotton Shirt', icon: '👕', isCorrect: false },
    ],
    hint: 'An apple is a fresh, delicious fruit.',
  },

  // ==========================================
  // 12. PHASE 11: COMFORT & SELF-REPORT CHECK-IN
  // ==========================================
  {
    id: 'task-comfort-12',
    domain: 'orientation',
    taskTitle: 'Comfort: How Did You Feel Today?',
    instruction: 'How comfortable did you feel while playing these activities?',
    audioPromptText: 'Almost done! How comfortable did you feel during these activities today?',
    difficultyWeight: 1, // Context
    type: 'multiple-choice',
    expectedOptionId: 'comf-good',
    options: [
      { id: 'comf-great', label: 'Very relaxed & enjoyable', icon: '😊', isCorrect: true },
      { id: 'comf-good', label: 'Felt good & engaging', icon: '🧠', isCorrect: true },
      { id: 'comf-challenging', label: 'A few tasks were challenging', icon: '🤔', isCorrect: true },
    ],
    hint: 'Choose how you felt — every effort helps Axiom personalize your experience.',
  },
];
