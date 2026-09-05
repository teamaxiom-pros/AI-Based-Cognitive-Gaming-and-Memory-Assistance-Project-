import { RoutineItem } from '../types';

export const initialRoutineItems: RoutineItem[] = [
  {
    id: 'routine-wake',
    title: 'Morning Awakening & Warm Water',
    time: '07:00 AM',
    timeBlock: 'Morning',
    icon: '☀️',
    isCompleted: true,
    description: 'Gentle stretching and warm water with lemon.',
    completedAt: '07:15 AM',
  },
  {
    id: 'routine-tea-walk',
    title: 'Garden Walk & Morning Assam Tea',
    time: '07:45 AM',
    timeBlock: 'Morning',
    icon: '☕',
    isCompleted: true,
    description: '15 minutes garden stroll followed by warm tea with Vikram.',
    completedAt: '08:05 AM',
  },
  {
    id: 'routine-breakfast-meds',
    title: 'Healthy Breakfast & Morning Medicine',
    time: '08:30 AM',
    timeBlock: 'Morning',
    icon: '🥣',
    isCompleted: true,
    description: 'Oatmeal / Roti with Amlodipine blood pressure tablet.',
    completedAt: '08:40 AM',
  },
  {
    id: 'routine-game-time',
    title: 'Axiom Cognitive Brain Activity',
    time: '10:30 AM',
    timeBlock: 'Morning',
    icon: '🧠',
    isCompleted: true,
    description: 'Play Memory Match or Object Recall activity for 5 minutes.',
    completedAt: '10:42 AM',
  },
  {
    id: 'routine-lunch',
    title: 'Wholesome Lunch & Vitamin D',
    time: '01:00 PM',
    timeBlock: 'Afternoon',
    icon: '🍲',
    isCompleted: true,
    description: 'Rice, dal, vegetables, and calcium/vitamin softgel.',
    completedAt: '01:35 PM',
  },
  {
    id: 'routine-rest',
    title: 'Quiet Afternoon Rest & Music',
    time: '02:30 PM',
    timeBlock: 'Afternoon',
    icon: '🎵',
    isCompleted: false,
    description: 'Calm relaxation listening to soothing flute or devotional songs.',
  },
  {
    id: 'routine-family-talk',
    title: 'Family Call & Photo Memory Time',
    time: '05:00 PM',
    timeBlock: 'Evening',
    icon: '📞',
    isCompleted: false,
    description: 'Browse Family Book or speak with Priya & Rohan.',
  },
  {
    id: 'routine-dinner-donepezil',
    title: 'Dinner & Evening Memory Medicine',
    time: '08:00 PM',
    timeBlock: 'Evening',
    icon: '🌙',
    isCompleted: false,
    description: 'Light dinner and evening Donepezil tablet.',
  }
];

export function getLocalizedRoutineItem(
  item: RoutineItem,
  t: (key: string, params?: Record<string, string | number>) => string
): RoutineItem {
  if (!item) return item;
  const mapping: Record<string, { titleKey: string; descKey: string }> = {
    'routine-wake': { titleKey: 'routine.wakeTitle', descKey: 'routine.wakeDesc' },
    'routine-tea-walk': { titleKey: 'routine.morningWalkTitle', descKey: 'routine.morningWalkDesc' },
    'routine-breakfast-meds': { titleKey: 'routine.breakfastMedsTitle', descKey: 'routine.breakfastMedsDesc' },
    'routine-game-time': { titleKey: 'routine.gameTimeTitle', descKey: 'routine.gameTimeDesc' },
    'routine-lunch': { titleKey: 'routine.lunchTitle', descKey: 'routine.lunchDesc' },
    'routine-rest': { titleKey: 'routine.restMusicTitle', descKey: 'routine.restMusicDesc' },
    'routine-family-talk': { titleKey: 'routine.familyTalkTitle', descKey: 'routine.familyTalkDesc' },
    'routine-dinner-donepezil': { titleKey: 'routine.dinnerTitle', descKey: 'routine.dinnerDesc' },
  };

  const m = mapping[item.id];
  const title = m && t(m.titleKey) !== m.titleKey ? t(m.titleKey) : item.title;
  const description = m && t(m.descKey) !== m.descKey ? t(m.descKey) : item.description;
  const category = t('routine.wellnessCategory') || item.category || 'Wellness';

  return {
    ...item,
    title,
    description,
    category,
  };
}

