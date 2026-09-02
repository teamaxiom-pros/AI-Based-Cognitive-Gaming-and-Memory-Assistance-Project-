import { AssessmentQuestion } from '../types';

export const assessmentTasks: AssessmentQuestion[] = [
  // 1. ORIENTATION — Time of Day & Current Day
  {
    id: 'task-orientation-1',
    domain: 'orientation',
    taskTitle: 'Orientation: Time & Day',
    instruction: 'Which day of the week is it today?',
    audioPromptText: 'Please select which day of the week it is today.',
    difficultyWeight: 1, // Easy
    type: 'multiple-choice',
    expectedOptionId: 'opt-wed',
    options: [
      { id: 'opt-wed', label: 'Wednesday', icon: '📅', isCorrect: true },
      { id: 'opt-sun', label: 'Sunday', icon: '☀️', isCorrect: false },
      { id: 'opt-fri', label: 'Friday', icon: '🌙', isCorrect: false },
      { id: 'opt-mon', label: 'Monday', icon: '☕', isCorrect: false },
    ],
    hint: 'Think about today morning when you woke up.',
  },

  // 2. ORIENTATION — Geographic & Place Familiarity
  {
    id: 'task-orientation-2',
    domain: 'orientation',
    taskTitle: 'Orientation: Regional Location',
    instruction: 'Which beautiful region of India are you currently in?',
    audioPromptText: 'Which region of India are you currently residing in?',
    difficultyWeight: 1, // Easy
    type: 'multiple-choice',
    expectedOptionId: 'opt-assam',
    options: [
      { id: 'opt-assam', label: 'Assam / North Eastern Region', icon: '🏞️', isCorrect: true },
      { id: 'opt-delhi', label: 'Delhi NCR', icon: '🏛️', isCorrect: false },
      { id: 'opt-mumbai', label: 'Coastal Maharashtra', icon: '🌊', isCorrect: false },
      { id: 'opt-kerala', label: 'Southern Backwaters', icon: '🌴', isCorrect: false },
    ],
    hint: 'Think about the land of the Brahmaputra and tea gardens.',
  },

  // 3. MEMORY — Cultural Items Encoding (4 Items)
  {
    id: 'task-memory-encoding-3',
    domain: 'memory',
    taskTitle: 'Memory: Remember These 4 Cultural Items',
    instruction: 'Look carefully at these 4 familiar items. You will be asked to recall them later.',
    audioPromptText: 'Look carefully at these four familiar cultural items. Take your time to remember them. We will ask you about them shortly.',
    difficultyWeight: 2, // Medium
    type: 'memorize',
    memorizeItems: [
      { name: 'Assam Tea Cup', icon: '🍵', description: 'Fresh morning tea' },
      { name: 'Traditional Japi', icon: '👒', description: 'Assamese handwoven hat' },
      { name: 'Red Lotus', icon: '🌸', description: 'Sacred pond flower' },
      { name: 'Gamosa Cloth', icon: '🧣', description: 'Red & white woven cloth' },
    ],
    hint: 'Repeat the names softly: Tea Cup, Japi, Lotus, Gamosa.',
  },

  // 4. ATTENTION — Visual Target Search
  {
    id: 'task-attention-4',
    domain: 'attention',
    taskTitle: 'Attention: Find the Red Hibiscus',
    instruction: 'Tap on the Red Hibiscus blossom among the garden items.',
    audioPromptText: 'Please look at the garden grid and tap on the bright red hibiscus blossom.',
    difficultyWeight: 2, // Medium
    type: 'find-object',
    targetItem: 'Red Hibiscus',
    expectedOptionId: 'd3',
    distractors: [
      { id: 'd1', name: 'Green Leaf', icon: '🍃', isTarget: false },
      { id: 'd2', name: 'Yellow Marigold', icon: '🌼', isTarget: false },
      { id: 'd3', name: 'Red Hibiscus', icon: '🌺', isTarget: true },
      { id: 'd4', name: 'Green Tree', icon: '🌳', isTarget: false },
      { id: 'd5', name: 'White Daisy', icon: '💮', isTarget: false },
      { id: 'd6', name: 'Bamboo Sprout', icon: '🎋', isTarget: false },
    ],
    hint: 'Look for the bright red petals in the middle row.',
  },

  // 5. SEQUENCING — Pattern Logic & Continuity
  {
    id: 'task-sequencing-5',
    domain: 'sequencing',
    taskTitle: 'Sequencing: What Comes Next in the Pattern?',
    instruction: 'Look at the sequence below. What should replace the question mark?',
    audioPromptText: 'Look at the pattern: Apple, Banana, Apple. What should come next in the sequence?',
    difficultyWeight: 2, // Medium
    type: 'sequence-choice',
    expectedOptionId: 'opt-banana',
    sequenceItems: [
      { name: 'Apple', icon: '🍎' },
      { name: 'Banana', icon: '🍌' },
      { name: 'Apple', icon: '🍎' },
      { name: '?', icon: '❓' },
    ],
    options: [
      { id: 'opt-banana', label: 'Banana', icon: '🍌', isCorrect: true },
      { id: 'opt-apple', label: 'Apple', icon: '🍎', isCorrect: false },
      { id: 'opt-orange', label: 'Orange', icon: '🍊', isCorrect: false },
      { id: 'opt-grapes', label: 'Grapes', icon: '🍇', isCorrect: false },
    ],
    hint: 'Notice the alternating fruit rhythm: Apple, Banana, Apple...',
  },

  // 6. RECOGNITION — Traditional Motif Discrimination
  {
    id: 'task-recognition-6',
    domain: 'recognition',
    taskTitle: 'Recognition: Traditional Handloom Motif',
    instruction: 'Which of the following is the traditional Assam Japi sun-hat?',
    audioPromptText: 'Look at the choices below and select the traditional Assam Japi symbol.',
    difficultyWeight: 2, // Medium
    type: 'multiple-choice',
    expectedOptionId: 'recog-japi',
    options: [
      { id: 'recog-japi', label: 'Assam Japi Hat', icon: '👒', isCorrect: true },
      { id: 'recog-pot', label: 'Clay Kalash Pot', icon: '🏺', isCorrect: false },
      { id: 'recog-bell', label: 'Temple Bell', icon: '🔔', isCorrect: false },
      { id: 'recog-boat', label: 'River Boat', icon: '🛶', isCorrect: false },
    ],
    hint: 'Look for the conical woven hat with red and black velvet motifs.',
  },

  // 7. DELAYED RECALL — 4 Cultural Items from Task 3
  {
    id: 'task-recall-7',
    domain: 'recall',
    taskTitle: 'Delayed Recall: Which 4 Items Were Shown Earlier?',
    instruction: 'Select all 4 items that were shown in the memory activity earlier.',
    audioPromptText: 'Do you remember the four items from earlier? Tap all four items you saw.',
    difficultyWeight: 3, // Hard
    type: 'multi-select',
    options: [
      { id: 'rec-tea', label: 'Assam Tea Cup', icon: '🍵', isCorrect: true },
      { id: 'rec-car', label: 'Motor Car', icon: '🚗', isCorrect: false },
      { id: 'rec-japi', label: 'Traditional Japi', icon: '👒', isCorrect: true },
      { id: 'rec-shoe', label: 'Walking Shoes', icon: '👟', isCorrect: false },
      { id: 'rec-lotus', label: 'Red Lotus', icon: '🌸', isCorrect: true },
      { id: 'rec-gamosa', label: 'Gamosa Cloth', icon: '🧣', isCorrect: true },
    ],
    correctAnswers: ['rec-tea', 'rec-japi', 'rec-lotus', 'rec-gamosa'],
    hint: 'Recall the 4 items: Tea Cup, Japi, Lotus, and Gamosa.',
  },
];
