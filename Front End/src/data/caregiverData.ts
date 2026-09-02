import { CaregiverProfile } from '../types';

export const caregiverProfiles: CaregiverProfile[] = [
  {
    id: 'caregiver-priya-001',
    name: 'Priya Sharma',
    relationship: 'Daughter (Primary Caregiver)',
    phone: '+91 98765 43211',
    email: 'priya.sharma@axiomcare.in',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    patientIds: ['patient-asha-001'],
    role: 'Family Caregiver',
  },
  {
    id: 'caregiver-vikram-002',
    name: 'Vikram Sharma',
    relationship: 'Son (Co-Caregiver)',
    phone: '+91 98765 43210',
    email: 'vikram.sharma@axiomcare.in',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    patientIds: ['patient-asha-001'],
    role: 'Family Caregiver',
  },
  {
    id: 'clinician-dr-barua-003',
    name: 'Dr. N. Barua, MD',
    relationship: 'Consultant Neurologist (Guwahati Medical College & Hospital)',
    phone: '+91 94350 12345',
    email: 'dr.barua@gmch.gov.in',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    patientIds: ['patient-asha-001'],
    role: 'Clinical Specialist',
  }
];
