import { PatientProfile } from '../types';

export const defaultPatient: PatientProfile = {
  id: 'patient-asha-001',
  name: 'Asha Sharma',
  age: 68,
  gender: 'Female',
  location: 'Guwahati, Assam',
  region: 'North Eastern Region (NER)',
  photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  language: 'as', // Preferred Assamese
  interests: ['Gardening', 'Assam Tea Tasting', 'Traditional Weaving', 'Spiritual Music', 'Bihu Folklore'],
  cognitiveBaseline: 'Mild Cognitive Impairment / Memory Support',
  joinedDate: 'August 12, 2026',
  primaryCaregiverId: 'caregiver-priya-001',
};
