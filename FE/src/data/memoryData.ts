import { MemoryPerson, MemoryPlace, MemoryAlbumItem } from '../types';

export const memoryPeople: MemoryPerson[] = [
  {
    id: 'person-priya',
    name: 'Priya Sharma',
    relationship: 'Your Daughter',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    phone: '+91 98765 43211',
    location: 'Guwahati, Panbazar',
    audioTranscription: 'This is Priya, your eldest daughter. She works as a teacher in Guwahati and visits you every Tuesday and Sunday afternoon.',
    notes: 'Loves baking Assamese rice cakes (Pitha) with you.',
    recentInteraction: 'Visited yesterday at 4:30 PM',
  },
  {
    id: 'person-rohan',
    name: 'Rohan Sharma',
    relationship: 'Your Grandson',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    phone: '+91 98765 43212',
    location: 'Cotton University, Guwahati',
    audioTranscription: 'This is Rohan, your grandson. He is studying computer science and loves playing the Bihu flute for you on weekends.',
    notes: 'Always brings you fresh marigold flowers for your morning prayer.',
    recentInteraction: 'Called you on video call 2 days ago',
  },
  {
    id: 'person-vikram',
    name: 'Vikram Sharma',
    relationship: 'Your Son',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    location: 'Guwahati, Dispur',
    audioTranscription: 'This is Vikram, your caring son. He manages your morning medications and stays with you at your Guwahati home.',
    notes: 'Prepares your warm morning tea every day at 7:30 AM.',
    recentInteraction: 'Had breakfast with you this morning',
  },
  {
    id: 'person-ananya',
    name: 'Ananya Baruah',
    relationship: 'Your Childhood Friend',
    photoUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&auto=format&fit=crop&q=80',
    phone: '+91 98765 43213',
    location: 'Jorhat, Assam',
    audioTranscription: 'This is Ananya, your best friend since school in Jorhat. You both used to sing Bihu songs together.',
    notes: 'Shares memories of traditional silk weaving.',
    recentInteraction: 'Spoke on the phone last Sunday',
  }
];

export const memoryPlaces: MemoryPlace[] = [
  {
    id: 'place-brahmaputra',
    name: 'Brahmaputra Riverfront',
    location: 'Guwahati, Assam',
    photoUrl: 'https://images.unsplash.com/photo-1626014303757-646654877395?w=600&auto=format&fit=crop&q=80',
    description: 'The majestic river where you enjoy evening walks watching the golden sunset over the water.',
    significance: 'Your favorite peaceful evening spot for over 30 years.',
    audioTranscription: 'This is the Brahmaputra Riverfront in Guwahati, where you and your family love to take calm evening strolls.',
  },
  {
    id: 'place-kaziranga',
    name: 'Kaziranga National Park',
    location: 'Golaghat & Nagaon, Assam',
    photoUrl: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=600&auto=format&fit=crop&q=80',
    description: 'Home of the magnificent one-horned rhinoceros and lush green tea estates.',
    significance: 'Family vacation spot visited with your children.',
    audioTranscription: 'This is Kaziranga National Park in Assam, famous for green tea estates and peaceful wildlife safaris.',
  },
  {
    id: 'place-kamakhya',
    name: 'Kamakhya Temple Hill',
    location: 'Nilachal Hills, Guwahati',
    photoUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
    description: 'Ancient sacred hill with serene bells, fragrant incense, and panoramic views of the entire valley.',
    significance: 'Morning prayer and meditation visits.',
    audioTranscription: 'This is Nilachal Hill at Kamakhya, where you light prayer lamps and listen to morning temple bells.',
  }
];

export const memoryAlbums: MemoryAlbumItem[] = [
  {
    id: 'album-1',
    title: 'Rohan’s College Graduation',
    year: '2025',
    photoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    description: 'A joyful day in Guwahati celebrating Rohan receiving his honors degree with the whole family.',
    tags: ['Family', 'Celebration', 'Rohan'],
  },
  {
    id: 'album-2',
    title: 'Rongali Bihu Spring Festival',
    year: '2024',
    photoUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80',
    description: 'Wearing your golden Muga silk Mekhela Chador and enjoying homemade sweet pitha and dhol music.',
    tags: ['Bihu', 'Culture', 'Festival'],
  },
  {
    id: 'album-3',
    title: 'Our Home Tea Garden',
    year: '2023',
    photoUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&auto=format&fit=crop&q=80',
    description: 'Tending to the fragrant jasmine and Assam tea bushes in your backyard garden with Priya.',
    tags: ['Garden', 'Home', 'Nature'],
  }
];
