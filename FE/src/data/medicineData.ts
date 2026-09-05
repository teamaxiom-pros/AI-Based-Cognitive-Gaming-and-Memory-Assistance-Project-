import { Medicine } from '../types';

export const initialMedicines: Medicine[] = [
  {
    id: 'med-amlodipine',
    name: 'Amlodipine',
    dosage: '5 mg',
    instructions: 'Take 1 tablet after breakfast with warm water',
    timeSlot: 'Morning',
    time: '08:30 AM',
    purpose: 'Blood Pressure Control',
    pillColor: 'bg-amber-100 border-amber-300 text-amber-800',
    pillShape: 'Round Tablet',
    isTakenToday: true,
    takenAt: '08:35 AM',
    history7Days: [true, true, true, true, true, true, true],
  },
  {
    id: 'med-donepezil',
    name: 'Donepezil',
    dosage: '5 mg',
    instructions: 'Take 1 tablet in the evening after dinner',
    timeSlot: 'Evening',
    time: '08:00 PM',
    purpose: 'Memory & Cognitive Support',
    pillColor: 'bg-teal-100 border-teal-300 text-teal-800',
    pillShape: 'Oval Caplet',
    isTakenToday: false,
    history7Days: [true, true, true, true, false, true, true],
  },
  {
    id: 'med-vitamin-d3',
    name: 'Vitamin D3 & Calcium',
    dosage: '1000 IU',
    instructions: 'Take 1 capsule with afternoon meal',
    timeSlot: 'Afternoon',
    time: '01:30 PM',
    purpose: 'Bone & Vitality Health',
    pillColor: 'bg-blue-100 border-blue-300 text-blue-800',
    pillShape: 'Softgel Capsule',
    isTakenToday: true,
    takenAt: '01:40 PM',
    history7Days: [true, true, true, true, true, true, true],
  },
  {
    id: 'med-multivitamin',
    name: 'B-Complex Fortified',
    dosage: '1 Capsule',
    instructions: 'Take in morning with breakfast',
    timeSlot: 'Morning',
    time: '08:30 AM',
    purpose: 'Nerve Health & Energy',
    pillColor: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    pillShape: 'Capsule',
    isTakenToday: true,
    takenAt: '08:36 AM',
    history7Days: [true, true, true, true, true, true, true],
  }
];

export function getLocalizedMedicine(
  med: Medicine,
  t: (key: string, params?: Record<string, string | number>) => string
): Medicine {
  if (!med) return med;
  const mapping: Record<string, { instructionKey: string }> = {
    'med-donepezil': { instructionKey: 'medicines.donepezilInstruction' },
    'med-amlodipine': { instructionKey: 'medicines.amlodipineInstruction' },
    'med-vitamin-d3': { instructionKey: 'medicines.vitaminD3Instruction' },
    'med-multivitamin': { instructionKey: 'medicines.multivitaminInstruction' },
  };

  const m = mapping[med.id];
  const instructions = m && t(m.instructionKey) !== m.instructionKey ? t(m.instructionKey) : med.instructions;

  return {
    ...med,
    instructions,
  };
}

