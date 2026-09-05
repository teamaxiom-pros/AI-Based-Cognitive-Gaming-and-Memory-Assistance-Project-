export type GenderOption = 'Female' | 'Male' | 'Non-binary / Other' | 'Prefer not to say';

export interface AvatarItem {
  id: string;
  name: string;
  category: 'female' | 'male' | 'neutral' | 'cultural';
  url: string;
  description: string;
}

export const avatarLibrary: AvatarItem[] = [
  // Female Avatars
  {
    id: 'avatar-f-1',
    name: 'Asha (Traditional Saree)',
    category: 'female',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    description: 'Elderly woman in warm maroon shawl',
  },
  {
    id: 'avatar-f-2',
    name: 'Mekhela Sador Elder',
    category: 'female',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    description: 'Elderly woman with friendly smile',
  },
  {
    id: 'avatar-f-3',
    name: 'Reading Glasses Elder',
    category: 'female',
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&auto=format&fit=crop&q=80',
    description: 'Gentle elder with reading glasses',
  },
  {
    id: 'avatar-f-4',
    name: 'Gardening Warmth',
    category: 'female',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    description: 'Senior woman enjoying nature',
  },

  // Male Avatars
  {
    id: 'avatar-m-1',
    name: 'Assam Kurta Elder',
    category: 'male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    description: 'Senior man in traditional attire',
  },
  {
    id: 'avatar-m-2',
    name: 'Classic Spectacles',
    category: 'male',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    description: 'Friendly smiling grandfather',
  },
  {
    id: 'avatar-m-3',
    name: 'Tea Garden Sage',
    category: 'male',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    description: 'Distinguished senior with kind expression',
  },
  {
    id: 'avatar-m-4',
    name: 'Silver Elder',
    category: 'male',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    description: 'Elder in warm knit cardigan',
  },

  // Neutral / Nature / Cultural Avatars
  {
    id: 'avatar-n-1',
    name: 'Assam Japi Emblem',
    category: 'neutral',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    description: 'Traditional Assam Japi sun hat emblem',
  },
  {
    id: 'avatar-n-2',
    name: 'Red Lotus Blossom',
    category: 'neutral',
    url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=400&auto=format&fit=crop&q=80',
    description: 'Calm morning water lotus',
  },
  {
    id: 'avatar-n-3',
    name: 'Brahmaputra Sunrise',
    category: 'neutral',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format&fit=crop&q=80',
    description: 'Peaceful riverfront sunrise in Assam',
  },
  {
    id: 'avatar-n-4',
    name: 'Tea Garden Green',
    category: 'neutral',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&auto=format&fit=crop&q=80',
    description: 'Fresh emerald green tea leaves',
  },
];

export const genderOptionsList: { id: GenderOption; label: string; description: string }[] = [
  { id: 'Female', label: 'Female', description: 'Elderly woman / she/her' },
  { id: 'Male', label: 'Male', description: 'Elderly man / he/him' },
  { id: 'Non-binary / Other', label: 'Non-binary / Other', description: 'Individual preferences' },
  { id: 'Prefer not to say', label: 'Prefer not to say', description: 'Keep gender-neutral' },
];

export function getDefaultAvatarForGender(gender?: GenderOption): string {
  if (gender === 'Female') return avatarLibrary[0].url;
  if (gender === 'Male') return avatarLibrary[4].url;
  return avatarLibrary[8].url; // Gender-neutral Japi / calm emblem
}
