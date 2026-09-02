import { Appointment } from '../types';

export const initialAppointments: Appointment[] = [
  {
    id: 'apt-001',
    doctorName: 'Dr. N. Barua, MD',
    specialty: 'Consultant Neurologist & Cognitive Care',
    clinic: 'Guwahati Medical College & Hospital (GMCH)',
    dateTime: 'Tomorrow, August 14, 2026',
    time: '10:30 AM',
    notes: 'Quarterly cognitive health review and medication titration check.',
    reminderEnabled: true,
    location: 'Dispur Supermarket Area, GMCH Annex, Room 204',
  },
  {
    id: 'apt-002',
    doctorName: 'Dr. R. Goswami',
    specialty: 'Cardiologist & Hypertension Specialist',
    clinic: 'Apollo Hospitals Guwahati',
    dateTime: 'August 28, 2026',
    time: '04:00 PM',
    notes: 'Routine blood pressure monitoring and ECG check.',
    reminderEnabled: true,
    location: 'Christianbasti, GS Road, Guwahati',
  },
  {
    id: 'apt-003',
    doctorName: 'Dr. M. Kalita',
    specialty: 'Ophthalmologist (Vision Check)',
    clinic: 'Sri Sankaradeva Nethralaya',
    dateTime: 'September 12, 2026',
    time: '11:00 AM',
    notes: 'Annual eye examination for reading glasses adjustment.',
    reminderEnabled: false,
    location: 'Beltola, Guwahati',
  }
];
